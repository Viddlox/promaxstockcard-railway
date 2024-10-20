import { PrismaClient } from "@prisma/client";
import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";

const prisma = new PrismaClient();

export const getInventory = async ({ limit, cursor, search = "" }) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery ? JSON.parse(cursorQuery) : null;

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
    where: search
      ? { partName: { contains: search, mode: "insensitive" } }
      : {},
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = await prisma.inventory.count({
    where: search
      ? { partName: { contains: search, mode: "insensitive" } }
      : {},
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
  partUoM,
}) => {
  if (
    !partId ||
    !partName ||
    partPrice === undefined ||
    partQuantity === undefined ||
    !partUoM
  ) {
    throw new HttpError(400, "Missing required fields");
  }

  const newInventoryPart = await prisma.inventory.create({
    data: {
      partId,
      partName,
      partPrice,
      partQuantity: parseInt(partQuantity, 10),
      partUoM,
    },
  });
  return newInventoryPart;
};

export const deleteInventoryParts = async ({ partIds = [] }) => {
  if (partIds.length === 0) {
    throw new HttpError(400, "Missing required fields");
  }

  await prisma.inventory.deleteMany({
    where: {
      partId: {
        in: partIds,
      },
    },
  });
};
