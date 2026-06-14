import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Applies all TradeEntry columns that may be missing from the production Turso DB.
// Idempotent — safe to run multiple times.
// POST /api/admin/migrate-trade-fields  (x-admin-secret: <CRON_SECRET>)
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, string> = {};

  async function run(label: string, sql: string) {
    try {
      await db.$executeRawUnsafe(sql);
      results[label] = "ok";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("duplicate column") ||
        msg.toLowerCase().includes("already exists")
      ) {
        results[label] = "already_exists";
      } else {
        results[label] = `error: ${msg}`;
      }
    }
  }

  // Options / futures fields
  await run("trade_add_grade",            `ALTER TABLE "TradeEntry" ADD COLUMN "grade" TEXT`);
  await run("trade_add_optionType",       `ALTER TABLE "TradeEntry" ADD COLUMN "optionType" TEXT`);
  await run("trade_add_strikePrice",      `ALTER TABLE "TradeEntry" ADD COLUMN "strikePrice" REAL`);
  await run("trade_add_expiryDate",       `ALTER TABLE "TradeEntry" ADD COLUMN "expiryDate" TEXT`);
  await run("trade_add_multiplier",       `ALTER TABLE "TradeEntry" ADD COLUMN "multiplier" REAL`);
  await run("trade_add_tradingAccountId", `ALTER TABLE "TradeEntry" ADD COLUMN "tradingAccountId" TEXT`);

  // Context / psychology fields
  await run("trade_add_confidence",       `ALTER TABLE "TradeEntry" ADD COLUMN "confidence" INTEGER`);
  await run("trade_add_marketCondition",  `ALTER TABLE "TradeEntry" ADD COLUMN "marketCondition" TEXT`);
  await run("trade_add_timeframe",        `ALTER TABLE "TradeEntry" ADD COLUMN "timeframe" TEXT`);
  await run("trade_add_sessionType",      `ALTER TABLE "TradeEntry" ADD COLUMN "sessionType" TEXT`);

  // Forex fields
  await run("trade_add_lotSize",          `ALTER TABLE "TradeEntry" ADD COLUMN "lotSize" REAL`);
  await run("trade_add_pips",             `ALTER TABLE "TradeEntry" ADD COLUMN "pips" REAL`);
  await run("trade_add_swap",             `ALTER TABLE "TradeEntry" ADD COLUMN "swap" REAL`);

  // Screenshots
  await run("trade_add_screenshotUrls",   `ALTER TABLE "TradeEntry" ADD COLUMN "screenshotUrls" TEXT`);

  // Indexes
  await run("idx_trade_tradingAccountId",
    `CREATE INDEX IF NOT EXISTS "TradeEntry_tradingAccountId_idx" ON "TradeEntry"("tradingAccountId")`);

  // TradingAccount table (if missing)
  await run("create_trading_account_table", `
    CREATE TABLE IF NOT EXISTS "TradingAccount" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "broker" TEXT,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TradingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await run("idx_trading_account_userId",
    `CREATE INDEX IF NOT EXISTS "TradingAccount_userId_idx" ON "TradingAccount"("userId")`);

  const hasErrors = Object.values(results).some((v) => v.startsWith("error"));
  return NextResponse.json({ ok: !hasErrors, results });
}
