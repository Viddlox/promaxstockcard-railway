import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";

import { prisma } from "../../../prisma/prisma.js";
import { sendAndCreateNotification } from "../notifications/services.js";
import { generateLowStockEmailContent } from "../../emails/generateLowStockEmailContent.js";
import { generateInventoryUpdateEmailContent } from "../../emails/generateInventoryUpdateEmailContent.js";
import { generateInventoryCreateEmailContent } from "../../emails/generateInventoryCreateEmailContent.js";
import { generateInventoryDeleteEmailContent } from "../../emails/generateInventoryDeleteEmailContent.js";

// Import Node Cache if not already imported
import NodeCache from 'node-cache';
import { stringify } from 'csv-stringify/sync';
import { formatDate } from "../../utils/date.js";

// Initialize cache
const inventoryCache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 600, // Check every 10 minutes
});

const CACHE_KEY = 'inventory_export';

export const getInventory = async ({ limit, cursor, search = "" }) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery ? JSON.parse(cursorQuery) : null;

  const whereClause = search
    ? {
        OR: [
          { partName: { contains: search, mode: "insensitive" } },
          { partId: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const inventory = await prisma.inventory.findMany({
    take: limitQuery,
    skip: parsedCursor ? 1 : 0,
    cursor: parsedCursor
      ? {
          updatedAt_partId: {
            updatedAt: parsedCursor.updatedAt,
            partId: parsedCursor.partId,
          },
        }
      : undefined,
    where: whereClause,
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = await prisma.inventory.count({
    where: whereClause,
  });

  const nextCursor =
    inventory.length === limitQuery
      ? {
          updatedAt: inventory[inventory.length - 1].updatedAt,
          partId: inventory[inventory.length - 1].partId,
        }
      : null;

  return {
    data: inventory,
    nextCursor,
    total: totalCount,
    hasNextPage: nextCursor !== null,
  };
};

export const postCreateInventoryPart = async ({
  partId,
  partName,
  partPrice,
  partQuantity,
  partUoM = "UNIT",
  userId = null,
}) => {
  if (!partId || !partName || !partPrice || partQuantity === undefined) {
    throw new HttpError(400, "Missing required fields");
  }

  let newInventoryPart;
  let createdBy = "A user";

  try {
    newInventoryPart = await prisma.$transaction(async (tx) => {
      // If userId is provided, get the user's name
      if (userId) {
        const user = await tx.users.findUnique({
          where: { userId },
          select: { fullName: true },
        });
        if (user) createdBy = user.fullName;
      }

      // Create the inventory part
      return await tx.inventory.create({
        data: {
          partId,
          partName,
          partPrice,
          partQuantity: parseInt(partQuantity, 10),
          partUoM,
        },
      });
      
      invalidateInventoryCache();
    });

    // Now that the part is created and committed, send the notification
    await sendAndCreateNotification({
      type: "INVENTORY_CREATE",
      title: `New Inventory Part Created: ${newInventoryPart.partName}`,
      content: `Part ${newInventoryPart.partName} has been created with ${newInventoryPart.partQuantity} units`,
      partId: newInventoryPart.partId,
      html: generateInventoryCreateEmailContent({
        partName: newInventoryPart.partName,
        partId: newInventoryPart.partId,
        itemQuantity: newInventoryPart.partQuantity,
        partUoM: newInventoryPart.partUoM,
        createdBy,
      }),
    });

    return newInventoryPart;
  } catch (error) {
    console.error("Error creating inventory part:", error);
    if (error.code === "P2002") {
      throw new HttpError(409, "Part ID already exists");
    }
    throw new HttpError(
      500,
      error.message || "Failed to create inventory part"
    );
  }
};

export const deleteInventoryParts = async ({ partIds = [], userId = null }) => {
  if (partIds.length === 0) {
    throw new HttpError(400, "Missing required fields");
  }

  try {
    // Get part names before deletion
    const parts = await prisma.inventory.findMany({
      where: {
        partId: {
          in: partIds,
        },
      },
      select: {
        partId: true,
        partName: true,
      },
    });

    // Check if any of these parts are used in products' BOM
    const productsWithParts = await prisma.products.findMany({
      where: {
        bom: {
          array_contains: [{ partId: { in: partIds } }],
        },
      },
      select: {
        productId: true,
        productName: true,
      },
    });

    // Get user information if userId is provided
    let deletedBy = "A user";
    if (userId) {
      const user = await prisma.users.findUnique({
        where: { userId },
        select: { fullName: true },
      });
      if (user) deletedBy = user.fullName;
    }

    // Send notification for inventory deletion BEFORE deleting the parts
    try {
      const productsList =
        productsWithParts.length > 0
          ? productsWithParts.map((p) => p.productName).join(", ")
          : "";

      await sendAndCreateNotification({
        type: "INVENTORY_DELETE",
        title: `Inventory Part${partIds.length > 1 ? "s" : ""} Deleted`,
        content: `${
          partIds.length > 1
            ? `${partIds.length} inventory parts have`
            : "An inventory part has"
        } been deleted`,
        partId: partIds[0], // Using first ID for reference
        html: generateInventoryDeleteEmailContent({
          partId: partIds,
          partName: parts.map((p) => p.partName),
          deletedBy,
          affectedProducts:
            productsWithParts.length > 0
              ? {
                  count: productsWithParts.length,
                  names: productsList,
                }
              : null,
        }),
      });
      console.log(
        `Inventory deletion notification sent for ${partIds.join(", ")}`
      );
    } catch (error) {
      console.error("Failed to send inventory deletion notification:", error);
    }

    // Delete the parts AFTER sending the notifications
    await prisma.inventory.deleteMany({
      where: {
        partId: {
          in: partIds,
        },
      },
    });

    invalidateInventoryCache();

    return {
      message: `${partIds.length} inventory parts deleted successfully`,
      affectedProducts: productsWithParts.length > 0 ? productsWithParts : null,
    };
  } catch (error) {
    console.error("Error deleting inventory parts:", error);
    throw new HttpError(500, "Failed to delete inventory parts");
  }
};

export const patchInventoryParts = async ({
  inventoryParts,
  isSale = false,
}) => {
  if (!inventoryParts || inventoryParts.length === 0) {
    return;
  }

  try {
    // Keep track of the final quantities of all updated parts
    const finalPartQuantities = new Map();
    // Keep track of all updated parts with their details
    const updatedPartsData = [];

    // Process each part sequentially (not in parallel) to avoid race conditions
    for (const { partId, quantity } of inventoryParts) {
      const currentPart = await prisma.inventory.findUnique({
        where: { partId },
        select: { partQuantity: true, partName: true, partId: true },
      });

      if (!currentPart) {
        throw new HttpError(404, `Part ${partId} not found`);
      }

      const updatedQuantity =
        currentPart.partQuantity +
        (isSale ? -parseInt(quantity) : parseInt(quantity));

      if (updatedQuantity < 0) {
        throw new HttpError(
          400,
          `Insufficient quantity for part ${partId} (${currentPart.partName}). Available: ${currentPart.partQuantity}, Requested: ${quantity}`
        );
      }

      // Update the part in the database
      const updatedPart = await prisma.inventory.update({
        where: { partId },
        data: { partQuantity: updatedQuantity },
      });

      // Store the updated part data for later notifications
      updatedPartsData.push({
        previousQuantity: currentPart.partQuantity,
        currentPart: currentPart,
        updatedPart: updatedPart
      });

      // Check if we need to update our map with the lowest quantity
      if (!finalPartQuantities.has(partId) || updatedQuantity < finalPartQuantities.get(partId).quantity) {
        finalPartQuantities.set(partId, {
          quantity: updatedQuantity,
          name: currentPart.partName,
          partId: partId
        });
      }
    }

    // After all DB operations, send notifications for low stock items ONCE per part
    const lowStockNotifications = [];
    
    // First, gather all the low stock notifications we need to send
    for (const [partId, partData] of finalPartQuantities.entries()) {
      if (partData.quantity <= 50) {
        lowStockNotifications.push(
          sendAndCreateNotification({
            type: "LOW_STOCK",
            title: `Low Stock Alert: ${partData.name}`,
            content: `Part ${partData.name} has only ${partData.quantity} units left`,
            partId: partId,
            html: generateLowStockEmailContent({
              itemName: partData.name,
              itemId: partId,
              itemQuantity: partData.quantity,
              itemType: "part",
            }),
          }).catch(error => {
            console.error(`Failed to send low stock notification for ${partId}:`, error);
          })
        );
      }
    }
    
    // Send all low stock notifications in parallel
    if (lowStockNotifications.length > 0) {
      await Promise.all(lowStockNotifications);
      console.log(`Sent ${lowStockNotifications.length} low stock notifications`);
    }

    // Return the list of updated parts
    invalidateInventoryCache();
    return updatedPartsData.map(data => data.updatedPart);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, "Failed to update inventory parts");
  }
};

export const patchInventoryPart = async ({
  partId,
  partName,
  partPrice,
  partQuantity,
  partUoM,
  userId,
}) => {
  if (
    !partId ||
    !partName ||
    !partPrice ||
    partQuantity === undefined ||
    !partUoM ||
    !userId
  ) {
    throw new HttpError(400, "Missing required fields");
  }

  if (partQuantity < 0) {
    throw new HttpError(400, "Quantity cannot be negative");
  }

  try {
    // First perform the database operations in a transaction
    const existingPart = await prisma.inventory.findUnique({
      where: { partId },
      select: { partQuantity: true },
    });

    if (!existingPart) {
      throw new HttpError(404, "Part not found");
    }

    const prevQuantity = existingPart.partQuantity;

    const updatedPart = await prisma.inventory.update({
      where: { partId },
      data: {
        partName,
        partPrice,
        partQuantity: Number(partQuantity),
        partUoM,
      },
    });

    const user = await prisma.users.findUnique({
      where: { userId },
      select: { fullName: true },
    });

    // After transaction is complete, send notifications separately
    await sendAndCreateNotification({
      type: "INVENTORY_UPDATE",
      title: `Inventory Part Updated: ${updatedPart.partName}`,
      content: `Part ${updatedPart.partName} has been updated from ${prevQuantity} to ${updatedPart.partQuantity} units`,
      partId: updatedPart.partId,
      html: generateInventoryUpdateEmailContent({
        partName: updatedPart.partName,
        partId: updatedPart.partId,
        prevQuantity,
        newQuantity: updatedPart.partQuantity,
        updatedBy: user?.fullName || "A user",
      }),
    });

    // Check if inventory level is low and send notification
    if (updatedPart.partQuantity <= 50) {
      await sendAndCreateNotification({
        type: "LOW_STOCK",
        title: `Low Stock Alert: ${updatedPart.partName}`,
        content: `Part ${updatedPart.partName} has only ${updatedPart.partQuantity} units left`,
        partId: updatedPart.partId,
        html: generateLowStockEmailContent({
          itemName: updatedPart.partName,
          itemId: updatedPart.partId,
          itemQuantity: updatedPart.partQuantity,
          itemType: "part",
        }),
      });
    }

    invalidateInventoryCache();

    return updatedPart;
  } catch (error) {
    console.error("Error updating inventory part:", error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, "Failed to update inventory part");
  }
};

export const exportInventory = async () => {
  try {
    let inventoryItems;

    // Try to get data from cache first
    const cachedInventory = inventoryCache.get(CACHE_KEY);
    if (cachedInventory) {
      console.log("Serving inventory from cache");
      inventoryItems = cachedInventory;
    }

    // If no cache or cache disabled, fetch from database
    if (!inventoryItems) {
      console.log("Fetching inventory from database");
      inventoryItems = await prisma.inventory.findMany({
        orderBy: {
          updatedAt: "desc",
        },
      });

      // Store in cache for future requests
      inventoryCache.set(CACHE_KEY, inventoryItems);
    }

    // Create properly formatted array for CSV
    const formattedInventory = inventoryItems.map((item) => {
      return {
        "Part ID": item.partId,
        "Part Name": item.partName,
        "Unit Price": item.partPrice 
          ? `RM ${item.partPrice.toFixed(2)}` 
          : "N/A",
        "Quantity": item.partQuantity || 0,
        "Unit of Measure": item.partUoM || "UNIT",
        "Created At": formatDate(item.createdAt),
        "Last Updated": formatDate(item.updatedAt),
      };
    });

    // Explicitly define columns for consistent order
    const columns = [
      "Part ID",
      "Part Name",
      "Unit Price",
      "Quantity",
      "Unit of Measure",
      "Created At",
      "Last Updated",
    ];

    // Generate CSV string with explicit options
    const csvContent = stringify(formattedInventory, {
      header: true,
      columns: columns,
      record_delimiter: "windows",
      quoted: true, // Force quotes around all fields
      quoted_empty: true,
    });

    return csvContent;
  } catch (error) {
    console.error("Error exporting inventory:", error);
    throw error;
  }
};

// Function to manually invalidate cache (use after inventory updates)
export const invalidateInventoryCache = () => {
  inventoryCache.del(CACHE_KEY);
};
