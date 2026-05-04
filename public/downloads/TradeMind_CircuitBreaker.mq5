//+------------------------------------------------------------------+
//| TradeMind Circuit Breaker — MT5 Expert Advisor                   |
//| Version: 1.1.0                                                   |
//| Website: https://trademindedge.com                               |
//|                                                                  |
//| HOW IT WORKS:                                                    |
//| 1. Every 5 min → polls /api/circuit-breaker/status               |
//| 2. OnTradeTransaction (DEAL_ADD) → POSTs /api/circuit-breaker/   |
//|    report-trade instantly — no waiting for next poll             |
//| 3. TM_CanTrade() → call from your own EA before OrderSend        |
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

input string ExtensionToken   = "";           // Extension token (from TradeMind Settings)
input int    PollIntervalMins = 5;            // Polling interval (minutes)
input bool   ReportTrades     = true;         // Report each trade instantly after execution
input bool   ShowDashboard    = true;         // Show status overlay on chart
input color  ColorGo          = clrLimeGreen;
input color  ColorCaution     = clrOrange;
input color  ColorBlocked     = clrRed;

bool     g_blocked        = false;
int      g_tradeCount     = 0;
int      g_effectiveLimit = 0;
string   g_verdict        = "UNKNOWN";
string   g_countSource    = "journal";
datetime g_lastPoll       = 0;

string API_BASE = "https://trademindedge.com";

//+------------------------------------------------------------------+
int OnInit()
  {
   if(ExtensionToken == "") { Alert("TradeMind: Extension token is empty."); return INIT_FAILED; }
   Poll();
   EventSetTimer(PollIntervalMins * 60);
   Print("TradeMind Circuit Breaker v1.1 initialized.");
   return INIT_SUCCEEDED;
  }

void OnDeinit(const int reason) { EventKillTimer(); ObjectsDeleteAll(0, "tm_cb_"); }
void OnTimer()                  { Poll(); }
void OnTick()                   { /* status refreshed by Poll() and ReportTrade() */ }

//+------------------------------------------------------------------+
// Fires on every deal — reports the trade instantly to TradeMind
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest     &request,
                        const MqlTradeResult      &result)
  {
   if(!ReportTrades) return;
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD) return;

   // Fetch deal details
   if(!HistoryDealSelect(trans.deal)) return;
   ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(trans.deal, DEAL_ENTRY);
   if(entry != DEAL_ENTRY_IN) return;  // only count opening deals

   string symbol = HistoryDealGetString(trans.deal, DEAL_SYMBOL);
   long   type   = HistoryDealGetInteger(trans.deal, DEAL_TYPE);
   string side   = (type == DEAL_TYPE_BUY) ? "long" : "short";

   ReportTrade(symbol, side);
  }

//+------------------------------------------------------------------+
void ReportTrade(const string symbol, const string side)
  {
   string url  = API_BASE + "/api/circuit-breaker/report-trade?token=" + ExtensionToken;
   string body = "{\"symbol\":\"" + symbol + "\",\"side\":\"" + side + "\"}";
   string reqHeaders = "Content-Type: application/json\r\nAccept: application/json\r\n";
   char   postData[];
   char   resultData[];
   string resultHeaders;
   StringToCharArray(body, postData, 0, StringLen(body), CP_UTF8);

   int code = WebRequest("POST", url, reqHeaders, "", 5000, postData, resultData, resultHeaders);
   if(code == 200)
     {
      string json = CharArrayToString(resultData, 0, WHOLE_ARRAY, CP_UTF8);
      bool newBlocked = GetBool(json, "blocked");
      int  newCount   = (int)GetNumber(json, "tradeCount");
      if(newCount > 0) g_tradeCount = newCount;
      g_blocked  = newBlocked;
      g_lastPoll = TimeCurrent();
      if(ShowDashboard) DrawStatus();
      if(g_blocked)
         Alert(StringFormat("TradeMind: Limit reached (%d/%d). New orders are blocked. Verdict: %s",
                            g_tradeCount, g_effectiveLimit, g_verdict));
     }
  }

