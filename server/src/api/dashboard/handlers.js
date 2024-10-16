import {
  getTopProducts,
  getSalesSummary,
  getInventorySummary,
} from "./shares.js";

export const handleGetTopProducts = async (req, res) => {
  try {
    const data = await getTopProducts();

    res.status(200).json({
      data,
    });
  } catch (e) {
    res.status(500).json({ message: "Error getting top products" });
  }
};

export const handleGetSalesSummary = async (req, res) => {
  try {
    const data = await getSalesSummary();

    res.status(200).json({
      data,
    });
  } catch (e) {
    res.status(500).json({ message: "Error getting sales summary" });
  }
};

export const handleGetInventorySummary = async (req, res) => {
  try {
    const data = await getInventorySummary();

    res.status(200).json({
      data,
    });
  } catch (e) {
    res.status(500).json({ message: "Error getting inventory summary" });
  }
};
