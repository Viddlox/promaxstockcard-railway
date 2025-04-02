/**
 * Generates email content for manual product update notifications
 *
 * @param {Object} options - Options for the email content
 * @param {string} options.productName - Name of the product
 * @param {string} options.productId - ID of the product
 * @param {number} options.prevQuantity - Previous quantity before update
 * @param {number} options.newQuantity - New quantity after update
 * @param {string} options.updatedBy - Name of the user who made the update (optional)
 * @returns {string} - HTML content for the email
 */
export const generateProductUpdateEmailContent = ({ 
  productName, 
  productId, 
  prevQuantity, 
  newQuantity,
  updatedBy = "A user"
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const encodedId = encodeURIComponent(productId);
  const redirectUrl = `${baseUrl}/products?notificationId=${encodedId}`;
  
  // Determine if this is an increase or decrease in quantity
  const isIncrease = newQuantity > prevQuantity;
  const difference = Math.abs(newQuantity - prevQuantity);
  const changeColor = isIncrease ? "#28a745" : "#dc3545"; // Green for increase, red for decrease
  
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
      <title>Product Update: ${productName}</title>
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
        <h1 style="color: white; margin: 0; font-size: 24px;">Manual Product Update</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5;">
        ${updatedBy} has manually updated the quantity for a product.
      </p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #333; font-size: 18px;">Product Details</h2>
        <p><strong>Product Name:</strong> ${productName}</p>
        <p><strong>Product ID:</strong> ${productId}</p>
        <p><strong>Previous Quantity:</strong> ${prevQuantity}</p>
        <p><strong>New Quantity:</strong> <span style="color: ${changeColor}; font-weight: bold;">${newQuantity}</span></p>
        <p><strong>Change:</strong> <span style="color: ${changeColor}; font-weight: bold;">${isIncrease ? '+' : '-'}${difference} units</span></p>
      </div>
      
      ${newQuantity <= 50 ? `
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Low Stock Warning</h3>
        <p style="margin-bottom: 0;">This product is now at a low stock level (${newQuantity} units). Consider restocking soon.</p>
      </div>
      ` : ''}
      
      ${viewButton}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
        <p>This is an automated notification from the Promax Stock Card System.</p>
        <p>Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return htmlBoilerplate + emailContent + htmlFooter;
}; 