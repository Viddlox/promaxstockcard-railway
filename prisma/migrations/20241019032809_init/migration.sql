/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,partId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `partUoM` on the `Inventory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Inventory_partName_key";

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "partUoM",
ADD COLUMN     "partUoM" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_createdAt_partId_key" ON "Inventory"("createdAt", "partId");
