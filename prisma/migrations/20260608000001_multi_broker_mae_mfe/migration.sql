-- Add new columns to BrokerConnection
ALTER TABLE "BrokerConnection" ADD COLUMN "name" TEXT;
ALTER TABLE "BrokerConnection" ADD COLUMN "startingBalance" REAL;

-- Add new columns to TradeEntry
ALTER TABLE "TradeEntry" ADD COLUMN "brokerConnectionId" TEXT;
ALTER TABLE "TradeEntry" ADD COLUMN "mae" REAL;
ALTER TABLE "TradeEntry" ADD COLUMN "mfe" REAL;

-- Add index on BrokerConnection.userId (was @unique, now just indexed)
CREATE INDEX IF NOT EXISTS "BrokerConnection_userId_idx" ON "BrokerConnection"("userId");

-- Recreate BrokerConnection without the UNIQUE constraint on userId
-- (SQLite requires full table recreation to drop a constraint)
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
);
INSERT INTO "BrokerConnection_new" ("id","userId","broker","apiKey","apiSecret","environment","status","lastSyncAt","createdAt")
  SELECT "id","userId","broker","apiKey","apiSecret","environment","status","lastSyncAt","createdAt" FROM "BrokerConnection";
DROP TABLE "BrokerConnection";
ALTER TABLE "BrokerConnection_new" RENAME TO "BrokerConnection";
CREATE INDEX "BrokerConnection_userId_idx" ON "BrokerConnection"("userId");

-- Foreign key index for TradeEntry.brokerConnectionId
CREATE INDEX IF NOT EXISTS "TradeEntry_brokerConnectionId_idx" ON "TradeEntry"("brokerConnectionId");
