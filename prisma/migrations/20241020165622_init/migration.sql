-- DropIndex
DROP INDEX "Customers_createdAt_key";

-- DropIndex
DROP INDEX "Inventory_createdAt_key";

-- DropIndex
DROP INDEX "Inventory_partName_createdAt_idx";

-- DropIndex
DROP INDEX "InventorySummary_createdAt_key";

-- DropIndex
DROP INDEX "Invoices_createdAt_key";

-- DropIndex
DROP INDEX "Orders_createdAt_key";

-- DropIndex
DROP INDEX "Products_createdAt_key";

-- DropIndex
DROP INDEX "Products_productName_createdAt_idx";

-- DropIndex
DROP INDEX "SalesByProduct_createdAt_key";

-- DropIndex
DROP INDEX "SalesSummary_createdAt_key";

-- CreateIndex
CREATE INDEX "Inventory_createdAt_partId_idx" ON "Inventory"("createdAt", "partId");

-- CreateIndex
CREATE INDEX "Products_createdAt_productId_idx" ON "Products"("createdAt", "productId");
