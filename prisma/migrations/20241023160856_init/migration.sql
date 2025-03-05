/*
  Warnings:

  - You are about to drop the column `productId` on the `TopProductsSummary` table. All the data in the column will be lost.
  - You are about to drop the column `totalSold` on the `TopProductsSummary` table. All the data in the column will be lost.
  - Added the required column `topProducts` to the `TopProductsSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TopProductsSummary" DROP COLUMN "productId",
DROP COLUMN "totalSold",
ADD COLUMN     "topProducts" JSONB NOT NULL;
