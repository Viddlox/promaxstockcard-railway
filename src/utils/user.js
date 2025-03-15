import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/variables.js";
const { sign } = jwt;

const generateAccessToken = (userId, role) => {
  return sign(
    {
      userId, // Also include as userId for clarity
      role,
    },
    jwtSecret,
    {
      expiresIn: process.env.NODE_ENV === "development" ? "2m" : "1h",
    }
  );
};

const generateRefreshToken = (userId, role) => {
  return sign(
    {
      userId, // Also include as userId for clarity
      role,
    },
    jwtSecret,
    {
      expiresIn: "30d",
    }
  );
};

export { generateAccessToken, generateRefreshToken };
