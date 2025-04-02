/**
 * Generates email content for low stock notifications
 *
 * @param {Object} options - Options for the email content
 * @param {string} options.itemName - Name of the inventory item
 * @param {string} options.itemId - ID of the inventory item
 * @param {string} options.itemType - Type of the item (part or product)
 * @param {number} options.itemQuantity - Current quantity of the item
 * @returns {string} - HTML content for the email
 */
export const generateLowStockEmailContent = ({ itemName, itemId, itemType, itemQuantity }) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const encodedId = encodeURIComponent(itemId);
  
  // Determine the redirect URL based on item type
  const redirectUrl = itemType === "product" 
    ? `${baseUrl}/products?notificationId=${encodedId}` 
    : `${baseUrl}/inventory?notificationId=${encodedId}`;

  // Create view button HTML
  const viewButton = `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${redirectUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Item Details</a>
    </div>
  `;

  const htmlBoilerplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Low Stock Alert: ${itemName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  `;

  const htmlFooter = `
    </body>
    </html>
  `;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
      <div style="background-color: #dc3545; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Low Stock Alert</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5;">
        A <strong>${itemType}</strong> in your inventory has reached a low stock level and may need to be restocked soon.
      </p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #333; font-size: 18px;">Item Details</h2>
        <p><strong>Item Name:</strong> ${itemName}</p>
        <p><strong>Item ID:</strong> ${itemId}</p>
        <p><strong>Item Type:</strong> ${itemType === "product" ? "Product" : "Inventory Part"}</p>
        <p><strong>Current Quantity:</strong> <span style="color: #dc3545; font-weight: bold;">${itemQuantity}</span></p>
      </div>
      
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Action Required</h3>
        <p style="margin-bottom: 0;">Please review this item and consider restocking to prevent stockouts.</p>
      </div>
      
      ${viewButton}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
        <p>This is an automated notification from the Promax Stock Card System.</p>
        <p>Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return htmlBoilerplate + emailContent + htmlFooter;
};
