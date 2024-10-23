import { formatErrorResponse, HttpError } from "../../utils/http.js";
import { getDashboardMetrics } from "./services.js";

export const handleGetDashboardMetrics = async (req, res) => {
  try {
    const {
      inventorySummaryData,
      topProductsSummaryData,
      salesSummaryData,
      topFewestPartsData,
    } = await getDashboardMetrics();

    res
      .status(200)
      .json({
        inventorySummaryData,
        topProductsSummaryData,
        salesSummaryData,
        topFewestPartsData,
      });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res
      .status(500)
      .json(formatErrorResponse("Error getting dashboard metrics"));
  }
};
