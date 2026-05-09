//+------------------------------------------------------------------+
//|  TradeMindBridge.mq5                                              |
//|  Exports closed deals to CSV for EdgeBridge sync                  |
//|  Install: Copy to MT5/MQL5/Experts/, compile, attach to chart     |
//+------------------------------------------------------------------+
#property copyright   "TradeMind"
#property link        "https://trademindedge.com"
#property version     "1.0"
#property description "Exports trade history to CSV for TradeMind EdgeBridge sync."

#include <Trade/Trade.mqh>

//--- Inputs
input string ExportFolder   = "TradeMindBridge";
input int    CheckIntervalS = 10;
input bool   ExportOnStart  = true;

//--- State
datetime lastDealTime = 0;
string   csvFilePath  = "";

//+------------------------------------------------------------------+
int OnInit()
{
   csvFilePath = ExportFolder + "\\TradeMindBridge_" + IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN))
               + "_" + Symbol() + ".csv";

   // Ensure folder
   int fh = FileOpen(ExportFolder + "\\__init", FILE_WRITE | FILE_TXT | FILE_ANSI);
   if (fh != INVALID_HANDLE) FileClose(fh);

   if (ExportOnStart)
   {
      ExportDeals(0);
   }
   else
   {
      // Set baseline to latest existing deal
      HistorySelect(0, TimeCurrent());
      int total = HistoryDealsTotal();
      for (int i = total - 1; i >= 0; i--)
      {
         ulong ticket = HistoryDealGetTicket(i);
         if (ticket == 0) continue;
         datetime t = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
         if (t > lastDealTime) lastDealTime = t;
      }
   }

   EventSetTimer(CheckIntervalS);
   Print("TradeMindBridge: initialized.");
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason) { EventKillTimer(); }
void OnTick()                   { /* not needed */  }

//+------------------------------------------------------------------+
void OnTimer()
{
   ExportDeals(lastDealTime);
}

//+------------------------------------------------------------------+
void ExportDeals(datetime since)
{
   // Select deals from last known time
   datetime from = (since > 0) ? since : (datetime)0;
   if (!HistorySelect(from, TimeCurrent())) return;

   // Collect deals and group by PositionID to build round-trips
   struct DealInfo
   {
      ulong    ticket;
      long     positionId;
      string   symbol;
      ENUM_DEAL_ENTRY entry;
      ENUM_DEAL_TYPE  type;
      double   volume;
      double   price;
      double   profit;
      double   commission;
      double   swap;
      datetime time;
   };

   DealInfo deals[];
   int total = HistoryDealsTotal();

   for (int i = 0; i < total; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if (ticket == 0) continue;

      datetime t = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
      if (t <= since) continue;

      ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(ticket, DEAL_ENTRY);
      // We want DEAL_ENTRY_OUT (closing deals) to build complete round trips
      if (entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_INOUT) continue;

      int sz = ArraySize(deals);
      ArrayResize(deals, sz + 1);
      deals[sz].ticket     = ticket;
      deals[sz].positionId = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
      deals[sz].symbol     = HistoryDealGetString(ticket, DEAL_SYMBOL);
      deals[sz].entry      = entry;
      deals[sz].type       = (ENUM_DEAL_TYPE)HistoryDealGetInteger(ticket, DEAL_TYPE);
      deals[sz].volume     = HistoryDealGetDouble(ticket, DEAL_VOLUME);
      deals[sz].price      = HistoryDealGetDouble(ticket, DEAL_PRICE);
      deals[sz].profit     = HistoryDealGetDouble(ticket, DEAL_PROFIT);
      deals[sz].commission = HistoryDealGetDouble(ticket, DEAL_COMMISSION);
      deals[sz].swap       = HistoryDealGetDouble(ticket, DEAL_SWAP);
      deals[sz].time       = t;
   }

   if (ArraySize(deals) == 0) return;

   // Now match with entry deals to get open price + open time
   int fh = FileOpen(csvFilePath, FILE_WRITE | FILE_READ | FILE_CSV | FILE_ANSI, ',');
   if (fh == INVALID_HANDLE)
   {
      Print("TradeMindBridge: Cannot open file");
      return;
   }

   if (FileSize(fh) == 0)
      FileWrite(fh, "ticket", "symbol", "type", "volume", "open_price", "close_price",
                    "open_time", "close_time", "profit", "commission", "swap");
   else
      FileSeek(fh, 0, SEEK_END);

   datetime latestTime = since;
   int exported = 0;

   for (int i = 0; i < ArraySize(deals); i++)
   {
      DealInfo &d = deals[i];

      // Find the matching entry deal by PositionID
      double openPrice = 0;
      datetime openTime = 0;

      for (int j = 0; j < HistoryDealsTotal(); j++)
      {
         ulong entryTk = HistoryDealGetTicket(j);
         if (entryTk == 0) continue;
         if (HistoryDealGetInteger(entryTk, DEAL_POSITION_ID) != d.positionId) continue;
         if ((ENUM_DEAL_ENTRY)HistoryDealGetInteger(entryTk, DEAL_ENTRY) != DEAL_ENTRY_IN) continue;
         openPrice = HistoryDealGetDouble(entryTk, DEAL_PRICE);
         openTime  = (datetime)HistoryDealGetInteger(entryTk, DEAL_TIME);
         break;
      }

      // Determine side: BUY deal closing = was a sell = short; SELL closing = was a buy = long
      string side = (d.type == DEAL_TYPE_SELL) ? "buy" : "sell"; // type of EXIT deal is opposite of trade direction

      FileWrite(fh,
         IntegerToString(d.ticket),
         d.symbol,
         side,
         DoubleToString(d.volume, 2),
         DoubleToString(openPrice, 5),
         DoubleToString(d.price, 5),
         TimeToString(openTime, TIME_DATE | TIME_SECONDS),
         TimeToString(d.time,   TIME_DATE | TIME_SECONDS),
         DoubleToString(d.profit, 2),
         DoubleToString(d.commission, 2),
         DoubleToString(d.swap, 2)
      );

      if (d.time > latestTime) latestTime = d.time;
      exported++;
   }

   FileClose(fh);

   if (exported > 0)
   {
      lastDealTime = latestTime;
      Print("TradeMindBridge: Exported ", exported, " deal(s).");
   }
}
//+------------------------------------------------------------------+