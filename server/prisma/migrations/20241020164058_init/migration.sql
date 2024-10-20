/*
  Warnings:

  - The primary key for the `Customers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `customerId` column on the `Customers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `userId` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `orderType` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `customerId` on the `Orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `agentId` on the `Orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('STOCK', 'SALES');

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_agentId_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_customerId_fkey";

-- DropIndex
DROP INDEX "Inventory_partName_idx";

-- DropIndex
DROP INDEX "Inventory_updatedAt_partId_idx";

-- DropIndex
DROP INDEX "Inventory_updatedAt_partId_key";

-- DropIndex
DROP INDEX "Products_productName_idx";

-- DropIndex
DROP INDEX "Products_updatedAt_productId_idx";

-- DropIndex
DROP INDEX "Products_updatedAt_productId_key";

-- AlterTable
ALTER TABLE "Customers" DROP CONSTRAINT "Customers_pkey",
DROP COLUMN "customerId",
ADD COLUMN     "customerId" SERIAL NOT NULL,
ADD CONSTRAINT "Customers_pkey" PRIMARY KEY ("customerId");

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "orderType" "OrderType" NOT NULL,
ADD COLUMN     "partId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL,
DROP COLUMN "customerId",
ADD COLUMN     "customerId" INTEGER NOT NULL,
DROP COLUMN "agentId",
ADD COLUMN     "agentId" INTEGER NOT NULL,
ALTER COLUMN "paymentMethod" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "userId",
ADD COLUMN     "userId" SERIAL NOT NULL,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("userId");

-- CreateIndex
CREATE INDEX "Customers_updatedAt_idx" ON "Customers"("updatedAt");

-- CreateIndex
CREATE INDEX "Inventory_partName_updatedAt_idx" ON "Inventory"("partName", "updatedAt");

-- CreateIndex
CREATE INDEX "Products_productName_updatedAt_idx" ON "Products"("productName", "updatedAt");

-- CreateIndex
CREATE INDEX "Users_username_idx" ON "Users"("username");

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Inventory"("partId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customers"("customerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
