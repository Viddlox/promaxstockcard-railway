import { Resend } from "resend";

let resend = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

/**
 * Sends an email using the provided parameters.
 *
 * @param {Object} options - The email options.
 * @param {string|string[]} options.to - The recipient(s) of the email.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.html - The HTML content of the email.
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.log(
      "Resend is not initialized, Please provide RESEND_API_KEY in .env file."
    );
    return;
  }

  if (!Array.isArray(to)) {
    to = [to];
  }

  await resend.emails.send({
    from: "Promaxstockcard <hello@promaxstock.com>",
    to,
    subject,
    html,
  });
};

const titleMapper = ({ itemId, type }) => {
  const titleMap = {
    LOW_STOCK: `Low Stock Report: ${itemId}`,
    ORDER_SALE: `New Sales Order Created: ${itemId}`,
    ORDER_STOCK: `New Stock Order Created: ${itemId}`,
    INVENTORY_CREATE: `New Inventory Part Created: ${itemId}`,
    INVENTORY_UPDATE: `Inventory Part Updated: ${itemId}`,
    INVENTORY_DELETE: `Inventory Part Deleted: ${itemId}`,
    PRODUCT_CREATE: `New Product Created: ${itemId}`,
    PRODUCT_UPDATE: `Product Updated: ${itemId}`,
    PRODUCT_DELETE: `Product Deleted: ${itemId}`,
  };
  return titleMap[type];
};

export { sendEmail, titleMapper };
