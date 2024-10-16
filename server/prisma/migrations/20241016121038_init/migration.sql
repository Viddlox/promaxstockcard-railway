-- CreateEnum
CREATE TYPE "UoM" AS ENUM ('PCS', 'PACK', 'UNIT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'TRANSFER');

-- CreateTable
CREATE TABLE "Products" (
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "bom" JSONB,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "partId" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "partPrice" DECIMAL(65,30) NOT NULL,
    "partQuantity" INTEGER NOT NULL,
    "partUoM" "UoM" NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("partId")
);

-- CreateTable
CREATE TABLE "Users" (
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Customers" (
    "customerId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "ssmNumber" INTEGER NOT NULL,
    "postCode" INTEGER NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("customerId")
);

-- CreateTable
CREATE TABLE "Orders" (
    "orderId" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "modifications" JSONB NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "Invoices" (
    "invoiceId" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "customerData" JSONB NOT NULL,
    "orderSummary" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoices_pkey" PRIMARY KEY ("invoiceId")
);

-- CreateTable
CREATE TABLE "SalesSummuary" (
    "salesSummaryId" SERIAL NOT NULL,
    "totalValue" DECIMAL(65,30) NOT NULL,
    "changePercentage" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesSummuary_pkey" PRIMARY KEY ("salesSummaryId")
);

-- CreateTable
CREATE TABLE "InventorySummary" (
    "inventorySummaryId" SERIAL NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "changePercentage" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventorySummary_pkey" PRIMARY KEY ("inventorySummaryId")
);

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customers"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;
