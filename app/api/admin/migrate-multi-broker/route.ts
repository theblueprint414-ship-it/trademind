import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Runs the multi-broker + MAE/MFE schema migration on the production Turso database.
// Idempotent — safe to run multiple times. Each step is run independently so partial
// completion is visible in the response.
// POST /api/admin/migrate-multi-broker  (x-admin-secret: <CRON_SECRET>)
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
      // Treat "duplicate column" and "already exists" as no-ops (idempotent)
      if (
        msg.toLowerCase().includes("duplicate column") ||
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("duplicate key")
      ) {
        results[label] = "already_exists (skipped)";
      } else {
        results[label] = `error: ${msg}`;
      }
    }
  }

  // ── Step 1: Additive column changes (idempotent via error swallowing) ────────
  await run("broker_add_name",            `ALTER TABLE "BrokerConnection" ADD COLUMN "name" TEXT`);
  await run("broker_add_startingBalance", `ALTER TABLE "BrokerConnection" ADD COLUMN "startingBalance" REAL`);
  await run("trade_add_brokerConnectionId", `ALTER TABLE "TradeEntry" ADD COLUMN "brokerConnectionId" TEXT`);
  await run("trade_add_mae",              `ALTER TABLE "TradeEntry" ADD COLUMN "mae" REAL`);
  await run("trade_add_mfe",              `ALTER TABLE "TradeEntry" ADD COLUMN "mfe" REAL`);

  // ── Step 2: Check whether the UNIQUE constraint on BrokerConnection.userId
  //    still exists (if any user already has >1 connection it's already gone).
  //    We detect it by reading the table's CREATE statement from sqlite_master.
  let needsRecreation = false;
  try {
    const rows = await db.$queryRawUnsafe<Array<{ sql: string }>>(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='BrokerConnection'`
    );
    const ddl = rows[0]?.sql ?? "";
    // The original schema has UNIQUE("userId") or a unique index on userId
    needsRecreation = ddl.includes("UNIQUE") && ddl.toUpperCase().includes("USERID");
  } catch (err) {
    results["check_unique_constraint"] = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  if (!needsRecreation) {
    results["recreate_broker_table"] = "skipped (UNIQUE constraint already removed)";
  } else {
    // ── Step 3: Full table recreation to drop UNIQUE(userId) ──────────────────
    const steps: Array<[string, string]> = [
      ["recreate_create_new", `
        CREATE TABLE "BrokerConnection_new" (
          "id"              TEXT NOT NULL PRIMARY KEY,
          "userId"          TEXT NOT NULL,
          "name"            TEXT,
          "broker"          TEXT NOT NULL,
          "apiKey"          TEXT NOT NULL,
          "apiSecret"       TEXT,
          "environment"     TEXT NOT NULL DEFAULT 'live',
          "status"          TEXT NOT NULL DEFAULT 'active',
          "startingBalance" REAL,
          "lastSyncAt"      DATETIME,
          "createdAt"       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BrokerConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `],
      ["recreate_copy", `
        INSERT INTO "BrokerConnection_new"
          ("id","userId","name","broker","apiKey","apiSecret","environment","status","startingBalance","lastSyncAt","createdAt")
        SELECT "id","userId","name","broker","apiKey","apiSecret","environment","status","startingBalance","lastSyncAt","createdAt"
        FROM "BrokerConnection"
      `],
      ["recreate_drop_old",  `DROP TABLE "BrokerConnection"`],
      ["recreate_rename",    `ALTER TABLE "BrokerConnection_new" RENAME TO "BrokerConnection"`],
    ];

    for (const [label, sql] of steps) {
      await run(label, sql);
      // If copy or drop failed, abort the recreation sequence
      if (results[label]?.startsWith("error")) break;
    }
  }

  // ── Step 4: Indexes (safe with IF NOT EXISTS) ────────────────────────────────
  await run("index_broker_userId",
    `CREATE INDEX IF NOT EXISTS "BrokerConnection_userId_idx" ON "BrokerConnection"("userId")`);
  await run("index_trade_brokerConnectionId",
    `CREATE INDEX IF NOT EXISTS "TradeEntry_brokerConnectionId_idx" ON "TradeEntry"("brokerConnectionId")`);

  const hasErrors = Object.values(results).some((v) => v.startsWith("error"));
  return NextResponse.json({ ok: !hasErrors, results });
}
