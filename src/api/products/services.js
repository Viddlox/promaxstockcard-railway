import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";
import { prisma } from "../../../prisma/prisma.js";
import { generateLowStockEmailContent } from "../../emails/generateLowStockEmailContent.js";
import { generateProductUpdateEmailContent } from "../../emails/generateProductUpdateEmailContent.js";
import { generateProductCreateEmailContent } from "../../emails/generateProductCreateEmailContent.js";
import { generateProductDeleteEmailContent } from "../../emails/generateProductDeleteEmailContent.js";
import { sendAndCreateNotification } from "../notifications/services.js";
import NodeCache from "node-cache";
import { stringify } from "csv-stringify/sync";
import { formatDate } from "../../utils/date.js";
import { Prisma } from "@prisma/client";

// Initialize cache
const productCache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 600, // Check every 10 minutes
});

const CACHE_KEY = "products_export";

export const getProductsList = async () => {
  try {
    let products;
    // Try to get data from cache first
    const cachedProducts = productCache.get(CACHE_KEY);
    if (cachedProducts) {
      console.log("Serving products from cache");
      products = cachedProducts;
    }

    // If no cache or cache disabled, fetch from database
    if (!products) {
      console.log("Fetching products from database");
      products = await prisma.products.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      // Store in cache for future requests
      productCache.set(CACHE_KEY, products);
    }

    return products;
  } catch (error) {
    console.error("Error fetching products list:", error);
    throw new HttpError(500, "Failed to fetch products list");
  }
};

