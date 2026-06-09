// Runs once when the Node.js server starts (every cold start / deploy).
// Applies any pending schema changes that Prisma migrations can't handle via
// a normal `migrate deploy` (e.g. dropping a UNIQUE constraint in SQLite/Turso).
// Every statement is idempotent — safe to run repeatedly.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { db } = await import("./lib/db");

    async function exec(sql: string): Promise<"ok" | "skip" | string> {
      try {
        await db.$executeRawUnsafe(sql);
        return "ok";
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (
          msg.toLowerCase().includes("duplicate column") ||
          msg.toLowerCase().includes("already exists")
        ) return "skip";
        return msg;
      }
    }

    // ── Additive column changes ─────────────────────────────────────────────
    await exec(`ALTER TABLE "BrokerConnection" ADD COLUMN "name" TEXT`);
    await exec(`ALTER TABLE "BrokerConnection" ADD COLUMN "startingBalance" REAL`);
    await exec(`ALTER TABLE "TradeEntry" ADD COLUMN "brokerConnectionId" TEXT`);
    await exec(`ALTER TABLE "TradeEntry" ADD COLUMN "mae" REAL`);
    await exec(`ALTER TABLE "TradeEntry" ADD COLUMN "mfe" REAL`);

    // ── Drop UNIQUE(userId) on BrokerConnection if still present ────────────
    const rows = await db.$queryRawUnsafe<Array<{ sql: string }>>(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='BrokerConnection'`
    ).catch(() => [] as Array<{ sql: string }>);
    const ddl = rows[0]?.sql ?? "";
    const needsRecreation = ddl.toUpperCase().includes("UNIQUE") && ddl.toUpperCase().includes("USERID");

    if (needsRecreation) {
      await exec(`
        CREATE TABLE IF NOT EXISTS "BrokerConnection_new" (
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
      `);
      await exec(`
        INSERT OR IGNORE INTO "BrokerConnection_new"
          ("id","userId","name","broker","apiKey","apiSecret","environment","status","startingBalance","lastSyncAt","createdAt")
        SELECT "id","userId","name","broker","apiKey","apiSecret","environment","status","startingBalance","lastSyncAt","createdAt"
        FROM "BrokerConnection"
      `);
      await exec(`DROP TABLE "BrokerConnection"`);
      await exec(`ALTER TABLE "BrokerConnection_new" RENAME TO "BrokerConnection"`);
    }

    // ── Indexes ─────────────────────────────────────────────────────────────
    await exec(`CREATE INDEX IF NOT EXISTS "BrokerConnection_userId_idx" ON "BrokerConnection"("userId")`);
    await exec(`CREATE INDEX IF NOT EXISTS "TradeEntry_brokerConnectionId_idx" ON "TradeEntry"("brokerConnectionId")`);
  } catch {
    // Never crash the server over a migration failure
  }
}

export async function onRequestError(
  error: { digest: string } & Error,
  request: { path: string; method: string },
) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { db } = await import("./lib/db");
    await db.appError.create({
      data: {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        message: error.message ?? "Unknown error",
        stack: error.stack ?? null,
        route: `${request.method} ${request.path}`,
        level: "error",
        context: JSON.stringify({ digest: error.digest }),
      },
    });
  } catch {
    // Never throw from error handler
  }
}