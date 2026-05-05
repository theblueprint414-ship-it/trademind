//+------------------------------------------------------------------+
//| TradeMind Circuit Breaker — MT4 Expert Advisor                   |
//| Version: 1.1.0                                                   |
//| Website: https://trademindedge.com                               |
//|                                                                  |
//| HOW IT WORKS:                                                    |
//| 1. Every 5 min → polls /api/circuit-breaker/status for block     |
//| 2. After each OrderSend → POSTs /api/circuit-breaker/report-trade|
//|    (instant count update, no waiting for next poll)              |
//| 3. TM_CanTrade() → call from your own EA before any OrderSend    |
//|                                                                  |
//| SETUP:                                                           |
//| Tools → Options → Expert Advisors → Allow WebRequest             |
//| Add URL: https://trademindedge.com                               |
//+------------------------------------------------------------------+
#property strict
#property description "TradeMind Circuit Breaker — blocks new orders when daily trade limit is reached."
#property copyright "TradeMind"
#property link      "https://trademindedge.com"
#property version   "1.10"

//--- Inputs
input string ExtensionToken    = "";           // Extension token (from TradeMind Settings)
input int    PollIntervalMins  = 5;            // How often to poll the API (minutes)
input bool   ReportTrades      = true;         // Report each trade to TradeMind instantly
input bool   ShowDashboard     = true;         // Show status overlay on chart
input color  ColorGo           = clrLimeGreen;
input color  ColorCaution      = clrOrange;
input color  ColorBlocked      = clrRed;

//--- State
bool   g_blocked       = false;
int    g_tradeCount    = 0;
int    g_effectiveLimit= 0;
string g_verdict       = "UNKNOWN";
string g_countSource   = "journal";
datetime g_lastPoll    = 0;
int    g_lastTicket    = -1;   // last known order ticket — for OnTrade detection

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
   Print("TradeMind Circuit Breaker v1.1 initialized.");
   return INIT_SUCCEEDED;
  }

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   ObjectsDeleteAll(0, "tm_cb_");
  }

//+------------------------------------------------------------------+
void OnTimer() { Poll(); }

//+------------------------------------------------------------------+
// OnTrade fires on every order state change — scan ALL orders to
// catch multiple simultaneous new tickets (e.g. basket orders).
void OnTrade()
  {
   if(!ReportTrades) return;
   for(int i = 0; i < OrdersTotal(); i++)
     {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) continue;
      if(OrderType() > OP_SELL) continue; // skip pending — only market fills
      int ticket = OrderTicket();
      if(ticket > g_lastTicket)
        {
         g_lastTicket = ticket;
         ReportTrade(OrderSymbol(), OrderType() == OP_BUY ? "long" : "short");
        }
     }
  }

//+------------------------------------------------------------------+
// OnTick: history fallback — catches fills that close immediately
// (market orders filled-and-closed before OnTrade fires on slow feeds).
void OnTick()
  {
   if(!ReportTrades) return;
   static int prevHistCount = 0;
   int curHistCount = OrdersHistoryTotal();
   if(curHistCount <= prevHistCount) { prevHistCount = curHistCount; return; }
   prevHistCount = curHistCount;
   for(int i = curHistCount - 1; i >= MathMax(curHistCount - 5, 0); i--)
     {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY)) continue;
      if(OrderType() > OP_SELL) continue;
      int ticket = OrderTicket();
      if(ticket > g_lastTicket)
        {
         g_lastTicket = ticket;
         ReportTrade(OrderSymbol(), OrderType() == OP_BUY ? "long" : "short");
        }
     }
  }

//+------------------------------------------------------------------+
// Report a new trade to TradeMind instantly (updates count without waiting for poll)
void ReportTrade(const string symbol, const string side)
  {
   string url = API_BASE + "/api/circuit-breaker/report-trade?token=" + ExtensionToken;
   string body = "{\"symbol\":\"" + symbol + "\",\"side\":\"" + side + "\"}";
   string headers = "Content-Type: application/json\r\nAccept: application/json\r\n";
   char   postData[];
   char   result[];
   string resultHeaders;
   StringToCharArray(body, postData, 0, StringLen(body));

   int code = WebRequest("POST", url, headers, 5000, postData, result, resultHeaders);
   if(code == 200)
     {
      // Parse inline — update g_tradeCount and g_blocked immediately
      string json = CharArrayToString(result, 0, -1, CP_UTF8);
      bool newBlocked = GetBool(json, "blocked");
      int newCount = (int)GetNumber(json, "tradeCount");
      if(newCount > 0) g_tradeCount = newCount;
      g_blocked = newBlocked;
      g_lastPoll = TimeCurrent();
      if(ShowDashboard) DrawStatus();
      if(g_blocked)
         Alert("TradeMind: Trade limit reached (" + IntegerToString(g_tradeCount) + "/" + IntegerToString(g_effectiveLimit) + "). New orders are blocked.");
     }
  }

