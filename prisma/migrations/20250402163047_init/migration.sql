-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "reorderPoint" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "reorderPoint" INTEGER NOT NULL DEFAULT 50;
