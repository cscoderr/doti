-- CreateTable
CREATE TABLE "SpendPermission" (
    "id" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "spender" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "allowance" BIGINT NOT NULL,
    "period" BIGINT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "salt" BIGINT NOT NULL,
    "extraData" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SpendPermission_pkey" PRIMARY KEY ("id")
);
