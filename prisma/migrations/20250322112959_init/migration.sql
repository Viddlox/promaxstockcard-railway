-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LOW_STOCK', 'ORDER_SALE', 'ORDER_STOCK', 'INVENTORY_CREATE', 'INVENTORY_UPDATE', 'INVENTORY_DELETE', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE');

-- CreateTable
CREATE TABLE "Notifications" (
    "notificationId" TEXT NOT NULL,
    "senderId" TEXT,
    "receiverId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT,
    "productId" TEXT,
    "inventoryId" TEXT,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("notificationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notifications_orderId_key" ON "Notifications"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Notifications_productId_key" ON "Notifications"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Notifications_inventoryId_key" ON "Notifications"("inventoryId");

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("partId") ON DELETE CASCADE ON UPDATE CASCADE;
