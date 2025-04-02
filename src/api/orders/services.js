import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";
import {
  calculateTotalCost,
  sumBomChanges,
} from "../../utils/orderCalculation.js";
import { formatDate } from "../../utils/date.js";

import { patchInventoryParts } from "../inventory/services.js";
import { patchProducts } from "../products/services.js";
import { prisma } from "../../../prisma/prisma.js";
import { generateOrderEmailContent } from "../../emails/generateOrderEmailContent.js";
import { sendAndCreateNotification } from "../notifications/services.js";
import { generateOrderDeleteEmailContent } from "../../emails/generateOrderDeleteEmailContent.js";
import { stringify } from "csv-stringify/sync";
import NodeCache from "node-cache";

// For less frequently changing data
const orderCache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 600, // Check every 10 minutes
});

const CACHE_KEY = "orders_export";

export const getOrders = async ({ limit, cursor, search, role }) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery ? JSON.parse(cursorQuery) : null;

  const roleFilter =
    role === "STORE"
      ? { orderType: "STOCK" }
      : role === "SALES"
      ? { orderType: "SALE" }
      : {};

  const searchFilter = search
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
    : {};

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
    where: {
      ...roleFilter,
      ...searchFilter,
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = await prisma.orders.count({
    where: {
      ...roleFilter,
      ...searchFilter,
    },
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
                if (!bomPartId) {
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
            const changeCount = productBomChanges.length;

            if (changeCount > 0) {
              bomChanges.push({
                productId,
                productName: product.productName,
                modifications: productBomChanges,
                originalBom: backendBom,
                changeCount,
              });
            }

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

    let order;

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
              modifications: bomChanges,
            };

      order = await prisma.orders.create({
        data: orderData,
      });

      invalidateOrdersCache();
    } catch (error) {
      console.error("Failed to create order:", error);
      throw new HttpError(500, "Failed to create order in database");
    }

    try {
      if (order) {
        await sendAndCreateNotification({
          type: orderType === "SALE" ? "ORDER_SALE" : "ORDER_STOCK",
          title:
            orderType === "SALE"
              ? `New Sales Order: #${order.orderId}`
              : `New Stock Order: #${order.orderId}`,
          content:
            orderType === "SALE"
              ? `Sales order #${order.orderId} created for ${
                  order.customerName || "customer"
                } (RM ${totalAmount.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })})`
              : `Stock order #${order.orderId} created by ${salesAgent.fullName} with ${parsedOrderItems.length} item(s)`,
          orderId: order.orderId,
          html: generateOrderEmailContent({
            orderType,
            orderId: order.orderId,
            orderData: order,
          }),
        });
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
      throw new HttpError(500, "Failed to send notification");
    }
  } catch (error) {
    console.error("Order creation failed:", error);
    throw error;
  }
};

export const deleteOrders = async ({ orderIds = [], userId = null }) => {
  if (orderIds.length === 0) {
    throw new HttpError(400, "Missing required fields");
  }

  try {
    // Get order details before deletion
    const orders = await prisma.orders.findMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
      select: {
        orderId: true,
        customerName: true,
        salesAgentName: true,
        totalAmount: true,
        orderType: true,
        createdAt: true,
      },
    });

    if (orders.length === 0) {
      throw new HttpError(404, "No orders found with the provided IDs");
    }

    // Get user information if userId is provided
    let deletedBy = "A user";
    if (userId) {
      const user = await prisma.users.findUnique({
        where: { userId },
        select: { fullName: true },
      });
      if (user) deletedBy = user.fullName;
    }

    // Process each order individually - send notification then delete
    const results = await Promise.all(
      orders.map(async (order) => {
        try {
          // Send notification for this specific order
          await sendAndCreateNotification({
            type: "ORDER_DELETE",
            title: `Order Deleted: #${order.orderId}`,
            content: `Order #${order.orderId} has been deleted`,
            orderId: order.orderId,
            html: generateOrderDeleteEmailContent({
              orderId: order.orderId,
              orderDetails: order,
              deletedBy,
            }),
          });
          console.log(`Order deletion notification sent for ${order.orderId}`);

          // Delete this specific order
          await prisma.orders.delete({
            where: { orderId: order.orderId },
          });

          return { orderId: order.orderId, success: true };
        } catch (error) {
          console.error(
            `Error processing deletion for order ${order.orderId}:`,
            error
          );
          return {
            orderId: order.orderId,
            success: false,
            error: error.message,
          };
        }
      })
    );

    const successfulDeletions = results.filter((r) => r.success);
    const failedDeletions = results.filter((r) => !r.success);

    if (successfulDeletions.length > 0) {
      invalidateOrdersCache();
    }

    return {
      message: `${successfulDeletions.length} orders deleted successfully`,
      deleted: successfulDeletions.map((r) => r.orderId),
      failed: failedDeletions.length > 0 ? failedDeletions : undefined,
    };
  } catch (error) {
    console.error("Error deleting orders:", error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, "Failed to delete orders");
  }
};

export const exportOrders = async () => {
  try {
    let orders;

    // Try to get data from cache first
    const cachedOrders = orderCache.get(CACHE_KEY);
    if (cachedOrders) {
      console.log("Serving orders from cache");
      orders = cachedOrders;
    }

    // If no cache or cache disabled, fetch from database
    if (!orders) {
      console.log("Fetching orders from database");
      orders = await prisma.orders.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      // Store in cache for future requests
      orderCache.set(CACHE_KEY, orders);
    }

    // Create properly formatted array for CSV
    const formattedOrders = orders.map((order) => {
      return {
        "Order ID": order.orderId,
        Type: order.orderType,
        Customer: order.customerName || "N/A",
        "Sales Agent": order.salesAgentName,
        "Total Amount": order.totalAmount
          ? `RM ${order.totalAmount.toFixed(2)}`
          : "N/A",
        "Payment Method": order.paymentMethod || "N/A",
        "Items Count": order.orderItems?.length || 0,
        "Created At": formatDate(order.createdAt),
        "Order Items": order.orderItems
          ? order.orderItems
              .map(
                (item) =>
                  `${item.productName || item.partName || "Unknown"} (${
                    item.quantity
                  })`
              )
              .join("; ")
          : "None",
      };
    });

    // Explicitly define columns for consistent order
    const columns = [
      "Order ID",
      "Type",
      "Customer",
      "Sales Agent",
      "Total Amount",
      "Payment Method",
      "Items Count",
      "Created At",
      "Order Items",
    ];

    // Generate CSV string with explicit options
    const csvContent = stringify(formattedOrders, {
      header: true,
      columns: columns,
      record_delimiter: "windows",
      quoted: true, // Force quotes around all fields
      quoted_empty: true,
    });

    return csvContent;
  } catch (error) {
    console.error("Error exporting orders:", error);
    throw error;
  }
};

// Function to manually invalidate cache (use after order updates)
export const invalidateOrdersCache = () => {
  orderCache.del(CACHE_KEY);
};
