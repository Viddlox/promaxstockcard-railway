import { getSalesSummary, getInventorySummary } from "./services.js";

import { HttpError, formatErrorResponse } from "../../utils/http.js";

export const handleGetSalesSummary = async (req, res) => {
  try {
    const data = await getSalesSummary();

    res.status(200).json({
      data,
    });
  } catch (e) {
    if (e instanceof HttpError) {
      res.status(e.status).json(formatErrorResponse(e.message));
    }
    res.status(500).json(formatErrorResponse("Error getting sales summary"));
  }
};

export const handleGetInventorySummary = async (req, res) => {
  try {
    const data = await getInventorySummary();

    res.status(200).json({
      data,
    });
  } catch (e) {
    if (e instanceof HttpError) {
      res.status(e.status).json(formatErrorResponse(e.message));
    }
    res
      .status(500)
      .json(formatErrorResponse("Error getting inventory summary"));
  }
};
