import { postCreateInvoice, getInvoices } from "./services.js";
import {
  formatErrorResponse,
  formatResponse,
  HttpError,
} from "../../utils/http.js";

export const handleGetInvoices = async (req, res) => {
  try {
    const { limit, cursor, search } = req.query;

    const { data, nextCursor, total, hasNextPage } = await getInvoices({
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
    return res.status(500).json(formatErrorResponse("Error getting invoices"));
  }
};

export const handlePostCreateInvoice = async (req, res) => {
  try {
    const { orderId, customerId, orderData = {} } = req.body;

    const data = await postCreateInvoice({ orderId, customerId, orderData });

    res.status(200).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error creating invoice"));
  }
};
