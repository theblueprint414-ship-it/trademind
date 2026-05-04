-- CreateTable
CREATE TABLE "CircuitBreaker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "dailyLimit" INTEGER NOT NULL DEFAULT 3,
    "scoreAdaptive" BOOLEAN NOT NULL DEFAULT true,
    "resetHour" INTEGER NOT NULL DEFAULT 0,
    "extensionToken" TEXT NOT NULL,
    "blockedAt" DATETIME,
    "tradeCountToday" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CircuitBreaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CircuitBreaker_userId_key" ON "CircuitBreaker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CircuitBreaker_extensionToken_key" ON "CircuitBreaker"("extensionToken");