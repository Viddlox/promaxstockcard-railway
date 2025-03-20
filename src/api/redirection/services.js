import { HttpError } from "../../utils/http.js";
import { prisma } from "../../../prisma/prisma.js";

export const createRedirectionUrl = async ({
  itemType = "product",
  orderType = "STOCK",
  id,
}) => {
  try {
    if (!itemType || !id || !orderType) {
      throw new HttpError(400, "Missing required fields");
    }

    let item;
    let key;
    let model;

    if (itemType === "product") {
      model = prisma.products;
      key = "productId";
    } else if (itemType === "part") {
      model = prisma.inventory;
      key = "partId";
    } else {
      throw new HttpError(400, "Invalid itemType");
    }

    item = await model.findUnique({
      where: { [key]: id },
      select: { orderRedirectUrl: true },
    });

    if (!item) {
      throw new HttpError(404, "Item not found");
    }

    let redirectUrl = item.orderRedirectUrl;

    if (!redirectUrl) {
      const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

      const encodedId = encodeURIComponent(id);
      const encodedOrderType = encodeURIComponent(orderType);
      const encodedItemType = encodeURIComponent(itemType);

      redirectUrl = `${baseUrl}/orders?id=${encodedId}&orderType=${encodedOrderType}&itemType=${encodedItemType}`;

      await model.update({
        where: { [key]: id },
        data: { orderRedirectUrl: redirectUrl },
      });
    }
    return redirectUrl;
  } catch (error) {
    throw new HttpError(500, "Internal Server Error");
  }
};
