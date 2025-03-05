import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

// Then import other modules
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { passport } from './config/passport.js';

import { productRoutes } from "./api/products/routes.js";
import { inventoryRoutes } from "./api/inventory/routes.js";
import { orderRoutes } from "./api/orders/routes.js";
import { customerRoutes } from "./api/customer/routes.js";
import { userRoutes } from "./api/user/routes.js";

/* CONFIGURATIONS */
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* Initialize Passport */
app.use(passport.initialize());
const passportAuth = passport.authenticate("jwt", { session: false });

/* ROUTES */
app.use("/products", passportAuth, productRoutes);
app.use("/inventory", passportAuth, inventoryRoutes);
app.use("/orders", passportAuth, orderRoutes);
app.use("/customers", passportAuth, customerRoutes);
app.use("/user", userRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
