/*
  Warnings:

  - You are about to drop the `SalesSummuary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SalesSummuary";

-- CreateTable
CREATE TABLE "SalesSummary" (
    "salesSummaryId" SERIAL NOT NULL,
    "totalValue" DECIMAL(65,30) NOT NULL,
    "changePercentage" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesSummary_pkey" PRIMARY KEY ("salesSummaryId")
);
