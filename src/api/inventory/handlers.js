import {
  postCreateInventoryPart,
  getInventory,
  deleteInventoryParts,
  patchInventoryPart,
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
    const { partId, partName, partPrice, partQuantity, partUoM } = req.body;

    const data = await postCreateInventoryPart({
      partId,
      partName,
      partPrice,
      partQuantity,
      partUoM,
    });

    return res.status(200).json({ data });
  } catch (e) {
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

    await deleteInventoryParts({ partIds });

    return res.status(200).json({ message: `${partIds} successfully deleted` });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res
      .status(500)
      .json(formatErrorResponse("Error deleting inventory parts"));
  }
};

export const handlePatchInventoryPart = async (req, res) => {
  try {
    const { partId, newPartId, partName, partPrice, partQuantity, partUoM } =
      req.body;

    const data = await patchInventoryPart({
      partId,
      newPartId,
      partName,
      partPrice,
      partQuantity,
      partUoM,
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
