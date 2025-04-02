/*
  Warnings:

  - You are about to drop the column `inventoryId` on the `Notifications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[partId]` on the table `Notifications` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_inventoryId_fkey";

-- DropIndex
DROP INDEX "Notifications_inventoryId_key";

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "inventoryId",
ADD COLUMN     "partId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Notifications_partId_key" ON "Notifications"("partId");

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Inventory"("partId") ON DELETE CASCADE ON UPDATE CASCADE;
