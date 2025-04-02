import {
  getProducts,
  postCreateProduct,
  deleteProducts,
  patchProduct,
  exportProducts,
  getProductsList,
} from "./services.js";
import {
  HttpError,
  formatErrorResponse,
  formatResponse,
} from "../../utils/http.js";

export const handleGetProducts = async (req, res) => {
  try {
    const { limit, cursor, search } = req.query;

    const { data, nextCursor, total, hasNextPage } = await getProducts({
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
    return res.status(500).json(formatErrorResponse("Error getting products"));
  }
};

export const handlePostCreateProduct = async (req, res) => {
  try {
    const { productId, productName, basePrice, quantity, bom, reorderPoint } =
      req.body;

    // Safely extract user information
    const userId = req.user?.userId || null;

    const data = await postCreateProduct({
      productId,
      productName,
      basePrice,
      quantity,
      bom,
      userId,
      reorderPoint,
    });

    res.status(201).json({ data });
  } catch (e) {
    console.error("Error creating product:", e);
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error creating product"));
  }
};

export const handleDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    // Extract userId from request if available
    const userId = req.user?.userId || null;

    const result = await deleteProducts({ productIds, userId });

    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
};

export const handlePatchProduct = async (req, res) => {
  try {
    const { productId, productName, basePrice, quantity, bom, reorderPoint } =
      req.body;
    const { userId } = req.user;

    const data = await patchProduct({
      productId,
      productName,
      basePrice,
      quantity,
      bom,
      userId,
      reorderPoint,
    });

    return res.status(200).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error updating product"));
  }
};

export const handleExportProducts = async (req, res) => {
  try {
    const csvContent = await exportProducts();

    // Set proper headers with charset
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=products_export_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );

    // Send as plain text
    res.send(csvContent);
  } catch (error) {
    console.error("Error handling product export:", error);
    res.status(500).json({ error: "Failed to export products" });
  }
};

export const handleGetProductsList = async (req, res) => {
  try {
    const products = await getProductsList();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products list:", error);
    res.status(500).json({ error: "Failed to fetch products list" });
  }
};
