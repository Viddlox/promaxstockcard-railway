import { prisma } from "../../prisma/prisma.js";
import QRCode from "qrcode";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const generateQRImages = async () => {
  console.log("Starting QR image generation...");

  const outputDir = path.join(process.cwd(), "assets", "qr-images");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const productsData = await prisma.products.findMany({
    select: { productId: true, productName: true, orderRedirectUrl: true },
  });

  const inventoryData = await prisma.inventory.findMany({
    select: { partId: true, partName: true, orderRedirectUrl: true },
  });

  const QRImageData = [
    ...productsData.map((item) => ({
      id: item.productId,
      name: item.productName,
      type: "product",
      redirectUrl: item.orderRedirectUrl,
    })),
    ...inventoryData.map((item) => ({
      id: item.partId,
      name: item.partName,
      type: "part",
      redirectUrl: item.orderRedirectUrl,
    })),
  ];

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });

  // Generate QR images for each item
  for (const item of QRImageData) {
    try {
      console.log(`Generating QR code for ${item.type}: ${item.name}`);

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(item.redirectUrl || "", {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // Create HTML content
      const htmlContent = generateHTMLContent(item, qrDataUrl);

      // Set HTML content
      await page.setContent(htmlContent);

      // Wait for content to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const sanitizeFilename = (name) =>
        name.replace(/[^a-z0-9_\-()&[\]\s]/gi, "_");

      const safeId = sanitizeFilename(item.id);
      const filename = `qr-${item.type}-${safeId}.png`;
      const filepath = path.join(outputDir, filename);

      // Take screenshot

      await page.screenshot({
        path: filepath,
        fullPage: true,
        type: "png",
      });

      console.log(`✓ Generated: ${filename}`);
    } catch (error) {
      console.error(
        `Error generating QR code for ${item.type} ${item.id}:`,
        error
      );
    }
  }

  await browser.close();
  console.log(`QR image generation completed! Images saved to: ${outputDir}`);
};

/**
 * Generates HTML content for QR code image
 * @param {Object} item - The item data (product or part)
 * @param {string} qrDataUrl - Base64 data URL of the QR code
 * @returns {string} HTML content
 */
const generateHTMLContent = (item, qrDataUrl) => {
  const typeLabel = item.type === "product" ? "Product" : "Part";
  const idLabel = item.type === "product" ? "Product ID" : "Part ID";

  return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>QR Code - ${typeLabel}: ${item.name}</title>
			<style>
				body {
					margin: 0;
					padding: 20px;
					font-family: Arial, sans-serif;
					background-color: #ffffff;
					display: flex;
					justify-content: center;
					align-items: center;
					min-height: 100vh;
				}
				.qr-container {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					background: white;
					padding: 40px;
					border-radius: 10px;
					box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
					max-width: 400px;
					text-align: center;
				}
				.qr-image {
					margin-bottom: 20px;
					border-radius: 10px;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				}
				.item-id {
					font-size: 14px;
					color: #666;
					margin-bottom: 8px;
					font-weight: 500;
				}
				.item-name {
					font-size: 18px;
					color: #333;
					font-weight: bold;
					margin-bottom: 0;
					line-height: 1.3;
				}
				.type-badge {
					display: inline-block;
					background-color: ${item.type === "product" ? "#17a2b8" : "#28a745"};
					color: white;
					padding: 4px 12px;
					border-radius: 20px;
					font-size: 12px;
					font-weight: bold;
					text-transform: uppercase;
					margin-bottom: 15px;
				}
			</style>
		</head>
		<body>
			<div class="qr-container">
				<div class="type-badge">${typeLabel}</div>
				<img src="${qrDataUrl}" alt="QR Code" class="qr-image" />
				<div class="item-id">${idLabel}: ${item.id}</div>
				<div class="item-name">${item.name}</div>
			</div>
		</body>
		</html>
	`;
};

// Execute the function
generateQRImages()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

export default generateQRImages;
