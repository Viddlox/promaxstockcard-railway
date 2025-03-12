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
  contactName,
  contactEmail,
  contactPhone,
  address,
  city,
  state,
  zip,
  country,
}) => {
  const customer = await prisma.customers.create({
    data: {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      zip,
      country,
    },
  });
  return customer;
};

export const updateCustomer = async ({
  customerId,
  companyName,
  contactName,
  contactEmail,
  contactPhone,
  address,
  city,
  state,
  zip,
  country,
}) => {
  return await prisma.$transaction(async (tx) => {
    // Update all orders that have the given customerId
    await tx.orders.updateMany({
      where: { customerId },
      data: {
        orderItems: tx.$executeRaw`jsonb_set(orderItems, '{companyName}', ${companyName}::jsonb)`,
      },
    });

    // Update the customer details
    const customer = await tx.customers.update({
      where: { customerId },
      data: {
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        address,
        city,
        state,
        zip,
        country,
      },
    });

    return customer;
  });
};

export const deleteCustomer = async ({ customerId }) => {
  const customer = await prisma.customers.delete({
    where: { customerId },
  });
  return customer;
};
