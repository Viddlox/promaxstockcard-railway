import { PrismaClient } from "@prisma/client";

import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";
import {
  calculateTotalCost,
  sumBomChanges,
} from "../../utils/orderCalculation.js";

import { postCreateInvoice } from "../invoices/services.js";

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
    const productIds = parsedOrderItems
      .map((item) => item.productId)
      .filter(Boolean);
    const partIds = parsedOrderItems.map((item) => item.partId).filter(Boolean);

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

    const productCount = productIds.length;
    const partCount = partIds.length;

    if (productCount > 1 || (productCount === 0 && partCount > 0)) {
      setType = "C";
    }

    const totalPriceChangesArr = await Promise.all(
      parsedOrderItems.map(async (orderItem) => {
        const { productId, partId, bom: orderBom } = orderItem;

        if (productId) {
          const product = productMap[productId];
          if (!product)
            throw new HttpError(404, `Product ${productId} not found`);

          const backendBom = product.bom;
          bomChanges = sumBomChanges(backendBom, orderBom || []);

          const calculatedCosts = await calculateTotalCost(bomChanges, partMap);
          return product.basePrice + calculatedCosts;
        } else if (partId) {
          const partPrice = partMap[partId];
          if (!partPrice) throw new HttpError(404, `Part ${partId} not found`);
          return partPrice;
        }
      })
    );
    if (bomChanges.length) {
      setType = "A";
    }

    totalAmount = totalPriceChangesArr.reduce((sum, price) => sum + price, 0);
  }

  const newOrder = await prisma.orders.create({
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

  if (newOrder && paymentMethod && customerId && orderType === "SALE") {
    try {
      const newInvoice = await postCreateInvoice({
        orderId: newOrder.orderId,
        orderData: newOrder,
      });
      return { orderData: newOrder, invoiceData: newInvoice };
    } catch (e) {
      throw new HttpError(500, `Error creating order invoice: ${e.message}`);
    }
  }

  return { orderData: newOrder, invoiceData: null };
};
