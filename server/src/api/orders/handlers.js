import { getOrders, postCreateOrder } from "./services.js";
import { HttpError, formatResponse, formatErrorResponse } from "../../utils/http.js";

export const handleGetOrders = async (req, res) => {
  try {
    const { limit, cursor, search } = req.query;

    const { data, nextCursor, total, hasNextPage } = await getOrders({
      limit,
      cursor,
      search,
    });

    res
      .status(200)
      .json(formatResponse(data, nextCursor, { total, hasNextPage }));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error getting orders"));
  }
};

export const handlePostCreateOrder = async (req, res) => {
  try {
    const {
      orderType,
      orderItems,
      agentId,
      customerId,
      paymentMethod,
      notes,
    } = req.body;

    const { orderData, invoiceData } = await postCreateOrder({
      orderType,
      orderItems,
      agentId,
      customerId,
      paymentMethod,
      notes,
    });

    return res.status(200).json({ orderData, invoiceData });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }

    return res.status(500).json(formatErrorResponse("Error creating order"));
  }
};
