-- DropIndex
DROP INDEX "Customers_updatedAt_idx";

-- DropIndex
DROP INDEX "Inventory_partName_updatedAt_idx";

-- DropIndex
DROP INDEX "Products_productName_updatedAt_idx";

-- CreateIndex
CREATE INDEX "Customers_createdAt_idx" ON "Customers"("createdAt");

-- CreateIndex
CREATE INDEX "Inventory_partName_createdAt_idx" ON "Inventory"("partName", "createdAt");

-- CreateIndex
CREATE INDEX "Products_productName_createdAt_idx" ON "Products"("productName", "createdAt");
