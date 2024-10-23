/*
  Warnings:

  - You are about to drop the `SalesByProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SalesByProduct";

-- CreateTable
CREATE TABLE "TopProductsSummary" (
    "topProductsSummaryId" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "totalSold" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopProductsSummary_pkey" PRIMARY KEY ("topProductsSummaryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopProductsSummary_updatedAt_topProductsSummaryId_key" ON "TopProductsSummary"("updatedAt", "topProductsSummaryId");
