/**
 * Generates email content for product update notifications
 *
 * @param {Object} options - Options for the email content
 * @param {string} options.productName - Name of the product
 * @param {string} options.productId - ID of the product
 * @param {Array} options.changes - Array of change objects {field, oldValue, newValue, displayName}
 * @param {string} options.updatedBy - Name of the user who made the update (optional)
 * @returns {string} - HTML content for the email
 */
export const generateProductUpdateEmailContent = ({ 
  productName, 
  productId,
  changes = [],
  updatedBy = "A user"
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const encodedId = encodeURIComponent(productId);
  const redirectUrl = `${baseUrl}/products?notificationId=${encodedId}`;
  
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

  // Check for quantity changes for special handling
  const quantityChange = changes.find(change => change.field === 'quantity');
  let lowStockWarning = '';
  
  if (quantityChange && Number(quantityChange.newValue) <= 50) {
    lowStockWarning = `
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px;">Low Stock Warning</h3>
        <p style="margin-bottom: 0;">This product is now at a low stock level (${quantityChange.newValue} units). Consider restocking soon.</p>
      </div>
    `;
  }

  // Generate change rows for the email
  const changesHtml = changes.map(change => {
    // Determine styling based on the field type
    let valueStyle = '';
    let changeIndicator = '';
    
    if (change.field === 'quantity') {
      const isIncrease = Number(change.newValue) > Number(change.oldValue);
      const difference = Math.abs(Number(change.newValue) - Number(change.oldValue));
      valueStyle = `color: ${isIncrease ? '#28a745' : '#dc3545'}; font-weight: bold;`;
      changeIndicator = `<span style="${valueStyle}">${isIncrease ? '+' : '-'}${difference} units</span>`;
    } else if (change.field === 'basePrice') {
      valueStyle = 'color: #007bff; font-weight: bold;';
      // Format as currency
      const oldPrice = `RM ${Number(change.oldValue).toFixed(2)}`;
      const newPrice = `RM ${Number(change.newValue).toFixed(2)}`;
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${change.displayName || change.field}</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${oldPrice}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><span style="${valueStyle}">${newPrice}</span></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"></td>
        </tr>
      `;
    } else if (change.field === 'bom' && change.details) {
      // Create detailed BOM changes display
      const { added, removed, modified } = change.details;
      let bomDetailsHtml = '';
      
      if (added.length > 0) {
        bomDetailsHtml += `
          <div style="margin-top: 10px;">
            <p style="margin-bottom: 5px; font-weight: bold; color: #28a745;">Added Components (${added.length}):</p>
            <ul style="margin-top: 0; padding-left: 25px;">
              ${added.map(part => `
                <li>${part.partName || part.partId} (${part.quantity} ${part.partUoM || 'units'})</li>
              `).join('')}
            </ul>
          </div>
        `;
      }
      
      if (removed.length > 0) {
        bomDetailsHtml += `
          <div style="margin-top: 10px;">
            <p style="margin-bottom: 5px; font-weight: bold; color: #dc3545;">Removed Components (${removed.length}):</p>
            <ul style="margin-top: 0; padding-left: 25px;">
              ${removed.map(part => `
                <li>${part.partName || part.partId} (${part.quantity} ${part.partUoM || 'units'})</li>
              `).join('')}
            </ul>
          </div>
        `;
      }
      
      if (modified.length > 0) {
        bomDetailsHtml += `
          <div style="margin-top: 10px;">
            <p style="margin-bottom: 5px; font-weight: bold; color: #007bff;">Modified Components (${modified.length}):</p>
            <ul style="margin-top: 0; padding-left: 25px;">
              ${modified.map(part => `
                <li>${part.partName || part.partId}: ${part.oldQuantity} → ${part.quantity} ${part.partUoM || 'units'}</li>
              `).join('')}
            </ul>
          </div>
        `;
      }
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${change.displayName || change.field}</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${change.oldValue}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${change.newValue}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"></td>
        </tr>
        <tr>
          <td colspan="4" style="padding: 8px; border-bottom: 1px solid #ddd; background-color: #f9f9f9;">
            ${bomDetailsHtml}
          </td>
        </tr>
      `;
    }
    
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${change.displayName || change.field}</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${change.oldValue}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><span style="${valueStyle}">${change.newValue}</span></td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${changeIndicator}</td>
      </tr>
    `;
  }).join('');

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
      <div style="background-color: #007bff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Product Update</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5;">
        ${updatedBy} has updated the following information for a product.
      </p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #333; font-size: 18px;">Product Details</h2>
        <p><strong>Product Name:</strong> ${productName}</p>
        <p><strong>Product ID:</strong> ${productId}</p>
      </div>
      
      <h3 style="color: #333; font-size: 18px;">Changes Made</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Field</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Previous Value</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">New Value</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Change</th>
          </tr>
        </thead>
        <tbody>
          ${changesHtml}
        </tbody>
      </table>
      
      ${lowStockWarning}
      
      ${viewButton}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
        <p>This is an automated notification from the Promax Stock Card System.</p>
        <p>Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return htmlBoilerplate + emailContent + htmlFooter;
}; 