// Tradovate CSV watcher
// Watches a drop folder for Tradovate trade history CSV exports
// Tradovate CSV columns: id, accountId, timestamp, action, qty, symbol, price, commission, pnl, ...
import * as fs from "fs";
import * as path from "path";
import chokidar, { FSWatcher } from "chokidar";
import type { TradeSyncPayload } from "../sync/api";

type RawRow = Record<string, string>;

function parseCsv(content: string): RawRow[] {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"/, "").replace(/"$/, "").toLowerCase());
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"/, "").replace(/"$/, ""));
    const row: RawRow = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

// Tradovate exports individual fills. We need to match BUY + SELL fills into round trips.
function matchRoundTrips(rows: RawRow[], filename: string): TradeSyncPayload[] {
  // Filter completed trades (action = "Buy" fills matched against "Sell")
  const trades: TradeSyncPayload[] = [];

  // Group by symbol
  const bySymbol: Record<string, RawRow[]> = {};
  for (const r of rows) {
    const sym = (r["symbol"] || r["contract"] || "").toUpperCase();
    if (!sym) continue;
    bySymbol[sym] = bySymbol[sym] || [];
    bySymbol[sym].push(r);
  }

  for (const [symbol, fills] of Object.entries(bySymbol)) {
    const sorted = fills.sort((a, b) =>
      new Date(a["timestamp"] || a["time"] || 0).getTime() -
      new Date(b["timestamp"] || b["time"] || 0).getTime()
    );

    const buys = sorted.filter((r) => (r["action"] || r["side"] || "").toLowerCase().includes("buy"));
    const sells = sorted.filter((r) => (r["action"] || r["side"] || "").toLowerCase().includes("sell"));

    // Simple FIFO matching
    while (buys.length > 0 && sells.length > 0) {
      const buy = buys.shift()!;
      const sell = sells.shift()!;

      const buyPrice = parseFloat(buy["price"] || buy["fill price"] || "0");
      const sellPrice = parseFloat(sell["price"] || sell["fill price"] || "0");
      const qty = parseFloat(buy["qty"] || buy["quantity"] || "1");
      const pnl = parseFloat(sell["pnl"] || sell["realized pnl"] || "0") ||
                  Math.round((sellPrice - buyPrice) * qty * 100) / 100;
      const comm = (parseFloat(buy["commission"] || "0") + parseFloat(sell["commission"] || "0")) || undefined;

      const entryTime = new Date(buy["timestamp"] || buy["time"] || Date.now()).toISOString();
      const exitTime = new Date(sell["timestamp"] || sell["time"] || Date.now()).toISOString();
      const date = entryTime.split("T")[0];

      const tradeId = `tv_${filename}_${buy["id"] || buy["fill id"] || entryTime}_${sell["id"] || sell["fill id"] || exitTime}`;

      trades.push({
        brokerTradeId: tradeId.slice(0, 100),
        date,
        symbol: symbol.slice(0, 20),
        side: "long",
        pnl: isFinite(pnl) ? pnl : undefined,
        entryPrice: isFinite(buyPrice) ? buyPrice : undefined,
        exitPrice: isFinite(sellPrice) ? sellPrice : undefined,
        entryTime,
        exitTime,
        qty: isFinite(qty) ? qty : undefined,
        commission: comm && isFinite(comm) ? comm : undefined,
        assetType: inferTradovateAsset(symbol),
      });
    }
  }

  return trades;
}

function inferTradovateAsset(symbol: string): string {
  const s = symbol.toUpperCase();
  if (/NQ|ES|CL|GC|SI|ZB|YM|RTY|MNQ|MES|MCL/.test(s)) return "futures";
  if (/BTC|ETH|SOL/.test(s)) return "crypto";
  return "futures";
}

export class TradovateWatcher {
  private watchPath: string;
  private watcher: FSWatcher | null = null;
  private processedFiles = new Set<string>();
  private onTrades: (trades: TradeSyncPayload[]) => void;
  private onError: (err: Error) => void;

  constructor(
    watchPath: string,
    onTrades: (trades: TradeSyncPayload[]) => void,
    onError: (err: Error) => void
  ) {
    this.watchPath = watchPath;
    this.onTrades = onTrades;
    this.onError = onError;
  }

  start(): void {
    if (!fs.existsSync(this.watchPath)) {
      this.onError(new Error(`Tradovate watch path not found: ${this.watchPath}`));
      return;
    }

    const pattern = path.join(this.watchPath, "*.csv");
    this.watcher = chokidar.watch(pattern, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 200 },
    });

    this.watcher.on("add", (filePath) => this.processFile(filePath));
    this.watcher.on("change", (filePath) => this.processFile(filePath));
    this.watcher.on("error", (err) => this.onError(err as Error));
  }

  private processFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const hash = `${path.basename(filePath)}_${content.length}`;
      if (this.processedFiles.has(hash)) return;
      this.processedFiles.add(hash);

      const rows = parseCsv(content);
      if (rows.length === 0) return;

      const trades = matchRoundTrips(rows, path.basename(filePath, ".csv"));
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