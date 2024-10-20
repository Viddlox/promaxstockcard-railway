import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
