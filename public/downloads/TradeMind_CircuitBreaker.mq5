//+------------------------------------------------------------------+
//| TradeMind Circuit Breaker — MT5 Expert Advisor                   |
//| Version: 1.0.0                                                   |
//| Website: https://trademindedge.com                               |
//|                                                                  |
//| Polls the TradeMind API and blocks new orders when the daily      |
//| trade limit is reached. Uses OnTradeTransaction to detect         |
//| real-time order events and re-poll after each trade.              |
//+------------------------------------------------------------------+
#property strict
#property description "TradeMind Circuit Breaker — blocks new orders when daily trade limit is reached."
#property copyright "TradeMind"
#property link      "https://trademindedge.com"
#property version   "1.00"

//--- Inputs
input string ExtensionToken    = "";           // Extension token (from TradeMind Settings)
input int    PollIntervalMins  = 5;            // Polling interval (minutes)
input bool   AllowExistingMods = true;         // Allow modifying/closing existing positions when blocked
input bool   ShowDashboard     = true;         // Show status overlay on chart
input color  ColorGo           = clrLimeGreen;
input color  ColorCaution      = clrOrange;
input color  ColorBlocked      = clrRed;

//--- State
bool     g_blocked        = false;
int      g_tradeCount     = 0;
int      g_effectiveLimit = 0;
string   g_verdict        = "UNKNOWN";
string   g_date           = "";
datetime g_lastPoll       = 0;

string API_BASE = "https://trademindedge.com";

//+------------------------------------------------------------------+
int OnInit()
  {
   if(ExtensionToken == "")
     {
      Alert("TradeMind: Extension token is empty. Set it in EA inputs.");
      return INIT_FAILED;
     }

   Poll();
   EventSetTimer(PollIntervalMins * 60);
   Print("TradeMind Circuit Breaker initialized. Polling every ", PollIntervalMins, " min(s).");
   return INIT_SUCCEEDED;
  }

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   ObjectsDeleteAll(0, "tm_cb_");
   Comment("");
  }

//+------------------------------------------------------------------+
void OnTimer()
  {
   Poll();
  }

//+------------------------------------------------------------------+
// Fires on every trade event — re-poll for accurate count
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest     &request,
                        const MqlTradeResult      &result)
  {
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
      Poll();
  }

//+------------------------------------------------------------------+
void OnTick()
  {
   // Overlay refresh handled by DrawStatus() in Poll()
  }

//+------------------------------------------------------------------+
void Poll()
  {
   string url     = API_BASE + "/api/circuit-breaker/status?token=" + ExtensionToken;
   string headers = "Accept: application/json\r\n";
   char   post[];
   char   resultData[];
   string resultHeaders;

   ResetLastError();
   int httpCode = WebRequest("GET", url, headers, "", 5000, post, resultData, resultHeaders);

   if(httpCode != 200)
     {
      int err = GetLastError();
      if(httpCode < 0 && err == 4014)
         Print("TradeMind: Enable WebRequest in Tools → Options → Expert Advisors and add: https://trademindedge.com");
      else
         Print("TradeMind: HTTP ", httpCode, " error ", err);
      return;
     }

   string json = CharArrayToString(resultData, 0, WHOLE_ARRAY, CP_UTF8);
   ParseResponse(json);

   g_lastPoll = TimeCurrent();
   if(ShowDashboard) DrawStatus();
  }

//+------------------------------------------------------------------+
void ParseResponse(const string json)
  {
   g_blocked        = GetBool(json, "blocked");
   g_tradeCount     = (int)GetNumber(json, "tradeCount");
   g_effectiveLimit = (int)GetNumber(json, "effectiveLimit");
   g_verdict        = GetString(json, "verdict");
   g_date           = GetString(json, "date");

   PrintFormat("TradeMind: %s | %d/%d trades | Verdict: %s",
               g_blocked ? "BLOCKED" : "OPEN",
               g_tradeCount, g_effectiveLimit, g_verdict);
  }

//+------------------------------------------------------------------+
//| Public helper — call before any order                             |
//|   if(!TM_CanTrade()) return;                                      |
//+------------------------------------------------------------------+
bool TM_CanTrade(bool allowModify = false)
  {
   if(TimeCurrent() - g_lastPoll > 600)
      Poll();

   if(g_blocked)
     {
      if(allowModify && AllowExistingMods)
         return true;  // let close/modify through

      PrintFormat("TradeMind: ORDER BLOCKED. Limit=%d Trades=%d Verdict=%s",
                  g_effectiveLimit, g_tradeCount, g_verdict);
      Alert(StringFormat("TradeMind: Blocked. Daily limit = %d trade(s). Verdict: %s", g_effectiveLimit, g_verdict));
      return false;
     }
   return true;
  }

//+------------------------------------------------------------------+
void DrawStatus()
  {
   string pfx = "tm_cb_";
   ObjectDelete(0, pfx + "line1");
   ObjectDelete(0, pfx + "line2");
   ObjectDelete(0, pfx + "line3");
   ObjectDelete(0, pfx + "line4");

   color  c    = g_blocked ? ColorBlocked : (g_verdict == "CAUTION" ? ColorCaution : ColorGo);
   string head = g_blocked ? "⛔ CIRCUIT BREAKER: BLOCKED" : "✅ TradeMind: ACTIVE";

   CreateLabel(pfx + "line1", head,                                                 10, 30, c,           10);
   CreateLabel(pfx + "line2", "Trades: " + (string)g_tradeCount + " / " + (string)g_effectiveLimit, 10, 48, clrSilver,   9);
   CreateLabel(pfx + "line3", "Mental: " + g_verdict,                               10, 64, c,            9);
   CreateLabel(pfx + "line4", "Poll: " + TimeToString(g_lastPoll, TIME_DATE|TIME_MINUTES), 10, 80, clrDimGray,  8);

   ChartRedraw(0);
  }

void CreateLabel(const string name, const string text, int x, int y, color clr, int sz)
  {
   ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
   ObjectSetString(0, name, OBJPROP_TEXT, text);
   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, sz);
   ObjectSetString(0, name, OBJPROP_FONT, "Arial Bold");
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
  }

//+------------------------------------------------------------------+
bool GetBool(const string json, const string key)
  {
   string pat = "\"" + key + "\":";
   int pos = StringFind(json, pat);
   if(pos < 0) return false;
   string rest = StringSubstr(json, pos + StringLen(pat), 10);
   StringTrimLeft(rest);
   return StringFind(rest, "true") == 0;
  }

double GetNumber(const string json, const string key)
  {
   string pat = "\"" + key + "\":";
   int pos = StringFind(json, pat);
   if(pos < 0) return 0;
   string rest = StringSubstr(json, pos + StringLen(pat), 20);
   StringTrimLeft(rest);
   return StringToDouble(rest);
  }

string GetString(const string json, const string key)
  {
   string pat = "\"" + key + "\":\"";
   int pos = StringFind(json, pat);
   if(pos < 0) return "";
   int start = pos + StringLen(pat);
   int end   = StringFind(json, "\"", start);
   if(end < 0) return "";
   return StringSubstr(json, start, end - start);
  }
//+------------------------------------------------------------------+