import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardMetrics = async () => {
  const inventorySummaryData = await prisma.inventorySummary.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  const topProductsSummaryData = await prisma.topProductsSummary.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  const salesSummaryData = await prisma.salesSummary.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  const topFewestPartsData =
    inventorySummaryData[inventorySummaryData.length - 1].topFewestParts;

  return {
    inventorySummaryData,
    topProductsSummaryData,
    salesSummaryData,
    topFewestPartsData,
  };
};

export const postCreateTopProductsSummary = async () => {
  const orders = await prisma.orders.findMany();

  const productCount = {};

  orders.forEach((order) => {
    const orderItems = order.orderItems;

    orderItems.forEach((item) => {
      const { productId, quantity } = item;
      if (productId) {
        productCount[productId] =
          (productCount[productId] || 0) + parseInt(quantity);
      }
    });
  });

  const topProductIds = Object.entries(productCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([productId]) => productId);

  const topProducts = await prisma.products.findMany({
    where: {
      productId: {
        in: topProductIds,
      },
    },
  });

  const sortedTopProducts = topProducts
    .sort(
      (a, b) =>
        topProductIds.indexOf(a.productId) - topProductIds.indexOf(b.productId)
    )
    .map((product) => ({
      ...product,
      totalSold: productCount[product.productId],
    }));

  const newTopProductsSummary = await prisma.topProductsSummary.create({
    data: {
      topProducts: sortedTopProducts,
    },
  });

  return newTopProductsSummary;
};

export const postCreateSalesSummary = async () => {
  const orders = await prisma.orders.findMany({
    select: {
      totalAmount: true,
    },
  });

  // Log the orders for debugging
  console.log("Orders:", orders);

  const totalValue = orders
    .map((order) => Number(order.totalAmount)) // Ensure it's a number
    .reduce((sum, num) => sum + num, 0);

  console.log("Total Value:", totalValue);

  const previousSalesSummary = await prisma.salesSummary.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Log previous sales summary for debugging
  console.log("Previous Sales Summary:", previousSalesSummary);

  let changePercentage = 0;

  if (previousSalesSummary && previousSalesSummary.totalValue > 0) {
    changePercentage =
      ((totalValue - previousSalesSummary.totalValue) /
        previousSalesSummary.totalValue) *
      100;
  }

  const newSalesSummary = await prisma.salesSummary.create({
    data: {
      totalValue,
      changePercentage,
    },
  });

  return newSalesSummary;
};

export const postCreateInventorySummary = async () => {
  const inventory = await prisma.inventory.findMany({
    orderBy: { partQuantity: "asc" },
  });

  const totalAmount = inventory
    .map((part) => part.partQuantity)
    .reduce((sum, num) => sum + num, 0);

  const fewestProducts = inventory.slice(0, 3);

  const previousInventorySummary = await prisma.inventorySummary.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  let changePercentage = 0;

  if (previousInventorySummary && previousInventorySummary.totalAmount > 0) {
    changePercentage =
      ((totalAmount - previousInventorySummary.totalAmount) /
        previousInventorySummary.totalAmount) *
      100;
  }

  const newInventorySummary = await prisma.inventorySummary.create({
    data: {
      totalAmount,
      topFewestProducts: fewestProducts,
      changePercentage,
    },
  });

  return newInventorySummary;
};
