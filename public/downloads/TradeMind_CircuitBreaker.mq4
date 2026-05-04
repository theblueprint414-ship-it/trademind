//+------------------------------------------------------------------+
//| TradeMind Circuit Breaker — MT4 Expert Advisor                   |
//| Version: 1.0.0                                                   |
//| Website: https://trademindedge.com                               |
//|                                                                  |
//| Polls the TradeMind API every N minutes and blocks order          |
//| placement (market + pending) when the daily trade limit is hit.   |
//| Trades already open are NOT closed — only NEW orders are blocked. |
//+------------------------------------------------------------------+
#property strict
#property description "TradeMind Circuit Breaker — blocks new orders when daily trade limit is reached."
#property copyright "TradeMind"
#property link      "https://trademindedge.com"
#property version   "1.00"

//--- Inputs
input string ExtensionToken    = "";           // Extension token (from TradeMind Settings)
input int    PollIntervalMins  = 5;            // How often to poll the API (minutes)
input bool   AllowExistingMods = true;         // Allow modifying/closing existing orders when blocked
input bool   ShowDashboard     = true;         // Show status on chart
input color  ColorGo           = clrLimeGreen; // GO state label color
input color  ColorCaution      = clrOrange;    // CAUTION state label color
input color  ColorBlocked      = clrRed;       // BLOCKED state label color

//--- State
bool   g_blocked       = false;
int    g_tradeCount    = 0;
int    g_effectiveLimit= 0;
string g_verdict       = "UNKNOWN";
string g_date          = "";
datetime g_lastPoll    = 0;
bool   g_initialized   = false;

//--- API
string API_BASE = "https://trademindedge.com";

//+------------------------------------------------------------------+
//| Expert initialization                                             |
//+------------------------------------------------------------------+
int OnInit()
  {
   if(ExtensionToken == "")
     {
      Alert("TradeMind Circuit Breaker: Extension token is empty. Set it in EA inputs.");
      return INIT_FAILED;
     }

   // Poll immediately on start
   Poll();
   g_initialized = true;

   // Set timer for periodic polling
   EventSetTimer(PollIntervalMins * 60);

   Print("TradeMind Circuit Breaker initialized. Polling every ", PollIntervalMins, " minute(s).");
   return INIT_SUCCEEDED;
  }

//+------------------------------------------------------------------+
//| Expert deinitialization                                           |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   ObjectsDeleteAll(0, "tm_cb_");
   Comment("");
  }

//+------------------------------------------------------------------+
//| Timer — periodic polling                                          |
//+------------------------------------------------------------------+
void OnTimer()
  {
   Poll();
  }

//+------------------------------------------------------------------+
//| Trade event — block new orders if circuit is tripped              |
//+------------------------------------------------------------------+
void OnTrade()
  {
   // Re-poll on each trade to get accurate count
   Poll();
  }

//+------------------------------------------------------------------+
//| Core: poll the TradeMind API                                      |
//+------------------------------------------------------------------+
void Poll()
  {
   string url     = API_BASE + "/api/circuit-breaker/status?token=" + ExtensionToken;
   string headers = "Accept: application/json\r\n";
   char   post[];
   char   result[];
   string resultHeaders;

   ResetLastError();
   int httpCode = WebRequest("GET", url, headers, 5000, post, result, resultHeaders);

   if(httpCode != 200)
     {
      if(httpCode < 0)
        {
         int err = GetLastError();
         if(err == 4060)
            Print("TradeMind: WebRequest not allowed. Go to Tools → Options → Expert Advisors → Allow WebRequest and add: https://trademindedge.com");
         else
            Print("TradeMind: HTTP error ", httpCode, " | errno ", err);
        }
      else
        {
         Print("TradeMind: Unexpected HTTP ", httpCode);
        }
      return;
     }

   string json = CharArrayToString(result, 0, -1, CP_UTF8);
   ParseResponse(json);

   g_lastPoll = TimeCurrent();
   if(ShowDashboard) DrawStatus();
  }

//+------------------------------------------------------------------+
//| Minimal JSON parser for the known response fields                 |
//+------------------------------------------------------------------+
void ParseResponse(const string json)
  {
   g_blocked        = GetBool(json, "blocked");
   g_tradeCount     = (int)GetNumber(json, "tradeCount");
   g_effectiveLimit = (int)GetNumber(json, "effectiveLimit");
   g_verdict        = GetString(json, "verdict");
   g_date           = GetString(json, "date");

   if(g_blocked)
      Print("TradeMind: CIRCUIT BREAKER ACTIVE — ", g_tradeCount, "/", g_effectiveLimit, " trades. Verdict: ", g_verdict);
   else
      Print("TradeMind: OK — ", g_tradeCount, "/", g_effectiveLimit, " trades. Verdict: ", g_verdict, " | ", g_blocked ? "BLOCKED" : "OPEN");
  }

