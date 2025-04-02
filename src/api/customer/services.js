import { getLimitAndCursor } from "../../utils/query.js";
import { prisma } from "../../../prisma/prisma.js";

// Import Node Cache if not already imported
import NodeCache from "node-cache";

// Initialize cache
const customerCache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 600, // Check every 10 minutes
});

const CACHE_KEY = "customers_export";

export const getCustomersList = async () => {
  try {
    let customers;
    // Try to get data from cache first
    const cachedCustomers = customerCache.get(CACHE_KEY);
    if (cachedCustomers) {
      console.log("Serving customers from cache");
      customers = cachedCustomers;
    }

    // If no cache or cache disabled, fetch from database
    if (!customers) {
      console.log("Fetching customers from database");
      customers = await prisma.customers.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      // Store in cache for future requests
      customerCache.set(CACHE_KEY, customers);
    }

    return customers;
  } catch (error) {
    console.error("Error fetching customers list:", error);
    throw new HttpError(500, "Failed to fetch customers list");
  }
};

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
  invalidateCustomerCache();
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
    invalidateCustomerCache();
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
  invalidateCustomerCache();
};

// Function to manually invalidate cache (use after customer updates)
export const invalidateCustomerCache = () => {
  customerCache.del(CACHE_KEY);
};
