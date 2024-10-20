/*
  Warnings:

  - A unique constraint covering the columns `[createdAt]` on the table `Customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt]` on the table `InventorySummary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt]` on the table `Invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt]` on the table `SalesByProduct` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createdAt]` on the table `SalesSummary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customers_createdAt_key" ON "Customers"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_createdAt_key" ON "Inventory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InventorySummary_createdAt_key" ON "InventorySummary"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoices_createdAt_key" ON "Invoices"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_createdAt_key" ON "Orders"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Products_createdAt_key" ON "Products"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalesByProduct_createdAt_key" ON "SalesByProduct"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalesSummary_createdAt_key" ON "SalesSummary"("createdAt");
