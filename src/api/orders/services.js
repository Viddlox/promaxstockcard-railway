import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";
import {
  calculateTotalCost,
  sumBomChanges,
} from "../../utils/orderCalculation.js";

import { patchInventoryParts } from "../inventory/services.js";
import { patchProducts } from "../products/services.js";
import { prisma } from "../../../prisma/prisma.js";

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
            {
              customerName: { contains: search, mode: "insensitive" },
            },
            {
              salesAgentName: { contains: search, mode: "insensitive" },
            },
            {
              orderType:
                search.toUpperCase() === "SALE" ||
                search.toUpperCase() === "STOCK"
                  ? search.toUpperCase()
                  : undefined,
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
            {
              customerName: { contains: search, mode: "insensitive" },
            },
            {
              salesAgentName: { contains: search, mode: "insensitive" },
            },
            {
              orderType:
                search.toUpperCase() === "SALE" ||
                search.toUpperCase() === "STOCK"
                  ? search.toUpperCase()
                  : undefined,
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
  salesAgentId,
  customerId = null,
  paymentMethod = null,
  notes = "",
}) => {
  try {
    if (
      !orderType ||
      !orderItems ||
      !salesAgentId ||
      (orderType === "SALE" && !(paymentMethod || customerId))
    ) {
      throw new HttpError(400, "Missing required fields");
    }

    let salesAgent;
    try {
      salesAgent = await prisma.users.findUnique({
        where: {
          userId: salesAgentId,
        },
      });
      if (!salesAgent) {
        throw new HttpError(404, "Sales agent not found");
      }
    } catch (error) {
      throw new HttpError(500, "Failed to fetch sales agent");
    }

    let customer;
    if (customerId) {
      try {
        customer = await prisma.customers.findUnique({
          where: {
            customerId,
          },
        });
      } catch (error) {
        throw new HttpError(500, "Failed to fetch customer");
      }
    }

    let totalAmount = 0;
    let parsedOrderItems;

    try {
      parsedOrderItems = JSON.parse(orderItems);
    } catch (error) {
      console.error("Failed to parse orderItems:", error);
      throw new HttpError(400, "Invalid orderItems JSON format");
    }

    let bomChanges = [];
    let aggregatedItems = { products: {}, parts: {} };
    let partsArray = [];
    let productsArray = [];

    if (parsedOrderItems && Array.isArray(parsedOrderItems)) {
      aggregatedItems = parsedOrderItems.reduce(
        (acc, item) => {
          const { productId, partId, quantity, bom } = item;

          if (productId) {
            acc.products[productId] =
              (acc.products[productId] || 0) + parseInt(quantity);

            if (bom && Array.isArray(bom)) {
              bom.forEach((bomItem) => {
                const { partId: bomPartId, quantity: bomQuantity } = bomItem;
                if (!bomPartId || !bomQuantity) {
                  console.error("Invalid BOM item:", bomItem);
                  throw new HttpError(400, "Invalid BOM item format");
                }
                acc.parts[bomPartId] =
                  (acc.parts[bomPartId] || 0) + bomQuantity;
              });
            }
          } else if (partId) {
            acc.parts[partId] = (acc.parts[partId] || 0) + parseInt(quantity);
          }

          return acc;
        },
        { products: {}, parts: {} }
      );

      partsArray = Object.keys(aggregatedItems.parts).map((key) => {
        return { partId: key, quantity: aggregatedItems.parts[key] };
      });

      productsArray = Object.keys(aggregatedItems.products).map((key) => {
        return { productId: key, quantity: aggregatedItems.products[key] };
      });
    } else {
      throw new HttpError(400, "Invalid orderItems JSON format");
    }

    if (
      orderType === "SALE" &&
      parsedOrderItems &&
      Array.isArray(parsedOrderItems)
    ) {
      const productIds = Object.keys(aggregatedItems.products);
      const partIds = Object.keys(aggregatedItems.parts);

      let products, inventoryParts;
      try {
        [products, inventoryParts] = await Promise.all([
          prisma.products.findMany({
            where: { productId: { in: productIds } },
            select: { productId: true, bom: true, basePrice: true },
          }),
          prisma.inventory.findMany({
            where: { partId: { in: partIds } },
            select: { partId: true, partPrice: true },
          }),
        ]);
      } catch (error) {
        console.error("Database query failed:", error);
        throw new HttpError(500, "Failed to fetch products or inventory data");
      }

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
            if (!product) {
              console.error("Product not found:", productId);
              throw new HttpError(404, `Product ${productId} not found`);
            }
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
            if (!partPrice) {
              console.error("Part not found:", partId);
              throw new HttpError(404, `Part ${partId} not found`);
            }
            return partPrice * parseInt(quantity);
          }
        })
      );

      totalAmount = totalPriceChangesArr.reduce((sum, price) => sum + price, 0);

      try {
        await patchInventoryParts({
          inventoryParts: partsArray,
          isSale: true,
        });
      } catch (error) {
        console.error("Failed to update inventory:", error);
        throw new HttpError(500, "Failed to update inventory");
      }

      try {
        await patchProducts({
          products: productsArray,
          isSale: true,
        });
      } catch (error) {
        console.error("Failed to update products:", error);
        throw new HttpError(500, "Failed to update products");
      }
    } else if (
      orderType === "STOCK" &&
      parsedOrderItems &&
      Array.isArray(parsedOrderItems)
    ) {
      try {
        await patchInventoryParts({ inventoryParts: partsArray });
      } catch (error) {
        console.error("Failed to update inventory:", error);
        throw new HttpError(500, "Failed to update inventory");
      }

      try {
        await patchProducts({ products: productsArray });
      } catch (error) {
        console.error("Failed to update products:", error);
        throw new HttpError(500, "Failed to update products");
      }
    }
    try {
      const orderData =
        orderType === "STOCK"
          ? {
              orderType,
              orderItems: parsedOrderItems,
              salesAgentId,
              salesAgentName: salesAgent.fullName,
            }
          : {
              orderType,
              orderItems: parsedOrderItems,
              salesAgentId,
              customerId,
              customerName: customer?.companyName,
              paymentMethod,
              totalAmount,
              notes,
              salesAgentName: salesAgent.fullName,
            };

      await prisma.orders.create({
        data: orderData,
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      throw new HttpError(500, "Failed to create order in database");
    }
  } catch (error) {
    console.error("Order creation failed:", error);
    throw error;
  }
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