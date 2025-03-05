/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `InventorySummary` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `SalesSummary` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TopProductsSummary` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[createdAt,inventorySummaryId]` on the table `InventorySummary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt,salesSummaryId]` on the table `SalesSummary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt,topProductsSummaryId]` on the table `TopProductsSummary` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "InventorySummary_updatedAt_inventorySummaryId_key";

-- DropIndex
DROP INDEX "SalesSummary_updatedAt_salesSummaryId_key";

-- DropIndex
DROP INDEX "TopProductsSummary_updatedAt_topProductsSummaryId_key";

-- AlterTable
ALTER TABLE "InventorySummary" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "SalesSummary" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "TopProductsSummary" DROP COLUMN "updatedAt";

-- CreateIndex
CREATE UNIQUE INDEX "InventorySummary_createdAt_inventorySummaryId_key" ON "InventorySummary"("createdAt", "inventorySummaryId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesSummary_createdAt_salesSummaryId_key" ON "SalesSummary"("createdAt", "salesSummaryId");

-- CreateIndex
CREATE UNIQUE INDEX "TopProductsSummary_createdAt_topProductsSummaryId_key" ON "TopProductsSummary"("createdAt", "topProductsSummaryId");
