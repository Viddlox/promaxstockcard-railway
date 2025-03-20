import { formatErrorResponse } from "../../utils/http.js";

import { createRedirectionUrl } from "./services.js";

export const handleCreateRedirectionUrl = async (req, res) => {
  try {
    const { id, itemType, orderType = "STOCK" } = req.body;
    const redirectUrl = await createRedirectionUrl({ id, itemType, orderType });
    return res.status(200).json({ redirectUrl });
  } catch (e) {
    return res
      .status(500)
      .json(formatErrorResponse("Error creating redirection URL"));
  }
};
