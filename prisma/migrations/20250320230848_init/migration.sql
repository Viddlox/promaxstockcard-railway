/*
  Warnings:

  - Made the column `bom` on table `Products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "modifications" JSONB DEFAULT '[]';

-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "bom" SET NOT NULL;
