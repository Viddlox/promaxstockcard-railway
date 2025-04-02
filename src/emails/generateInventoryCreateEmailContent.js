/**
 * Generates email content for inventory part creation notifications
 *
 * @param {Object} options - Options for the email content
 * @param {string} options.partName - Name of the created inventory part
 * @param {string} options.partId - ID of the created part
 * @param {number} options.itemQuantity - Initial quantity of the part
 * @param {string} options.partUoM - Unit of Measure for the part
 * @param {string} options.createdBy - Name of the user who created the part (optional)
 * @returns {string} - HTML content for the email
 */
export const generateInventoryCreateEmailContent = ({ 
  partName, 
  partId, 
  itemQuantity,
  partUoM = "UNIT",
  createdBy = "A user"
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const encodedId = encodeURIComponent(partId);
  const redirectUrl = `${baseUrl}/inventory?notificationId=${encodedId}`;
  
  // Create view button HTML
  const viewButton = `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${redirectUrl}" style="background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Inventory Part</a>
    </div>
  `;

  const htmlBoilerplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Inventory Part Created: ${partName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  `;

  const htmlFooter = `
    </body>
    </html>
  `;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
      <div style="background-color: #17a2b8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Inventory Part Created</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5;">
        ${createdBy} has created a new inventory part in the system.
      </p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #333; font-size: 18px;">Part Details</h2>
        <p><strong>Part Name:</strong> ${partName}</p>
        <p><strong>Part ID:</strong> ${partId}</p>
        <p><strong>Initial Quantity:</strong> <span style="color: #17a2b8; font-weight: bold;">${itemQuantity} ${partUoM}</span></p>
        <p><strong>Unit of Measure:</strong> ${partUoM}</p>
      </div>
      
      ${itemQuantity <= 50 ? `
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Low Stock Warning</h3>
        <p style="margin-bottom: 0;">This part was added with a low quantity (${itemQuantity} ${partUoM}). Consider ordering more inventory soon.</p>
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