//+------------------------------------------------------------------+
void Poll()
  {
   string url = API_BASE + "/api/circuit-breaker/status?token=" + ExtensionToken;
   string headers = "Accept: application/json\r\n";
   char   post[];
   char   result[];
   string resultHeaders;

   ResetLastError();
   int code = WebRequest("GET", url, headers, 5000, post, result, resultHeaders);
   if(code != 200)
     {
      int err = GetLastError();
      if(err == 4060) Print("TradeMind: Add https://trademindedge.com to Tools → Options → Expert Advisors → Allow WebRequest");
      else Print("TradeMind: Poll error HTTP ", code, " errno ", err);
      return;
     }

   string json = CharArrayToString(result, 0, -1, CP_UTF8);
   g_blocked        = GetBool(json, "blocked");
   g_tradeCount     = (int)GetNumber(json, "tradeCount");
   g_effectiveLimit = (int)GetNumber(json, "effectiveLimit");
   g_verdict        = GetString(json, "verdict");
   g_countSource    = GetString(json, "source");
   g_lastPoll       = TimeCurrent();

   PrintFormat("TradeMind: %s | %d/%d trades | Verdict: %s | Source: %s",
               g_blocked ? "BLOCKED" : "OPEN", g_tradeCount, g_effectiveLimit, g_verdict, g_countSource);

   if(ShowDashboard) DrawStatus();
  }

//+------------------------------------------------------------------+
//| Public helper — call this from your own EAs before any OrderSend  |
//|                                                                   |
//| Example usage:                                                    |
//|   extern TradeMind_CircuitBreaker* CB;  // attach in OnInit      |
//|   if(!TM_CanTrade()) return;            // before OrderSend       |
//|   int ticket = OrderSend(...);                                    |
//+------------------------------------------------------------------+
bool TM_CanTrade()
  {
   if(TimeCurrent() - g_lastPoll > 600) Poll();
   if(g_blocked)
     {
      Alert("TradeMind: Order blocked. Limit=" + IntegerToString(g_effectiveLimit) +
            " Trades=" + IntegerToString(g_tradeCount) + " Verdict=" + g_verdict);
      return false;
     }
   return true;
  }

//+------------------------------------------------------------------+
void DrawStatus()
  {
   string pfx = "tm_cb_";
   ObjectDelete(0, pfx+"s"); ObjectDelete(0, pfx+"c"); ObjectDelete(0, pfx+"v"); ObjectDelete(0, pfx+"t"); ObjectDelete(0, pfx+"src");

   color  c    = g_blocked ? ColorBlocked : (g_verdict == "CAUTION" ? ColorCaution : ColorGo);
   string head = g_blocked ? "CIRCUIT BREAKER: BLOCKED" : "TradeMind: ACTIVE";

   CreateLabel(pfx+"s",   head,                                                              10, 30,  c,          10);
   CreateLabel(pfx+"c",   "Trades: " + IntegerToString(g_tradeCount) + " / " + IntegerToString(g_effectiveLimit), 10, 48, clrSilver,  9);
   CreateLabel(pfx+"v",   "Mental: " + g_verdict,                                           10, 64,  c,           9);
   CreateLabel(pfx+"t",   "Poll: " + TimeToString(g_lastPoll, TIME_DATE|TIME_MINUTES),       10, 80,  clrDimGray,  8);
   CreateLabel(pfx+"src", "Source: " + g_countSource,                                       10, 93,  clrDimGray,  7);
   ChartRedraw(0);
  }

void CreateLabel(const string name,const string text,int x,int y,color clr,int sz)
  {
   ObjectCreate(0,name,OBJ_LABEL,0,0,0);
   ObjectSetString(0,name,OBJPROP_TEXT,text);
   ObjectSetInteger(0,name,OBJPROP_XDISTANCE,x);
   ObjectSetInteger(0,name,OBJPROP_YDISTANCE,y);
   ObjectSetInteger(0,name,OBJPROP_CORNER,CORNER_LEFT_UPPER);
   ObjectSetInteger(0,name,OBJPROP_COLOR,clr);
   ObjectSetInteger(0,name,OBJPROP_FONTSIZE,sz);
   ObjectSetString(0,name,OBJPROP_FONT,"Arial Bold");
   ObjectSetInteger(0,name,OBJPROP_SELECTABLE,false);
   ObjectSetInteger(0,name,OBJPROP_HIDDEN,true);
  }

bool GetBool(const string json,const string key)
  { string p="\""+key+"\":"; int pos=StringFind(json,p); if(pos<0)return false; string r=StringSubstr(json,pos+StringLen(p),10); StringTrimLeft(r); return StringFind(r,"true")==0; }

double GetNumber(const string json,const string key)
  { string p="\""+key+"\":"; int pos=StringFind(json,p); if(pos<0)return 0; string r=StringSubstr(json,pos+StringLen(p),20); StringTrimLeft(r); return StringToDouble(r); }

string GetString(const string json,const string key)
  { string p="\""+key+"\":\""; int pos=StringFind(json,p); if(pos<0)return ""; int s=pos+StringLen(p); int e=StringFind(json,"\"",s); if(e<0)return ""; return StringSubstr(json,s,e-s); }
//+------------------------------------------------------------------+