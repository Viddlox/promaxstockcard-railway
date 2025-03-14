import { getLimitAndCursor } from "../../utils/query.js";
import { prisma } from "../../../prisma/prisma.js";

export const getCustomers = async ({ limit, cursor, search }) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery ? JSON.parse(cursorQuery) : null;

  const customers = await prisma.customers.findMany({
    take: limitQuery,
    skip: parsedCursor ? 1 : 0,
    cursor: parsedCursor
      ? {
          updatedAt_customerId: {
            updatedAt: parsedCursor.updatedAt,
            customerId: parsedCursor.customerId,
          },
        }
      : undefined,
    where: search
      ? { companyName: { contains: search, mode: "insensitive" } }
      : {},
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = await prisma.customers.count({
    where: search
      ? { companyName: { contains: search, mode: "insensitive" } }
      : {},
  });

  const nextCursor =
    customers.length === limitQuery
      ? {
          updatedAt: customers[customers.length - 1].updatedAt,
          customerId: customers[customers.length - 1].customerId,
        }
      : null;

  return {
    data: customers,
    nextCursor,
    total: totalCount,
    hasNextPage: nextCursor !== null,
  };
};

export const createCustomer = async ({
  companyName,
  address,
  phoneNumber,
  ssmNumber,
  postCode,
  email,
}) => {
  const customer = await prisma.customers.create({
    data: {
      companyName,
      address,
      phoneNumber,
      ssmNumber,
      postCode,
      email,
    },
  });
  return customer;
};

export const updateCustomer = async ({
  customerId,
  companyName,
  address,
  phoneNumber,
  ssmNumber,
  postCode,
  email,
}) => {
  return await prisma.$transaction(async (tx) => {
    const customer = await tx.customers.update({
      where: { customerId },
      data: {
        companyName,
        address,
        phoneNumber,
        ssmNumber,
        postCode,
        email,
      },
    });
    return customer;
  });
};

export const deleteCustomers = async ({ customerIds = [] }) => {
  if (customerIds.length === 0) {
    throw new HttpError(400, "Missing required fields");
  }

  await prisma.customers.deleteMany({
    where: {
      customerId: {
        in: customerIds,
      },
    },
  });
};
