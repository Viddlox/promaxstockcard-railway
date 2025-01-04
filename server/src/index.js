import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// import { dashboardRoutes } from "./api/dashboard/routes.js";
import { productRoutes } from "./api/products/routes.js";
import { inventoryRoutes } from "./api/inventory/routes.js";
import { orderRoutes } from "./api/orders/routes.js";
// import { invoicesRoutes } from "./api/invoices/routes.js";
import { customerRoutes } from "./api/customer/routes.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
// app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/orders", orderRoutes);
// app.use("/invoices", invoicesRoutes);
app.use("/customers", customerRoutes)

/* SERVER */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
