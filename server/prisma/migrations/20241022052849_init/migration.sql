/*
  Warnings:

  - You are about to drop the column `customerData` on the `Invoices` table. All the data in the column will be lost.
  - You are about to drop the column `orderSummary` on the `Invoices` table. All the data in the column will be lost.
  - You are about to drop the column `modifications` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `partId` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `setType` on the `Orders` table. All the data in the column will be lost.
  - Added the required column `orderItems` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_partId_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_productId_fkey";

-- AlterTable
ALTER TABLE "Invoices" DROP COLUMN "customerData",
DROP COLUMN "orderSummary";

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "modifications",
DROP COLUMN "partId",
DROP COLUMN "productId",
DROP COLUMN "setType",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "orderItems" JSONB NOT NULL;
