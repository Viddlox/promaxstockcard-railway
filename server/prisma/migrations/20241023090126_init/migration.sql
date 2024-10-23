-- DropForeignKey
ALTER TABLE "Invoices" DROP CONSTRAINT "Invoices_orderId_fkey";

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
