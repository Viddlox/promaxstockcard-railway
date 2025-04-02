/**
 * Generates email content for product creation notifications
 *
 * @param {Object} options - Options for the email content
 * @param {string} options.productName - Name of the created product
 * @param {string} options.productId - ID of the created product
 * @param {number} options.quantity - Initial quantity of the product
 * @param {string} options.createdBy - Name of the user who created the product (optional)
 * @param {Array} options.bom - Bill of materials (optional)
 * @returns {string} - HTML content for the email
 */
export const generateProductCreateEmailContent = ({ 
  productName, 
  productId, 
  quantity,
  createdBy = "A user",
  bom = []
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const encodedId = encodeURIComponent(productId);
  const redirectUrl = `${baseUrl}/products?notificationId=${encodedId}`;
  
  // Format BOM parts for display
  const bomHtml = bom && bom.length
    ? bom.map(part => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${part.partName || part.partId || "Unknown"}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${part.quantity || 0}</td>
        </tr>
      `).join("")
    : '<tr><td colspan="2" style="padding: 8px; text-align: center;">No parts in this product</td></tr>';
  
  // Create view button HTML
  const viewButton = `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${redirectUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Product Details</a>
    </div>
  `;

  const htmlBoilerplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Product Created: ${productName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  `;

  const htmlFooter = `
    </body>
    </html>
  `;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
      <div style="background-color: #007bff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Product Created</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5;">
        ${createdBy} has created a new product in the system.
      </p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #333; font-size: 18px;">Product Details</h2>
        <p><strong>Product Name:</strong> ${productName}</p>
        <p><strong>Product ID:</strong> ${productId}</p>
        <p><strong>Initial Quantity:</strong> <span style="color: #007bff; font-weight: bold;">${quantity} units</span></p>
      </div>
      
      ${quantity <= 50 ? `
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Low Stock Warning</h3>
        <p style="margin-bottom: 0;">This product was added with a low quantity (${quantity} units). Consider manufacturing more soon.</p>
      </div>
      ` : ''}
      
      <h3 style="color: #333; font-size: 18px;">Bill of Materials</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Part Name</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${bomHtml}
        </tbody>
      </table>
      
      ${viewButton}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
        <p>This is an automated notification from the Promax Stock Card System.</p>
        <p>Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return htmlBoilerplate + emailContent + htmlFooter;
}; 