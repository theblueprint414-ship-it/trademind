ALTER TABLE "User" ADD COLUMN "challengeEnabled" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN "challengeFirm" TEXT;
ALTER TABLE "User" ADD COLUMN "challengeAccountSize" REAL;
ALTER TABLE "User" ADD COLUMN "challengeDailyLimit" REAL;
ALTER TABLE "User" ADD COLUMN "challengeMaxDrawdown" REAL;
ALTER TABLE "User" ADD COLUMN "challengeStartDate" TEXT;
ALTER TABLE "User" ADD COLUMN "challengeEndDate" TEXT;
