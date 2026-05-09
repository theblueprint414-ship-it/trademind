// NinjaTrader 8 watcher
// Reads directly from NinjaTrader's SQLite database: NinjaTrader.db3
// Table: SystemPerformance, with Execution rows linked by TradeId
import * as fs from "fs";
import type { TradeSyncPayload } from "../sync/api";

type NT8Execution = {
  ExecutionId: string;
  TradeId: string;
  Instrument: string;
  MarketPosition: number; // 0=Long, 1=Short
  Quantity: number;
  Price: number;
  Time: string;
  Commission: number;
  IsEntry: number; // 1=entry, 0=exit
};

type NT8Trade = {
  TradeId: string;
  Instrument: string;
  MarketPosition: number;
  Quantity: number;
  EntryPrice: number;
  ExitPrice: number;
  EntryTime: string;
  ExitTime: string;
  ProfitLoss: number;
  Commission: number;
};

function nt8TimeToISO(nt: string): string {
  // NinjaTrader stores time as "1/15/2024 9:30:00 AM" or ISO
  const d = new Date(nt);
  if (!isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

export class NinjaTraderWatcher {
  private dbPath: string;
  private onTrades: (trades: TradeSyncPayload[]) => void;
  private onError: (err: Error) => void;
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastChecked: Date = new Date(0);

  constructor(
    dbPath: string,
    onTrades: (trades: TradeSyncPayload[]) => void,
    onError: (err: Error) => void
  ) {
    this.dbPath = dbPath;
    this.onTrades = onTrades;
    this.onError = onError;
  }

  start(): void {
    if (!fs.existsSync(this.dbPath)) {
      this.onError(new Error(`NinjaTrader DB not found: ${this.dbPath}`));
      return;
    }

    // Poll every 30 seconds — SQLite files can't be watched reliably while NT8 has them open
    this.read();
    this.timer = setInterval(() => this.read(), 30_000);
  }

  private read(): void {
    try {
      // Lazy require to avoid build-time error if better-sqlite3 not installed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require("better-sqlite3");
      // Open read-only to avoid locking NinjaTrader out of its own DB
      const db = new Database(this.dbPath, { readonly: true, fileMustExist: true });

      const since = this.lastChecked.toISOString();
      this.lastChecked = new Date();

      // Query closed trades since last check
      const trades = db.prepare(`
        SELECT
          TradeId, Instrument, MarketPosition, Quantity,
          EntryPrice, ExitPrice, EntryTime, ExitTime,
          ProfitLoss, Commission
        FROM Trade
        WHERE ExitTime > ?
        ORDER BY ExitTime ASC
        LIMIT 500
      `).all(since) as NT8Trade[];

      db.close();

      if (trades.length === 0) return;

      const payloads: TradeSyncPayload[] = trades.map((t) => {
        const entryTime = nt8TimeToISO(t.EntryTime);
        const exitTime = nt8TimeToISO(t.ExitTime);
        const date = entryTime.split("T")[0];

        return {
          brokerTradeId: `nt8_${t.TradeId}`,
          date,
          symbol: t.Instrument.replace(/\s+/g, "").toUpperCase().slice(0, 20),
          side: t.MarketPosition === 0 ? "long" : "short",
          pnl: Math.round(t.ProfitLoss * 100) / 100,
          entryPrice: t.EntryPrice,
          exitPrice: t.ExitPrice,
          entryTime,
          exitTime,
          qty: t.Quantity,
          commission: t.Commission || undefined,
          assetType: inferNT8AssetType(t.Instrument),
        };
      });

      this.onTrades(payloads);
    } catch (err) {
      // Don't spam errors if NT8 has the DB locked — just skip this cycle
      if (err instanceof Error && err.message.includes("locked")) return;
      this.onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }
}

function inferNT8AssetType(instrument: string): string {
  const s = instrument.toUpperCase();
  if (/NQ|ES|CL|GC|SI|ZB|YM|RTY|MNQ|MES/.test(s)) return "futures";
  if (/EUR|GBP|JPY|CHF|AUD|CAD/.test(s)) return "forex";
  if (/BTC|ETH|SOL/.test(s)) return "crypto";
  return "futures"; // NinjaTrader is primarily futures
}