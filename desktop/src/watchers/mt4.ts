// MT4/MT5 file watcher
// Reads CSV files written by the TradeMindBridge Expert Advisor
// CSV format: ticket,symbol,type,volume,open_price,close_price,open_time,close_time,profit,commission,swap
import * as fs from "fs";
import * as path from "path";
import chokidar, { FSWatcher } from "chokidar";
import type { TradeSyncPayload } from "../sync/api";

type ParsedTrade = TradeSyncPayload;

function parseLine(line: string, brokerPrefix: string): ParsedTrade | null {
  const parts = line.split(",").map((p) => p.trim());
  if (parts.length < 9) return null;

  const [ticket, symbol, type, volume, openPrice, closePrice, openTime, closeTime, profit, commission] = parts;
  if (!ticket || !symbol || !openTime || !closeTime) return null;

  const side: "long" | "short" = type.toLowerCase().includes("buy") ? "long" : "short";
  const pnl = parseFloat(profit);
  const qty = parseFloat(volume);
  const entryPx = parseFloat(openPrice);
  const exitPx = parseFloat(closePrice);
  const comm = parseFloat(commission ?? "0") || 0;

  if (!isFinite(pnl) || !isFinite(qty) || !isFinite(entryPx) || !isFinite(exitPx)) return null;

  // Parse MT4 date format: "2024.01.15 09:30:00"
  const parseDateTime = (s: string): string | null => {
    const m = s.match(/^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (!m) return null;
    return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
  };

  const entryTime = parseDateTime(openTime);
  const exitTime = parseDateTime(closeTime);
  if (!entryTime || !exitTime) return null;

  const date = entryTime.split("T")[0];

  return {
    brokerTradeId: `${brokerPrefix}_${ticket}`,
    date,
    symbol: symbol.toUpperCase().slice(0, 20),
    side,
    pnl: Math.round(pnl * 100) / 100,
    entryPrice: entryPx,
    exitPrice: exitPx,
    entryTime,
    exitTime,
    qty: Math.round(qty * 10000) / 10000,
    commission: comm !== 0 ? Math.round(comm * 100) / 100 : undefined,
    assetType: inferAssetType(symbol),
  };
}

function inferAssetType(symbol: string): string {
  const s = symbol.toUpperCase();
  if (/BTC|ETH|XRP|SOL|BNB|ADA|DOGE/.test(s)) return "crypto";
  if (/EUR|GBP|JPY|CHF|AUD|CAD|NZD|USD/.test(s) && s.length <= 8) return "forex";
  if (/NQ|ES|CL|GC|SI|ZB|YM|RTY|NKD/.test(s)) return "futures";
  return "stocks";
}

export class MT4Watcher {
  private watcher: FSWatcher | null = null;
  private watchPath: string;
  private brokerType: "mt4" | "mt5";
  private onTrades: (trades: ParsedTrade[]) => void;
  private onError: (err: Error) => void;

  constructor(
    watchPath: string,
    brokerType: "mt4" | "mt5",
    onTrades: (trades: ParsedTrade[]) => void,
    onError: (err: Error) => void
  ) {
    this.watchPath = watchPath;
    this.brokerType = brokerType;
    this.onTrades = onTrades;
    this.onError = onError;
  }

  start(): void {
    if (!fs.existsSync(this.watchPath)) {
      this.onError(new Error(`Path not found: ${this.watchPath}`));
      return;
    }

    const pattern = path.join(this.watchPath, "TradeMindBridge_*.csv");

    this.watcher = chokidar.watch(pattern, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    });

    this.watcher.on("add", (filePath) => this.processFile(filePath));
    this.watcher.on("change", (filePath) => this.processFile(filePath));
    this.watcher.on("error", (err) => this.onError(err as Error));
  }

  private processFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("ticket"));
      const trades: ParsedTrade[] = [];

      for (const line of lines) {
        const trade = parseLine(line, this.brokerType);
        if (trade) trades.push(trade);
      }

      if (trades.length > 0) this.onTrades(trades);
    } catch (err) {
      this.onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  stop(): void {
    this.watcher?.close();
    this.watcher = null;
  }
}