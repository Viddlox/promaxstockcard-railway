/**
 * Generates email content for product deletion notifications
 *
 * @param {Object} options - Options for the email content
 * @param {string|string[]} options.productId - ID(s) of the deleted product(s)
 * @param {string|string[]} options.productName - Name(s) of the deleted product(s) (optional)
 * @param {string} options.deletedBy - Name of the user who deleted the product(s) (optional)
 * @returns {string} - HTML content for the email
 */
export const generateProductDeleteEmailContent = ({ 
  productId,
  productName = null,
  deletedBy = "A user"
}) => {
  // Handle both single product and multiple products
  const productIds = Array.isArray(productId) ? productId : [productId];
  const productNames = Array.isArray(productName) ? productName : productName ? [productName] : productIds;
  
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const redirectUrl = `${baseUrl}/products`;
  
  // Generate products list HTML
  const productsListHtml = productIds.map((id, index) => {
    const name = productNames[index] || id;
    return `<li style="margin-bottom: 5px;"><strong>${name}</strong> (ID: ${id})</li>`;
  }).join("");
  
  // Create view button HTML
  const viewButton = `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${redirectUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Products List</a>
    </div>
  `;

  const htmlBoilerplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Product${productIds.length > 1 ? 's' : ''} Deleted</title>
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
        <h1 style="color: white; margin: 0; font-size: 24px;">Product${productIds.length > 1 ? 's' : ''} Deleted</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5;">
        ${deletedBy} has deleted ${productIds.length > 1 ? `${productIds.length} products` : 'a product'} from the system.
      </p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #333; font-size: 18px;">Deleted Product${productIds.length > 1 ? 's' : ''}</h2>
        <ul style="padding-left: 20px;">
          ${productsListHtml}
        </ul>
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