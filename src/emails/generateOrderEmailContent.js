/**
 * Generates appropriate email content for order notifications
 *
 * @param {Object} options - The order options
 * @param {string} options.orderType - The type of order (SALE or STOCK)
 * @param {string} options.orderId - The ID of the order
 * @param {Object} options.orderData - The order data
 * @returns {string} - HTML content for the email
 */
const generateOrderEmailContent = ({ orderType, orderId, orderData = {} }) => {
  const {
    customerName = "N/A",
    salesAgentName = "N/A",
    totalAmount = 0,
    paymentMethod = "N/A",
    orderItems = [],
    notes = "",
    createdAt = new Date(),
  } = orderData;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true, // 24-hour clock
    timeZone: "Asia/Kuala_Lumpur", // Malaysia Time Zone
  }).format(new Date(createdAt));

  const formattedAmount = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(totalAmount);

  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

  const encodedId = encodeURIComponent(orderId);

  const redirectUrl = `${baseUrl}/orders?notificationId=${encodedId}`;

  // Format order items for display
  const itemsHtml =
    orderItems && orderItems.length
      ? orderItems
          .map(
            (item) => `
		<tr>
		  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
        item.productName || item.partName || "Unknown"
      }</td>
		  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
        item.quantity || 0
      }</td>
		</tr>
	  `
          )
          .join("")
      : '<tr><td colspan="4" style="padding: 8px; text-align: center;">No items in this order</td></tr>';

  // Add view order button HTML
  const viewOrderButton = `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${redirectUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Order Details</a>
    </div>
  `;

  const htmlBoilerplate = `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>${
        orderType === "SALE"
          ? "New Sales Order Created"
          : "New Stock Order Created"
      }</title>
	  </head>
	  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
	`;

  const htmlFooter = `
	  </body>
	  </html>
	`;

  let emailContent;

  if (orderType === "SALE") {
    emailContent = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
		  <div style="background-color: #007bff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
			<h1 style="color: white; margin: 0; font-size: 24px;">New Sales Order Created</h1>
		  </div>
		  
		  <p style="font-size: 16px; line-height: 1.5;">A new <strong>sales order</strong> has been created in the Promax Stock System.</p>
		  
		  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
			<h2 style="margin-top: 0; color: #333; font-size: 18px;">Order Details</h2>
			<p><strong>Order ID:</strong> ${orderId}</p>
			<p><strong>Date Created:</strong> ${formattedDate}</p>
			<p><strong>Customer:</strong> ${customerName}</p>
			<p><strong>Sales Agent:</strong> ${salesAgentName}</p>
			<p><strong>Payment Method:</strong> ${paymentMethod}</p>
			<p><strong>Total Amount:</strong> ${formattedAmount}</p>
		  </div>
		  
		  <h3 style="color: #333; font-size: 18px;">Order Items</h3>
		  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
			<thead>
			  <tr style="background-color: #f2f2f2;">
				<th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
				<th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Quantity</th>
			  </tr>
			</thead>
			<tbody>
			  ${itemsHtml}
			</tbody>
		  </table>
		  
		  ${
        notes
          ? `
		  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
			<h3 style="margin-top: 0; color: #333; font-size: 16px;">Notes</h3>
			<p style="margin-bottom: 0;">${notes}</p>
		  </div>
		  `
          : ""
      }
      
      ${viewOrderButton}
		  
		  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
			<p>This is an automated notification from the Promax Stock Card System.</p>
			<p>Please do not reply to this email.</p>
		  </div>
		</div>
	  `;
  } else if (orderType === "STOCK") {
    emailContent = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
		  <div style="background-color: #28a745; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
			<h1 style="color: white; margin: 0; font-size: 24px;">Stock Order Notification</h1>
		  </div>
		  
		  <p style="font-size: 16px; line-height: 1.5;">A new <strong>stock order</strong> has been created in the Promax Stock Card System.</p>
		  
		  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
			<h2 style="margin-top: 0; color: #333; font-size: 18px;">Order Details</h2>
			<p><strong>Order ID:</strong> ${orderId}</p>
			<p><strong>Date Created:</strong> ${formattedDate}</p>
			<p><strong>Created By:</strong> ${salesAgentName}</p>
			<p><strong>Total Items:</strong> ${orderItems ? orderItems.length : 0}</p>
		  </div>
		  
		  <h3 style="color: #333; font-size: 18px;">Inventories updated</h3>
		  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
			<thead>
			  <tr style="background-color: #f2f2f2;">
				<th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
				<th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Quantity</th>
			  </tr>
			</thead>
			<tbody>
			  ${itemsHtml}
			</tbody>
		  </table>
		  
		  ${
        notes
          ? `
		  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
			<h3 style="margin-top: 0; color: #333; font-size: 16px;">Notes</h3>
			<p style="margin-bottom: 0;">${notes}</p>
		  </div>
		  `
          : ""
      }

      ${viewOrderButton}
		  
		  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
			<p>This is an automated notification from the Promax Stock Card System.</p>
			<p>Please do not reply to this email.</p>
		  </div>
		</div>
	  `;
  }

  return htmlBoilerplate + emailContent + htmlFooter;
};

export { generateOrderEmailContent };
