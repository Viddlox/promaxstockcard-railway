import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTopProducts = async () => {
  const invoices = await prisma.invoices.findMany();

  const productCount = {};

  invoices.forEach((invoice) => {
    const { productId, modifications } = invoice.orderSummary;

    if (productId) {
      productCount[productId] = (productCount[productId] || 0) + 1;
    }

    if (modifications && Array.isArray(modifications)) {
      modifications.forEach((mod) => {
        if (mod.productId && mod.modificationType === "add") {
          productCount[mod.productId] = (productCount[mod.productId] || 0) + 1;
        }
      });
    }
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

  const sortedTopProducts = topProducts.sort(
    (a, b) =>
      topProductIds.indexOf(a.productId) - topProductIds.indexOf(b.productId)
  );

  return sortedTopProducts;
};

export const getSalesSummary = async () => {
  const salesSummary = await prisma.salesSummary.findMany({
    take: 5,
    orderBy: {
      date: "asc",
    },
  });
  return salesSummary;
};

export const getInventorySummary = async () => {
  const inventorySummary = await prisma.inventorySummary.findMany({
    take: 5,
    orderBy: {
      date: "asc",
    },
  });
  return inventorySummary;
};
