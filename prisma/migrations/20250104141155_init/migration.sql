/*
  Warnings:

  - You are about to drop the `InventorySummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invoices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopProductsSummary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invoices" DROP CONSTRAINT "Invoices_orderId_fkey";

-- DropTable
DROP TABLE "InventorySummary";

-- DropTable
DROP TABLE "Invoices";

-- DropTable
DROP TABLE "SalesSummary";

-- DropTable
DROP TABLE "TopProductsSummary";
