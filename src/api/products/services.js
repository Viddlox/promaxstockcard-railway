import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";
import { prisma } from "../../../prisma/prisma.js";
import { sumBomChanges } from "../../utils/orderCalculation.js";
export const getProducts = async ({ limit, cursor, search = "" }) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery ? JSON.parse(cursorQuery) : null;

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
    where: search
      ? { productName: { contains: search, mode: "insensitive" } }
      : {},
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = await prisma.products.count({
    where: search
      ? { productName: { contains: search, mode: "insensitive" } }
      : {},
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
}) => {
  if (
    !productId ||
    !productName ||
    !basePrice ||
    quantity === undefined ||
    !bom
  ) {
    throw new HttpError(400, "Missing required fields");
  }

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

  const newProduct = await prisma.products.create({
    data: {
      productId,
      productName,
      basePrice,
      quantity: parseInt(quantity, 10),
      bom: bom.length ? JSON.parse(bom) : null,
    },
  });

  return newProduct;
};

export const deleteProducts = async ({ productIds = [] }) => {
  if (productIds.length === 0) {
    throw new HttpError(400, "Missing required fields");
  }

  await prisma.products.deleteMany({
    where: {
      productId: {
        in: productIds,
      },
    },
  });
};

export const patchProducts = async ({ products, isSale = false }) => {
  if (!products || products.length === 0) {
    return;
  }
  try {
    const updatedProducts = await Promise.all(
      products.map(async ({ productId, bom, quantity }) => {
        const currentProduct = await prisma.products.findUnique({
          where: { productId },
          select: { quantity: true, bom: true, productName: true },
        });

        if (!currentProduct) {
          throw new HttpError(404, `Product ${productId} not found`);
        }

        const updatedQuantity =
          currentProduct.quantity +
          (isSale ? -parseInt(quantity) : parseInt(quantity));

        if (updatedQuantity < 0) {
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

        const updatedProduct = await prisma.products.update({
          where: { productId },
          data: updateData,
        });

        return updatedProduct;
      })
    );

    return updatedProducts;
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
}) => {
  if (
    !productId ||
    !productName ||
    !basePrice ||
    quantity === undefined ||
    !bom
  ) {
    throw new HttpError(400, "Missing required fields");
  }

  if (quantity < 0) {
    throw new HttpError(400, "Quantity cannot be negative");
  }

  return await prisma.$transaction(async (tx) => {
    const existingProduct = await tx.products.findUnique({
      where: { productId },
    });

    if (!existingProduct) {
      throw new HttpError(404, "Product not found");
    }

    await tx.products.update({
      where: { productId },
      data: { productName, basePrice, quantity, bom },
    });

    return {
      message: "Product updated successfully",
      productId,
    };
  });
};
