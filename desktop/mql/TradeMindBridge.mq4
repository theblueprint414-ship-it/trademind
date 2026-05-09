//+------------------------------------------------------------------+
//|  TradeMindBridge.mq4                                              |
//|  Exports closed trades to CSV for EdgeBridge sync                 |
//|  Install: Copy to MT4/experts/ folder, compile, attach to chart   |
//+------------------------------------------------------------------+
#property copyright   "TradeMind"
#property link        "https://trademindedge.com"
#property version     "1.0"
#property strict
#property description "Exports trade history to CSV for TradeMind EdgeBridge sync."

//--- Input parameters
extern string ExportFolder   = "TradeMindBridge";   // Sub-folder inside MT4/MQL4/Files/
extern int    CheckIntervalS = 10;                  // How often to check for new closed trades (seconds)
extern bool   ExportOnStart  = true;                // Export all history on EA start

//--- State
datetime lastCloseTime = 0;
string   csvFilePath   = "";
bool     headerWritten = false;

//+------------------------------------------------------------------+
int OnInit()
{
   csvFilePath = ExportFolder + "\\TradeMindBridge_" + AccountNumber() + "_" + Symbol() + ".csv";

   // Ensure folder exists
   int handle = FileOpen(ExportFolder + "\\__init", FILE_WRITE | FILE_TXT);
   if (handle != INVALID_HANDLE) FileClose(handle);

   if (ExportOnStart)
   {
      ExportHistory(0); // Export all history
   }
   else
   {
      // Only export going forward — set baseline to last closed trade
      for (int i = OrdersHistoryTotal() - 1; i >= 0; i--)
      {
         if (OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
         {
            if (OrderCloseTime() > lastCloseTime)
               lastCloseTime = OrderCloseTime();
         }
      }
   }

   EventSetTimer(CheckIntervalS);
   Print("TradeMindBridge: initialized. Watching for closed trades...");
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
}

//+------------------------------------------------------------------+
void OnTimer()
{
   ExportHistory(lastCloseTime);
}

//+------------------------------------------------------------------+
void ExportHistory(datetime since)
{
   int newTrades = 0;
   datetime latestClose = since;

   // Open CSV (append mode — we always append, EdgeBridge deduplicates)
   int fh = FileOpen(csvFilePath, FILE_WRITE | FILE_READ | FILE_CSV | FILE_ANSI, ',');
   if (fh == INVALID_HANDLE)
   {
      Print("TradeMindBridge: Cannot open file ", csvFilePath);
      return;
   }

   // Write header if file is empty
   if (FileSize(fh) == 0)
   {
      FileWrite(fh, "ticket", "symbol", "type", "volume", "open_price", "close_price",
                     "open_time", "close_time", "profit", "commission", "swap");
   }
   else
   {
      FileSeek(fh, 0, SEEK_END); // Append
   }

   for (int i = 0; i < OrdersHistoryTotal(); i++)
   {
      if (!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY)) continue;

      // Skip non-trade orders (deposits, credits)
      if (OrderType() != OP_BUY && OrderType() != OP_SELL) continue;

      // Only new closes since last run
      if (OrderCloseTime() <= since) continue;

      string orderType = (OrderType() == OP_BUY) ? "buy" : "sell";

      // Format times: YYYY.MM.DD HH:MM:SS
      string openTime  = TimeToStr(OrderOpenTime(),  TIME_DATE | TIME_SECONDS);
      string closeTime = TimeToStr(OrderCloseTime(), TIME_DATE | TIME_SECONDS);

      FileWrite(fh,
         (string)OrderTicket(),
         OrderSymbol(),
         orderType,
         DoubleToStr(OrderLots(), 2),
         DoubleToStr(OrderOpenPrice(), 5),
         DoubleToStr(OrderClosePrice(), 5),
         openTime,
         closeTime,
         DoubleToStr(OrderProfit(), 2),
         DoubleToStr(OrderCommission(), 2),
         DoubleToStr(OrderSwap(), 2)
      );

      if (OrderCloseTime() > latestClose)
         latestClose = OrderCloseTime();

      newTrades++;
   }

   FileClose(fh);

   if (newTrades > 0)
   {
      lastCloseTime = latestClose;
      Print("TradeMindBridge: Exported ", newTrades, " new trade(s) to ", csvFilePath);
   }
}

//+------------------------------------------------------------------+
void OnTick() { /* No tick processing needed */ }
//+------------------------------------------------------------------+