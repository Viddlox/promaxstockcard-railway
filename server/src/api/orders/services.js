import { PrismaClient } from "@prisma/client";

import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";
import {
  calculateTotalCost,
  sumBomChanges,
} from "../../utils/orderCalculation.js";

import { patchInventoryParts } from "../inventory/services.js";
// import {
//   postCreateSalesSummary,
//   postCreateTopProductsSummary,
// } from "../dashboard/services.js";

const prisma = new PrismaClient();

export const getOrders = async ({ limit, cursor, search }) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery ? JSON.parse(cursorQuery) : null;

  const orders = await prisma.orders.findMany({
    take: limitQuery,
    skip: parsedCursor ? 1 : 0,
    cursor: parsedCursor
      ? {
          updatedAt_orderId: {
            updatedAt: parsedCursor.updatedAt,
            orderId: parsedCursor.orderId,
          },
        }
      : undefined,
    where: search
      ? {
          OR: [
            {
              orderItems: {
                path: ["orderItems", "productId"],
                string_contains: search,
              },
            },
            {
              orderItems: {
                path: ["orderItems", "partId"],
                string_contains: search,
              },
            },
          ],
        }
      : {},
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = await prisma.orders.count({
    where: search
      ? {
          OR: [
            {
              orderItems: {
                path: ["orderItems", "productId"],
                string_contains: search,
              },
            },
            {
              orderItems: {
                path: ["orderItems", "partId"],
                string_contains: search,
              },
            },
          ],
        }
      : {},
  });

  const nextCursor =
    orders.length === limitQuery
      ? {
          updatedAt: orders[orders.length - 1].updatedAt,
          orderId: orders[orders.length - 1].orderId,
        }
      : null;

  return {
    data: orders,
    nextCursor,
    total: totalCount,
    hasNextPage: nextCursor !== null,
  };
};

export const postCreateOrder = async ({
  orderType,
  orderItems,
  agentId,
  customerId = null,
  paymentMethod = null,
  notes = "",
}) => {
  let newOrder = null;
  let updatedParts = null;

  if (
    !orderType ||
    !orderItems ||
    !agentId ||
    (orderType === "SALE" && !(paymentMethod || customerId))
  ) {
    throw new HttpError(400, "Missing required fields");
  }

  let setType = "ABC";
  let totalAmount = 0;
  let parsedOrderItems = JSON.parse(orderItems);
  let bomChanges = [];

  if (
    orderType === "SALE" &&
    parsedOrderItems &&
    Array.isArray(parsedOrderItems)
  ) {
    const aggregatedItems = parsedOrderItems.reduce(
      (acc, item) => {
        const { productId, partId, quantity, bom } = item;

        if (productId) {
          acc.products[productId] =
            (acc.products[productId] || 0) + parseInt(quantity);

          if (bom && Array.isArray(bom)) {
            bom.forEach((bomItem) => {
              const { partId: bomPartId, quantity: bomQuantity } = bomItem;
              acc.parts[bomPartId] = (acc.parts[bomPartId] || 0) + bomQuantity;
            });
          }
        } else if (partId) {
          acc.parts[partId] = (acc.parts[partId] || 0) + parseInt(quantity);
        }

        return acc;
      },
      { products: {}, parts: {} }
    );

    const productIds = Object.keys(aggregatedItems.products);
    const partIds = Object.keys(aggregatedItems.parts);

    const [products, inventoryParts] = await Promise.all([
      prisma.products.findMany({
        where: { productId: { in: productIds } },
        select: { productId: true, bom: true, basePrice: true },
      }),
      prisma.inventory.findMany({
        where: { partId: { in: partIds } },
        select: { partId: true, partPrice: true },
      }),
    ]);

    const productMap = Object.fromEntries(
      products.map((p) => [p.productId, p])
    );
    const partMap = Object.fromEntries(
      inventoryParts.map((p) => [p.partId, p.partPrice])
    );

    const totalPriceChangesArr = await Promise.all(
      parsedOrderItems.map(async (orderItem) => {
        const { productId, partId, bom: orderBom, quantity } = orderItem;

        if (productId) {
          const product = productMap[productId];
          if (!product)
            throw new HttpError(404, `Product ${productId} not found`);

          const backendBom = product.bom;
          const productBomChanges = sumBomChanges(backendBom, orderBom || []);

          bomChanges.push(...productBomChanges);

          const calculatedCosts = await calculateTotalCost(
            productBomChanges,
            partMap
          );
          return product.basePrice * parseInt(quantity) + calculatedCosts;
        } else if (partId) {
          const partPrice = partMap[partId];
          if (!partPrice) throw new HttpError(404, `Part ${partId} not found`);
          return partPrice * parseInt(quantity);
        }
      })
    );

    totalAmount = totalPriceChangesArr.reduce((sum, price) => sum + price, 0);

    const partsArray = Object.keys(aggregatedItems.parts).map((key) => {
      return { partId: key, quantity: aggregatedItems.parts[key] };
    });

    await patchInventoryParts({
      inventoryParts: partsArray,
      isSale: true,
    });

    newOrder = await prisma.orders.create({
      data: {
        orderType,
        orderItems: parsedOrderItems,
        agentId,
        customerId,
        paymentMethod,
        totalAmount,
        setType,
        notes,
      },
    });
    // await postCreateSalesSummary();
  } else if (
    orderType === "STOCK" &&
    parsedOrderItems &&
    Array.isArray(parsedOrderItems)
  ) {
    updatedParts = await patchInventoryParts({
      inventoryParts: parsedOrderItems,
    });
    newOrder = await prisma.orders.create({
      data: {
        orderType,
        orderItems: parsedOrderItems,
        agentId,
        notes,
      },
    });
  }

  // await postCreateTopProductsSummary();

  return {
    orderData: newOrder,
    inventoryData: updatedParts,
  };
};

export const deleteOrders = async ({ orderIds = [] }) => {
  if (orderIds.length === 0) {
    throw new HttpError(400, "Missing required fields");
  }

  await prisma.orders.deleteMany({
    where: {
      orderId: {
        in: orderIds,
      },
    },
  });
};
