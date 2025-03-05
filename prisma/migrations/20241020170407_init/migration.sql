/*
  Warnings:

  - A unique constraint covering the columns `[updatedAt,customerId]` on the table `Customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt,partId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt,inventorySummaryId]` on the table `InventorySummary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt,invoiceId]` on the table `Invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt,orderId]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt,productId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt,salesByProductId]` on the table `SalesByProduct` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updatedAt,salesSummaryId]` on the table `SalesSummary` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customers_createdAt_idx";

-- DropIndex
DROP INDEX "Inventory_createdAt_partId_idx";

-- DropIndex
DROP INDEX "Products_createdAt_productId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Customers_updatedAt_customerId_key" ON "Customers"("updatedAt", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_updatedAt_partId_key" ON "Inventory"("updatedAt", "partId");

-- CreateIndex
CREATE UNIQUE INDEX "InventorySummary_updatedAt_inventorySummaryId_key" ON "InventorySummary"("updatedAt", "inventorySummaryId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoices_updatedAt_invoiceId_key" ON "Invoices"("updatedAt", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_updatedAt_orderId_key" ON "Orders"("updatedAt", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Products_updatedAt_productId_key" ON "Products"("updatedAt", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesByProduct_updatedAt_salesByProductId_key" ON "SalesByProduct"("updatedAt", "salesByProductId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesSummary_updatedAt_salesSummaryId_key" ON "SalesSummary"("updatedAt", "salesSummaryId");
