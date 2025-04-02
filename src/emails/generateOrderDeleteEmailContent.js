/**
 * Generates email content for a single order deletion notification
 *
 * @param {Object} options - Options for the email content
 * @param {string} options.orderId - ID of the deleted order
 * @param {Object} options.orderDetails - Details about the deleted order (optional)
 * @param {string} options.deletedBy - Name of the user who deleted the order (optional)
 * @returns {string} - HTML content for the email
 */
export const generateOrderDeleteEmailContent = ({ 
  orderId,
  orderDetails = null,
  deletedBy = "A user"
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const redirectUrl = `${baseUrl}/orders`;
  
  // Generate order details HTML
  let detailsHtml = "";
  
  // If we have order details, add them
  if (orderDetails) {
    const order = Array.isArray(orderDetails) ? orderDetails[0] : orderDetails;
    
    detailsHtml = `
      <ul style="margin-top: 5px; margin-bottom: 10px; padding-left: 20px;">
        ${order.orderType ? `<li>Type: ${order.orderType}</li>` : ''}
        ${order.customerName ? `<li>Customer: ${order.customerName}</li>` : ''}
        ${order.salesAgentName ? `<li>Agent: ${order.salesAgentName}</li>` : ''}
        ${order.totalAmount ? `<li>Amount: RM ${order.totalAmount.toFixed(2)}</li>` : ''}
        ${order.createdAt ? `<li>Created: ${new Date(order.createdAt).toLocaleDateString()}</li>` : ''}
      </ul>
    `;
  }
  
  // Create view button HTML
  const viewButton = `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${redirectUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Orders</a>
    </div>
  `;

  const htmlBoilerplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Deleted</title>
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
        <h1 style="color: white; margin: 0; font-size: 24px;">Order Deleted</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5;">
        ${deletedBy} has deleted order #${orderId} from the system.
      </p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #333; font-size: 18px;">Deleted Order</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        ${detailsHtml}
      </div>
      
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Important Note</h3>
        <p style="margin-bottom: 0;">All data associated with this order has been permanently removed from the system.</p>
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