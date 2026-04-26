ALTER TABLE "User" ADD COLUMN "challengeProfitTarget" REAL;
ALTER TABLE "User" ADD COLUMN "challengeTradingDaysTarget" INTEGER;

CREATE TABLE "ChallengeAttempt" (
  "id"                TEXT NOT NULL PRIMARY KEY,
  "userId"            TEXT NOT NULL,
  "firm"              TEXT,
  "accountSize"       REAL NOT NULL,
  "profitTarget"      REAL,
  "dailyLimit"        REAL NOT NULL,
  "maxDrawdown"       REAL NOT NULL,
  "tradingDaysTarget" INTEGER,
  "startDate"         TEXT NOT NULL,
  "endDate"           TEXT,
  "outcome"           TEXT,
  "finalPnl"          REAL,
  "tradingDays"       INTEGER,
  "notes"             TEXT,
  "createdAt"         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChallengeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ChallengeAttempt_userId_idx" ON "ChallengeAttempt"("userId");