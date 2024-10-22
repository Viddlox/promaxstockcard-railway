import { PrismaClient } from "@prisma/client";
import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";

const prisma = new PrismaClient();

export const getInvoices = async ({ limit, cursor, search }) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery ? JSON.parse(cursorQuery) : null;

  const invoices = await prisma.invoices.findMany({
    take: limitQuery,
    skip: parsedCursor ? 1 : 0,
    cursor: parsedCursor
      ? {
          updatedAt_invoiceId: {
            updatedAt: parsedCursor.updatedAt,
            invoiceId: parsedCursor.invoiceId,
          },
        }
      : undefined,
    where: search ? { orderId: { contains: search, mode: "insensitive" } } : {},
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = await prisma.invoices.count({
    where: search ? { orderId: { contains: search, mode: "insensitive" } } : {},
  });

  const nextCursor =
    invoices.length === limitQuery
      ? {
          updatedAt: invoices[invoices.length - 1].updatedAt,
          invoiceId: invoices[invoices.length - 1].invoiceId,
        }
      : null;

  return {
    data: invoices,
    nextCursor,
    total: totalCount,
    hasNextPage: nextCursor !== null,
  };
};

export const postCreateInvoice = async ({ orderId, orderData = {} }) => {
  if (!orderId) {
    throw new HttpError(400, "Missing required fields");
  }

  const order =
    orderData ||
    (await prisma.orders.findFirst({
      where: { orderId: orderId },
    }));

  if (!order) {
    throw new HttpError(404, "Error finding order");
  }

  const orderSummary = {
    customerId: order.customerId,
    agentId: order.agentId,
    orderItems: order.orderItems,
    setType: order.setType,
    paymentMethod: order.paymentMethod,
    notes: order.notes,
  };

  const newInvoice = await prisma.invoices.create({
    data: {
      orderId,
      orderSummary,
      totalAmount: order.totalAmount,
    },
  });

  return newInvoice;
};
