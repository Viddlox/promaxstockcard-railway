/**
 * Generates email content for inventory part deletion notifications
 *
 * @param {Object} options - Options for the email content
 * @param {string|string[]} options.partId - ID(s) of the deleted inventory part(s)
 * @param {string|string[]} options.partName - Name(s) of the deleted inventory part(s) (optional)
 * @param {string} options.deletedBy - Name of the user who deleted the part(s) (optional)
 * @param {Object} options.affectedProducts - Information about affected products (optional)
 * @param {number} options.affectedProducts.count - Number of affected products
 * @param {string} options.affectedProducts.names - Comma-separated list of affected product names
 * @returns {string} - HTML content for the email
 */
export const generateInventoryDeleteEmailContent = ({ 
  partId,
  partName = null,
  deletedBy = "A user",
  affectedProducts = null
}) => {
  // Handle both single part and multiple parts
  const partIds = Array.isArray(partId) ? partId : [partId];
  const partNames = Array.isArray(partName) ? partName : partName ? [partName] : partIds;
  
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const redirectUrl = `${baseUrl}/inventory`;
  
  // Generate parts list HTML
  const partsListHtml = partIds.map((id, index) => {
    const name = partNames[index] || id;
    return `<li style="margin-bottom: 5px;"><strong>${name}</strong> (ID: ${id})</li>`;
  }).join("");
  
  // Create view button HTML
  const viewButton = `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${redirectUrl}" style="background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Inventory List</a>
    </div>
  `;

  // Create product warning section if parts are used in products
  const productWarningHtml = affectedProducts ? `
    <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin-top: 0; color: #333; font-size: 16px;">Warning: Deleted Parts Used in Products</h3>
      <p style="font-size: 16px; line-height: 1.5;">
        The recently deleted inventory parts were used in ${affectedProducts.count} ${affectedProducts.count > 1 ? 'products' : 'product'}: <strong>${affectedProducts.names}</strong>
      </p>
      <p style="font-size: 16px; line-height: 1.5;">
        These products will need to have their Bill of Materials updated.
      </p>
    </div>
  ` : '';

  const htmlBoilerplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Inventory Part${partIds.length > 1 ? 's' : ''} Deleted</title>
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
        <h1 style="color: white; margin: 0; font-size: 24px;">Inventory Part${partIds.length > 1 ? 's' : ''} Deleted</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5;">
        ${deletedBy} has deleted ${partIds.length > 1 ? `${partIds.length} inventory parts` : 'an inventory part'} from the system.
      </p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #333; font-size: 18px;">Deleted Inventory Part${partIds.length > 1 ? 's' : ''}</h2>
        <ul style="padding-left: 20px;">
          ${partsListHtml}
        </ul>
      </div>
      
      ${productWarningHtml}
      
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Important Note</h3>
        <p style="margin-bottom: 0;">Any products that used these parts in their Bill of Materials (BOM) will need to be updated.</p>
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