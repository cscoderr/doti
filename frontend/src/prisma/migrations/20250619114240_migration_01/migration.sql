-- CreateTable
CREATE TABLE "SpendPermission" (
    "id" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "spender" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "allowance" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "agent" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "salt" TEXT NOT NULL,
    "extraData" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SpendPermission_pkey" PRIMARY KEY ("id")
);
