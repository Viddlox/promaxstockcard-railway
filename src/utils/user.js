import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/variables.js";
const { sign } = jwt;

const generateAccessToken = (userId) => {
  return sign({ id: userId }, jwtSecret, {
    expiresIn: process.env.NODE_ENV === "development" ? "2m" : "1h",
  });
};

const generateRefreshToken = (userId) => {
  return sign({ id: userId }, jwtSecret, { expiresIn: "30d" });
};

export { generateAccessToken, generateRefreshToken }