import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";
import { prisma } from "../../config/variables.js";

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
