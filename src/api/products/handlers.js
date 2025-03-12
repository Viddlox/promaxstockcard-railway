import {
  getProducts,
  postCreateProduct,
  deleteProducts,
  patchProduct,
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
    const { productId, productName, basePrice, quantity, bom } = req.body;

    const data = await postCreateProduct({
      productId,
      productName,
      basePrice,
      quantity,
      bom,
    });

    res.status(201).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error creating product"));
  }
};

export const handleDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    await deleteProducts({ productIds });

    return res
      .status(200)
      .json({ message: `${productIds} successfully deleted` });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error deleting products"));
  }
};

export const handlePatchProduct = async (req, res) => {
  try {
    const { productId, productName, basePrice, quantity, bom } =
      req.body;

    const data = await patchProduct({
      productId,
      productName,
      basePrice,
      quantity,
      bom,
    });

    return res.status(200).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error updating product"));
  }
};
