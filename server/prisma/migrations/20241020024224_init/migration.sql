/*
  Warnings:

  - A unique constraint covering the columns `[updatedAt,partId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt,productId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Inventory_createdAt_partId_key";

-- AlterTable
ALTER TABLE "Customers" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "InventorySummary" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Invoices" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Orders" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SalesByProduct" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SalesSummary" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Inventory_partName_idx" ON "Inventory"("partName");

-- CreateIndex
CREATE INDEX "Inventory_updatedAt_partId_idx" ON "Inventory"("updatedAt", "partId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_updatedAt_partId_key" ON "Inventory"("updatedAt", "partId");

-- CreateIndex
CREATE INDEX "Products_productName_idx" ON "Products"("productName");

-- CreateIndex
CREATE INDEX "Products_updatedAt_productId_idx" ON "Products"("updatedAt", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Products_updatedAt_productId_key" ON "Products"("updatedAt", "productId");
