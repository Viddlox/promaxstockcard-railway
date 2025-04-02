import {
  postCreateInventoryPart,
  getInventory,
  deleteInventoryParts,
  patchInventoryPart,
  exportInventory,
  getInventoryList,
} from "./services.js";

import {
  formatErrorResponse,
  formatResponse,
  HttpError,
} from "../../utils/http.js";

export const handleGetInventory = async (req, res) => {
  try {
    const { limit, cursor, search } = req.query;

    const { data, nextCursor, total, hasNextPage } = await getInventory({
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
    return res.status(500).json(formatErrorResponse("Error getting inventory"));
  }
};

export const handlePostCreateInventoryPart = async (req, res) => {
  try {
    const { partId, partName, partPrice, partQuantity, partUoM, reorderPoint } =
      req.body;

    // Safely extract user information
    const userId = req.user?.userId || null;

    const data = await postCreateInventoryPart({
      partId,
      partName,
      partPrice,
      partQuantity,
      partUoM,
      userId,
      reorderPoint,
    });

    return res.status(200).json({ data });
  } catch (e) {
    console.error("Error creating inventory part:", e);
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }

    return res
      .status(500)
      .json(formatErrorResponse("Error creating inventory part"));
  }
};

export const handleDeleteInventoryParts = async (req, res) => {
  try {
    const { partIds } = req.body;

    // Extract userId from request if available
    const userId = req.user?.userId || null;

    const result = await deleteInventoryParts({ partIds, userId });

    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

export const handlePatchInventoryPart = async (req, res) => {
  try {
    const { partId, partName, partPrice, partQuantity, partUoM, reorderPoint } =
      req.body;
    const { userId } = req.user;

    const data = await patchInventoryPart({
      partId,
      partName,
      partPrice,
      partQuantity,
      partUoM,
      reorderPoint,
      isManualUpdate: true,
      userId,
    });

    return res.status(200).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res
      .status(500)
      .json(formatErrorResponse("Error updating inventory part"));
  }
};

export const handleExportInventory = async (req, res) => {
  try {
    const csvContent = await exportInventory();

    // Set proper headers with charset
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=inventory_export_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );

    // Send as plain text
    res.send(csvContent);
  } catch (error) {
    console.error("Error handling inventory export:", error);
    res.status(500).json({ error: "Failed to export inventory" });
  }
};

export const handleGetInventoryList = async (req, res) => {
  try {
    const inventory = await getInventoryList();
    res.status(200).json(inventory);
  } catch (error) {
    console.error("Error fetching inventory list:", error);
    res.status(500).json({ error: "Failed to fetch inventory list" });
  }
};
