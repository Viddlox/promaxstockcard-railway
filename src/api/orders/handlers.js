import {
  deleteOrders,
  getOrders,
  postCreateOrder,
  exportOrders,
} from "./services.js";
import {
  HttpError,
  formatResponse,
  formatErrorResponse,
} from "../../utils/http.js";

export const handleGetOrders = async (req, res) => {
  try {
    const { limit, cursor, search } = req.query;
    const { role } = req.user;

    const { data, nextCursor, total, hasNextPage } = await getOrders({
      limit,
      cursor,
      search,
      role,
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
      salesAgentId,
      customerId,
      paymentMethod,
      notes,
    } = req.body;

    await postCreateOrder({
      orderType,
      orderItems,
      salesAgentId,
      customerId,
      paymentMethod,
      notes,
    });

    return res.status(200).json({ message: "Order created successfully" });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }

    return res.status(500).json(formatErrorResponse("Error creating order"));
  }
};

export const handleDeleteOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    // Extract userId from request if available
    const userId = req.user?.userId || null;

    const result = await deleteOrders({ orderIds, userId });

    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error deleting orders"));
  }
};

export const handleExportOrders = async (req, res) => {
  try {
    const csvContent = await exportOrders();
    
    // Send as plain text with proper headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    // Send raw CSV content
    return res.send(csvContent);
  } catch (error) {
    console.error("Error handling order export:", error);
    res.status(500).json({ error: "Failed to export orders" });
  }
};
