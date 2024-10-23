/*
  Warnings:

  - You are about to drop the column `topFewestProducts` on the `InventorySummary` table. All the data in the column will be lost.
  - Added the required column `topFewestParts` to the `InventorySummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventorySummary" DROP COLUMN "topFewestProducts",
ADD COLUMN     "topFewestParts" JSONB NOT NULL;