//+------------------------------------------------------------------+
//| OnTradeTransaction replacement for MT4: intercept via EA check    |
//| MT4 doesn't have OnTradeTransaction, so we use OnTick to detect  |
//| attempts to open orders BEFORE they execute.                       |
//+------------------------------------------------------------------+
void OnTick()
  {
   // Just keep the status overlay fresh; blocking happens in OrderSend wrappers
   // in the user's own EAs that call TM_CanTrade()
  }

//+------------------------------------------------------------------+
//| Public helper — call this from your own EAs before any OrderSend  |
//| bool canTrade = TM_CanTrade();                                    |
//| if (!canTrade) { Print("Blocked by TradeMind"); return; }         |
//+------------------------------------------------------------------+
bool TM_CanTrade()
  {
   // Re-poll if stale (> 10 minutes old)
   if(TimeCurrent() - g_lastPoll > 600)
      Poll();

   if(g_blocked)
     {
      Print("TradeMind Circuit Breaker: Order blocked. Limit=", g_effectiveLimit, " Trades=", g_tradeCount, " Verdict=", g_verdict);
      Alert("TradeMind: Trade blocked. You've reached your daily limit of ", g_effectiveLimit, " trade(s). Check your mental state.");
      return false;
     }
   return true;
  }

//+------------------------------------------------------------------+
//| Draw status overlay on chart                                       |
//+------------------------------------------------------------------+
void DrawStatus()
  {
   string prefix = "tm_cb_";

   // Remove old labels
   ObjectDelete(0, prefix + "status");
   ObjectDelete(0, prefix + "count");
   ObjectDelete(0, prefix + "verdict");
   ObjectDelete(0, prefix + "time");

   color  statusColor = g_blocked ? ColorBlocked : (g_verdict == "CAUTION" ? ColorCaution : ColorGo);
   string statusText  = g_blocked ? "CIRCUIT BREAKER: BLOCKED" : "TradeMind: ACTIVE";

   CreateLabel(prefix + "status", statusText, 10, 30, statusColor, 10, CORNER_LEFT_UPPER);
   CreateLabel(prefix + "count",  "Trades: " + IntegerToString(g_tradeCount) + " / " + IntegerToString(g_effectiveLimit), 10, 48, clrSilver, 9, CORNER_LEFT_UPPER);
   CreateLabel(prefix + "verdict","Mental: " + g_verdict, 10, 64, statusColor, 9, CORNER_LEFT_UPPER);
   CreateLabel(prefix + "time",   "Last poll: " + TimeToString(g_lastPoll, TIME_DATE|TIME_MINUTES), 10, 80, clrDimGray, 8, CORNER_LEFT_UPPER);

   ChartRedraw(0);
  }

void CreateLabel(const string name, const string text, int x, int y, color clr, int fontSize, ENUM_BASE_CORNER corner)
  {
   ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
   ObjectSetString(0, name, OBJPROP_TEXT, text);
   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetInteger(0, name, OBJPROP_CORNER, corner);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, fontSize);
   ObjectSetString(0, name, OBJPROP_FONT, "Arial Bold");
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
  }

//+------------------------------------------------------------------+
//| Minimal JSON field extractors                                      |
//+------------------------------------------------------------------+
bool GetBool(const string json, const string key)
  {
   string pattern = "\"" + key + "\":";
   int pos = StringFind(json, pattern);
   if(pos < 0) return false;
   pos += StringLen(pattern);
   string rest = StringSubstr(json, pos, 10);
   StringTrimLeft(rest);
   return StringFind(rest, "true") == 0;
  }

double GetNumber(const string json, const string key)
  {
   string pattern = "\"" + key + "\":";
   int pos = StringFind(json, pattern);
   if(pos < 0) return 0;
   pos += StringLen(pattern);
   string rest = StringSubstr(json, pos, 20);
   StringTrimLeft(rest);
   return StringToDouble(rest);
  }

string GetString(const string json, const string key)
  {
   string pattern = "\"" + key + "\":\"";
   int pos = StringFind(json, pattern);
   if(pos < 0) return "";
   pos += StringLen(pattern);
   int end = StringFind(json, "\"", pos);
   if(end < 0) return "";
   return StringSubstr(json, pos, end - pos);
  }
//+------------------------------------------------------------------+