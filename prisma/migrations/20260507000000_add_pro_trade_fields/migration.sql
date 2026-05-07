ALTER TABLE "TradeEntry" ADD COLUMN "stopLoss" REAL;
ALTER TABLE "TradeEntry" ADD COLUMN "takeProfit" REAL;
ALTER TABLE "TradeEntry" ADD COLUMN "riskAmount" REAL;
ALTER TABLE "TradeEntry" ADD COLUMN "rMultiple" REAL;
ALTER TABLE "TradeEntry" ADD COLUMN "commission" REAL;
ALTER TABLE "TradeEntry" ADD COLUMN "assetType" TEXT;
ALTER TABLE "TradeEntry" ADD COLUMN "plannedEntry" REAL;
ALTER TABLE "TradeEntry" ADD COLUMN "duration" INTEGER;

CREATE TABLE "MidSessionCheckin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "mood" TEXT NOT NULL,
    "tradesCount" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MidSessionCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MidSessionCheckin_userId_date_idx" ON "MidSessionCheckin"("userId", "date");