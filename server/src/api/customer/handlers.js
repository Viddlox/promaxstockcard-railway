import { HttpError, formatResponse, formatErrorResponse } from "../../utils/http.js";
import { getCustomers } from "./services.js";

export const handleGetCustomers = async (req, res) => {
	try {
	  const { limit, cursor, search } = req.query;
  
	  const { data, nextCursor, total, hasNextPage } = await getCustomers({
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