//+------------------------------------------------------------------+
void Poll()
  {
   string url     = API_BASE + "/api/circuit-breaker/status?token=" + ExtensionToken;
   string headers = "Accept: application/json\r\n";
   char   post[];
   char   result[];
   string resultHeaders;

   ResetLastError();
   int code = WebRequest("GET", url, headers, "", 5000, post, result, resultHeaders);
   if(code != 200)
     {
      int err = GetLastError();
      if(err == 4014) Print("TradeMind: Enable WebRequest — Tools → Options → Expert Advisors → add https://trademindedge.com");
      else            Print("TradeMind: Poll error HTTP ", code, " errno ", err);
      return;
     }

   string json = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
   g_blocked        = GetBool(json, "blocked");
   g_tradeCount     = (int)GetNumber(json, "tradeCount");
   g_effectiveLimit = (int)GetNumber(json, "effectiveLimit");
   g_verdict        = GetString(json, "verdict");
   g_countSource    = GetString(json, "source");
   g_lastPoll       = TimeCurrent();

   PrintFormat("TradeMind: %s | %d/%d | Verdict: %s | Source: %s",
               g_blocked ? "BLOCKED" : "OPEN", g_tradeCount, g_effectiveLimit, g_verdict, g_countSource);
   if(ShowDashboard) DrawStatus();
  }

//+------------------------------------------------------------------+
//| Call this from your own EA before any order                      |
//| if(!TM_CanTrade()) return;                                       |
//+------------------------------------------------------------------+
bool TM_CanTrade(bool isClose = false)
  {
   if(TimeCurrent() - g_lastPoll > 600) Poll();
   if(g_blocked && !isClose)
     {
      Alert(StringFormat("TradeMind: Blocked. Limit=%d Trades=%d Verdict=%s", g_effectiveLimit, g_tradeCount, g_verdict));
      return false;
     }
   return true;
  }

//+------------------------------------------------------------------+
void DrawStatus()
  {
   string pfx = "tm_cb_";
   string labels[] = {"s","c","v","t","src"};
   for(int i=0;i<5;i++) ObjectDelete(0,pfx+labels[i]);

   color  c    = g_blocked ? ColorBlocked : (g_verdict == "CAUTION" ? ColorCaution : ColorGo);
   string head = g_blocked ? "⛔ CIRCUIT BREAKER: BLOCKED" : "✅ TradeMind: ACTIVE";

   CreateLabel(pfx+"s",   head,                                                                    10, 30, c,         10);
   CreateLabel(pfx+"c",   "Trades: "+(string)g_tradeCount+" / "+(string)g_effectiveLimit,          10, 48, clrSilver,  9);
   CreateLabel(pfx+"v",   "Mental: "+g_verdict,                                                    10, 64, c,          9);
   CreateLabel(pfx+"t",   "Poll: "+TimeToString(g_lastPoll,TIME_DATE|TIME_MINUTES),                10, 80, clrDimGray, 8);
   CreateLabel(pfx+"src", "Source: "+g_countSource,                                                10, 93, clrDimGray, 7);
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

bool GetBool(const string j,const string k)
  { string p="\""+k+"\":"; int pos=StringFind(j,p); if(pos<0)return false; string r=StringSubstr(j,pos+StringLen(p),10); StringTrimLeft(r); return StringFind(r,"true")==0; }
double GetNumber(const string j,const string k)
  { string p="\""+k+"\":"; int pos=StringFind(j,p); if(pos<0)return 0; string r=StringSubstr(j,pos+StringLen(p),20); StringTrimLeft(r); return StringToDouble(r); }
string GetString(const string j,const string k)
  { string p="\""+k+"\":\""; int pos=StringFind(j,p); if(pos<0)return ""; int s=pos+StringLen(p); int e=StringFind(j,"\"",s); if(e<0)return ""; return StringSubstr(j,s,e-s); }
//+------------------------------------------------------------------+