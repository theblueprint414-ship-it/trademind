-- CreateTable
CREATE TABLE "DailyRecap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mood" INTEGER,
    "pnl" REAL,
    "playbookScore" INTEGER,
    "lesson" TEXT,
    "tradesCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyRecap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecap_userId_date_key" ON "DailyRecap"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyRecap_userId_idx" ON "DailyRecap"("userId");