export const getProducts = async ({ limit, cursor, search = "" }) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery ? JSON.parse(cursorQuery) : null;

  const whereClause = search
    ? {
        OR: [
          { productName: { contains: search, mode: "insensitive" } },
          { productId: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const products = await prisma.products.findMany({
    take: limitQuery,
    skip: parsedCursor ? 1 : 0,
    cursor: parsedCursor
      ? {
          updatedAt_productId: {
            updatedAt: parsedCursor.updatedAt,
            productId: parsedCursor.productId,
          },
        }
      : undefined,
    where: whereClause,
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = await prisma.products.count({
    where: whereClause,
  });

  const nextCursor =
    products.length === limitQuery
      ? {
          updatedAt: products[products.length - 1].updatedAt,
          productId: products[products.length - 1].productId,
        }
      : null;

  return {
    data: products,
    nextCursor,
    total: totalCount,
    hasNextPage: nextCursor !== null,
  };
};

export const postCreateProduct = async ({
  productId,
  productName,
  basePrice,
  quantity = 1,
  bom = null,
  userId = null,
  reorderPoint = 50,
}) => {
  if (
    !productId ||
    !productName ||
    !basePrice ||
    quantity === undefined ||
    !bom ||
    reorderPoint === undefined
  ) {
    throw new HttpError(400, "Missing required fields");
  }

  let newProduct;
  let bomWithDetails = [];
  let createdBy = "A user";

  try {
    // First, verify that all parts in the BOM exist
    if (bom && Array.isArray(bom)) {
      const partIds = bom.map((part) => part.partId);

      const existingParts = await prisma.inventory.findMany({
        where: {
          partId: { in: partIds },
        },
        select: {
          partId: true,
        },
      });

      const existingPartIds = existingParts.map((part) => part.partId);

      const missingParts = partIds.filter(
        (partId) => !existingPartIds.includes(partId)
      );

      if (missingParts.length > 0) {
        throw new HttpError(
          400,
          missingParts.length === 1
            ? `${missingParts} does not exist`
            : `${missingParts} do not exist`
        );
      }
    }

    // Create the product in a transaction
    newProduct = await prisma.$transaction(async (tx) => {
      // Parse BOM data if it's a string
      const parsedBom = typeof bom === "string" ? JSON.parse(bom) : bom;

      const product = await tx.products.create({
        data: {
          productId,
          productName,
          basePrice,
          quantity: parseInt(quantity, 10),
          bom: parsedBom,
          reorderPoint,
        },
      });

      invalidateProductsCache();

      // Get detailed parts information for the email
      if (parsedBom && parsedBom.length > 0) {
        const partIds = parsedBom.map((part) => part.partId);
        const parts = await tx.inventory.findMany({
          where: { partId: { in: partIds } },
          select: { partId: true, partName: true },
        });

        // Create a map for easy lookup
        const partsMap = parts.reduce((map, part) => {
          map[part.partId] = part.partName;
          return map;
        }, {});

        // Add part names to the BOM
        bomWithDetails = parsedBom.map((part) => ({
          ...part,
          partName: partsMap[part.partId] || "Unknown Part",
        }));
      }

      // If userId is provided, get the user's name
      if (userId) {
        const user = await tx.users.findUnique({
          where: { userId },
          select: { fullName: true },
        });
        if (user) createdBy = user.fullName;
      }

      return product;
    });

    // Now that the product is created and committed, send notifications
    try {
      await sendAndCreateNotification({
        type: "PRODUCT_CREATE",
        title: `New Product Created: ${newProduct.productName}`,
        content: `Product ${newProduct.productName} has been created with ${newProduct.quantity} units`,
        productId: newProduct.productId,
        html: generateProductCreateEmailContent({
          productName: newProduct.productName,
          productId: newProduct.productId,
          quantity: newProduct.quantity,
          productUoM: "UNIT", // Default UoM for products
          createdBy,
          bom: bomWithDetails,
        }),
      });
    } catch (error) {
      console.error("Failed to send product creation notification:", error);
    }
    return newProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof HttpError) {
      throw error;
    }
    if (error.code === "P2002") {
      throw new HttpError(409, "Product ID already exists");
    }
    throw new HttpError(500, error.message || "Failed to create product");
  }
};

export const deleteProducts = async ({ productIds = [], userId = null }) => {
  if (productIds.length === 0) {
    throw new HttpError(400, "Missing required fields");
  }

  try {
    // Get product names before deletion
    const products = await prisma.products.findMany({
      where: {
        productId: {
          in: productIds,
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

    // Send notification for product deletion BEFORE deleting the products
    try {
      await sendAndCreateNotification({
        type: "PRODUCT_DELETE",
        title: `Product${productIds.length > 1 ? "s" : ""} Deleted`,
        content: `${
          productIds.length > 1
            ? `${productIds.length} products have`
            : "A product has"
        } been deleted`,
        productId: productIds[0], // Using first ID for reference
        html: generateProductDeleteEmailContent({
          productId: productIds,
          productName: products.map((p) => p.productName),
          deletedBy,
        }),
      });
    } catch (error) {
      console.error("Failed to send product deletion notification:", error);
    }

    // Delete the products AFTER sending the notification
    await prisma.products.deleteMany({
      where: {
        productId: {
          in: productIds,
        },
      },
    });

    invalidateProductsCache();

    return { message: `${productIds.length} products deleted successfully` };
  } catch (error) {
    console.error("Error deleting products:", error);
    throw new HttpError(500, "Failed to delete products");
  }
};

export const patchProducts = async ({ products, isSale = false }) => {
  if (!products || products.length === 0) {
    return;
  }

  try {
    // Keep track of the final quantities of all updated products
    const finalProductQuantities = new Map();
    // Keep track of all updated products with their details
    const updatedProductsData = [];

    // Process each product sequentially (not in parallel) to avoid race conditions
    for (const { productId, quantity, bom = null } of products) {
      const currentProduct = await prisma.products.findUnique({
        where: { productId },
        select: {
          quantity: true,
          productName: true,
          bom: true,
          productId: true,
          reorderPoint: true,
        },
      });

      if (!currentProduct) {
        throw new HttpError(404, `Product ${productId} not found`);
      }

      const updatedQuantity =
        currentProduct.quantity +
        (isSale ? -parseInt(quantity) : parseInt(quantity));

      if (isSale && updatedQuantity < 0) {
        throw new HttpError(
          400,
          `Insufficient quantity for product ${productId} (${currentProduct.productName}). Available: ${currentProduct.quantity}, Requested: ${quantity}`
        );
      }

      let updateData = { quantity: updatedQuantity };

      if (bom && Array.isArray(bom)) {
        const currentBom = currentProduct.bom || [];
        const newBom = bom || [];

        const bomHasChanged =
          JSON.stringify(currentBom) !== JSON.stringify(newBom);

        if (bomHasChanged) {
          updateData.bom = newBom;
        }
      }

      // Update the product in the database
      const updatedProduct = await prisma.products.update({
        where: { productId },
        data: updateData,
      });

      // Store the updated product data for later notifications
      updatedProductsData.push({
        previousQuantity: currentProduct.quantity,
        currentProduct: currentProduct,
        updatedProduct: updatedProduct,
      });

      // Check if we need to update our map with the lowest quantity
      if (
        !finalProductQuantities.has(productId) ||
        updatedQuantity < finalProductQuantities.get(productId).quantity
      ) {
        finalProductQuantities.set(productId, {
          quantity: updatedQuantity,
          name: currentProduct.productName,
          productId: productId,
          reorderPoint: currentProduct.reorderPoint,
        });
      }
    }

    // After all DB operations, send notifications for low stock items ONCE per product
    const lowStockNotifications = [];

    // First, gather all the low stock notifications we need to send
    for (const [productId, productData] of finalProductQuantities.entries()) {
      if (productData.quantity <= productData.reorderPoint) {
        lowStockNotifications.push(
          sendAndCreateNotification({
            type: "LOW_STOCK",
            title: `Low Stock Alert: ${productData.name}`,
            content: `Product ${productData.name} has only ${productData.quantity} units left`,
            productId: productId,
            html: generateLowStockEmailContent({
              itemName: productData.name,
              itemId: productId,
              itemQuantity: productData.quantity,
              itemType: "product",
            }),
          }).catch((error) => {
            console.error(
              `Failed to send low stock notification for ${productId}:`,
              error
            );
          })
        );
      }
    }

    // Send all low stock notifications in parallel
    if (lowStockNotifications.length > 0) {
      await Promise.all(lowStockNotifications);
      console.log(
        `Sent ${lowStockNotifications.length} low stock notifications`
      );
    }

    // Return the list of updated products
    invalidateProductsCache();
    return updatedProductsData.map((data) => data.updatedProduct);
  } catch (error) {
    // Handle specific error types
    if (error instanceof HttpError) {
      throw error;
    }
    if (error.code === "P2002") {
      throw new HttpError(
        409,
        "Conflict: Product update failed due to concurrent modification"
      );
    }
    throw new HttpError(500, "Failed to update products");
  }
};

export const patchProduct = async ({
  productId,
  productName,
  basePrice,
  quantity,
  bom,
  userId,
  reorderPoint = 50,
}) => {
  if (!productId || !userId) {
    console.error("Validation error: Missing required fields");
    throw new HttpError(400, "Missing required fields");
  }

  try {
    // Fetch the existing product with all fields
    const existingProduct = await prisma.products.findUnique({
      where: { productId },
    });

    if (!existingProduct) {
      throw new HttpError(404, "Product not found");
    }

    // Validate inputs
    if (quantity !== undefined && quantity < 0) {
      throw new HttpError(400, "Quantity cannot be negative");
    }

    if (reorderPoint !== undefined && reorderPoint < 0) {
      throw new HttpError(400, "Reorder point cannot be negative");
    }

    // Initialize the array for formatted changes FIRST
    const formattedChanges = [];
    
    // Build update data with proper type handling
    const updateData = {};

    if (
      productName !== undefined &&
      productName !== existingProduct.productName
    ) {
      updateData.productName = productName;
      formattedChanges.push({
        field: "productName",
        oldValue: existingProduct.productName,
        newValue: productName,
        displayName: "Product Name",
      });
    }

    // Handle Decimal comparison properly for basePrice
    if (basePrice !== undefined) {
      const existingPrice = existingProduct.basePrice.toString();
      const newPrice = new Prisma.Decimal(basePrice).toString();

      if (existingPrice !== newPrice) {
        updateData.basePrice = basePrice;
        formattedChanges.push({
          field: "basePrice",
          oldValue: existingProduct.basePrice,
          newValue: basePrice,
          displayName: "Base Price",
        });
      }
    }

    if (quantity !== undefined) {
      const newQuantity = Number(quantity);
      if (newQuantity !== existingProduct.quantity) {
        updateData.quantity = newQuantity;
        formattedChanges.push({
          field: "quantity",
          oldValue: existingProduct.quantity,
          newValue: newQuantity,
          displayName: "Quantity",
        });
      }
    }

    if (reorderPoint !== undefined) {
      const newReorderPoint = Number(reorderPoint);
      if (newReorderPoint !== existingProduct.reorderPoint) {
        updateData.reorderPoint = newReorderPoint;
        formattedChanges.push({
          field: "reorderPoint",
          oldValue: existingProduct.reorderPoint,
          newValue: newReorderPoint,
          displayName: "Reorder Point",
        });
      }
    }

    // Special handling for BOM comparison
    if (bom !== undefined) {
      const existingBom = existingProduct.bom || [];
      const newBom = bom || [];
      
      // First check if they're different at all
      const existingBomString = JSON.stringify(existingBom);
      const newBomString = JSON.stringify(newBom);
      
      if (existingBomString !== newBomString) {
        updateData.bom = bom;
        
        // Find added parts
        const addedParts = newBom.filter(newPart => 
          !existingBom.some(existingPart => 
            existingPart.partId === newPart.partId
          )
        );
        
        // Find removed parts
        const removedParts = existingBom.filter(existingPart => 
          !newBom.some(newPart => 
            newPart.partId === existingPart.partId
          )
        );
        
        // Find modified parts (same ID but different quantity)
        const modifiedParts = newBom.filter(newPart => 
          existingBom.some(existingPart => 
            existingPart.partId === newPart.partId && 
            existingPart.quantity !== newPart.quantity
          )
        ).map(newPart => {
          const oldPart = existingBom.find(part => part.partId === newPart.partId);
          return {
            ...newPart,
            oldQuantity: oldPart.quantity
          };
        });
        
        // Create a detailed BOM change entry
        formattedChanges.push({
          field: "bom",
          oldValue: `${existingBom.length} components`,
          newValue: `${newBom.length} components`,
          displayName: "Bill of Materials",
          details: {
            added: addedParts,
            removed: removedParts,
            modified: modifiedParts
          }
        });
      }
    }

    // If nothing changed, return existing product without updating the database
    if (Object.keys(updateData).length === 0) {
      console.log(`No changes detected for product ${productId}`);
      return existingProduct;
    }

    console.log(`Updating product ${productId} with changes:`, updateData);

    // Update the product with only changed fields
    const updatedProduct = await prisma.products.update({
      where: { productId },
      data: updateData,
    });

    // Get user info for the notification
    const user = await prisma.users.findUnique({
      where: { userId },
      select: { fullName: true },
    });

    // Generate a human-readable summary for the notification content
    const content = generateChangeSummary(
      formattedChanges,
      updatedProduct.productName
    );

    // Send change notification
    await sendAndCreateNotification({
      type: "PRODUCT_UPDATE",
      title: `Product Updated: ${updatedProduct.productName}`,
      content: content,
      productId: updatedProduct.productId,
      html: generateProductUpdateEmailContent({
        productName: updatedProduct.productName,
        productId: updatedProduct.productId,
        changes: formattedChanges,
        updatedBy: user?.fullName || "A user",
      }),
    });

    // Check if quantity changed and is below reorder point
    const quantityChanged = updateData.hasOwnProperty("quantity");
    const nowBelowReorderPoint =
      updatedProduct.quantity <= updatedProduct.reorderPoint;
    const wasPreviouslyAboveReorderPoint =
      existingProduct.quantity > existingProduct.reorderPoint;

    // Send low stock notification only when appropriate
    const reorderPointChanged = updateData.hasOwnProperty("reorderPoint");

    if (
      (quantityChanged &&
        nowBelowReorderPoint &&
        wasPreviouslyAboveReorderPoint) ||
      (reorderPointChanged && nowBelowReorderPoint)
    ) {
      await sendAndCreateNotification({
        type: "LOW_STOCK",
        title: `Low Stock Alert: ${updatedProduct.productName}`,
        content: `Product ${updatedProduct.productName} has only ${updatedProduct.quantity} units left`,
        productId: updatedProduct.productId,
        html: generateLowStockEmailContent({
          itemName: updatedProduct.productName,
          itemId: updatedProduct.productId,
          itemQuantity: updatedProduct.quantity,
          itemType: "product",
        }),
      });
    }

    invalidateProductsCache();
    return updatedProduct;
  } catch (error) {
    console.error("Unexpected error in patchProduct:", error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, "Internal server error");
  }
};

/**
 * Generates a human-readable summary of changes for notifications
 * @param {Array} changes - Array of change objects with field, oldValue, newValue, displayName
 * @param {string} productName - Name of the product being updated
 * @returns {string} - A formatted summary of changes
 */
const generateChangeSummary = (changes, productName) => {
  if (!changes.length) return `Product ${productName} has been updated`;

  // Create a readable summary based on the number of changes
  if (changes.length === 1) {
    const change = changes[0];

    // Handle quantity changes with special formatting
    if (change.field === "quantity") {
      const direction =
        Number(change.newValue) > Number(change.oldValue)
          ? "increased"
          : "decreased";
      const diff = Math.abs(Number(change.newValue) - Number(change.oldValue));
      return `${productName}'s quantity ${direction} by ${diff} units (from ${change.oldValue} to ${change.newValue})`;
    }

    // Handle price changes with special formatting
    if (change.field === "basePrice") {
      return `${productName}'s price changed from RM${Number(
        change.oldValue
      ).toFixed(2)} to RM${Number(change.newValue).toFixed(2)}`;
    }

    // Handle BOM changes
    if (change.field === "bom" && change.details) {
      const { added, removed, modified } = change.details;
      const changes = [];
      
      if (added.length > 0) changes.push(`added ${added.length} components`);
      if (removed.length > 0) changes.push(`removed ${removed.length} components`);
      if (modified.length > 0) changes.push(`modified ${modified.length} components`);
      
      return `${productName}'s bill of materials has been updated: ${changes.join(', ')}`;
    }

    // Default formatting for other fields
    return `${productName}'s ${change.displayName.toLowerCase()} changed from "${
      change.oldValue
    }" to "${change.newValue}"`;
  } else if (changes.length === 2) {
    // For two changes, list both specifically
    const fieldNames = changes
      .map((c) => c.displayName.toLowerCase())
      .join(" and ");
    return `${productName}'s ${fieldNames} have been updated`;
  } else {
    // For more than two changes, summarize the number
    return `${productName} has been updated with changes to ${changes.length} fields`;
  }
};

export const exportProducts = async () => {
  try {
    let products;

    // Try to get data from cache first
    const cachedProducts = productCache.get(CACHE_KEY);
    if (cachedProducts) {
      console.log("Serving products from cache");
      products = cachedProducts;
    }

    // If no cache or cache disabled, fetch from database
    if (!products) {
      console.log("Fetching products from database");
      products = await prisma.products.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      // Store in cache for future requests
      productCache.set(CACHE_KEY, products);
    }

    // Create properly formatted array for CSV
    const formattedProducts = products.map((product) => {
      // Format BOM to be more readable
      const formattedBOM =
        product.bom && product.bom.length
          ? product.bom
              .map(
                (item) =>
                  `${item.partName || item.partId || "Unknown"} (${
                    item.quantity || 0
                  } ${item.partUoM || "unit"})`
              )
              .join("; ")
          : "None";

      return {
        "Product ID": product.productId,
        "Product Name": product.productName,
        Quantity: product.quantity,
        "Base Price": product.basePrice
          ? `RM ${product.basePrice.toFixed(2)}`
          : "N/A",
        "Created At": formatDate(product.createdAt),
        "Last Updated": formatDate(product.updatedAt),
        "BOM Items": formattedBOM,
        "BOM Count": product.bom?.length || 0,
        "Reorder Point": product.reorderPoint || 50,
      };
    });

    // Explicitly define columns for consistent order
    const columns = [
      "Product ID",
      "Product Name",
      "Quantity",
      "Base Price",
      "Created At",
      "Last Updated",
      "BOM Count",
      "BOM Items",
      "Reorder Point",
    ];

    // Generate CSV string with explicit options
    const csvContent = stringify(formattedProducts, {
      header: true,
      columns: columns,
      record_delimiter: "windows",
      quoted: true, // Force quotes around all fields
      quoted_empty: true,
    });

    return csvContent;
  } catch (error) {
    console.error("Error exporting products:", error);
    throw error;
  }
};

// Function to manually invalidate cache (use after product updates)
export const invalidateProductsCache = () => {
  productCache.del(CACHE_KEY);
};
