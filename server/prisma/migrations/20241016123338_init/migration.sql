-- CreateTable
CREATE TABLE "SalesByProduct" (
    "salesByProductId" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "changePercentage" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesByProduct_pkey" PRIMARY KEY ("salesByProductId")
);
