/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,notificationId]` on the table `Notifications` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Notifications_createdAt_notificationId_key" ON "Notifications"("createdAt", "notificationId");
