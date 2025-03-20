import crypto from "crypto";
import { promisify } from "util";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const { verify, decode } = jwt;

import { prisma } from "../../../prisma/prisma.js";
import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/user.js";
import { jwtSecret } from "../../config/variables.js";

const randomBytesAsync = promisify(crypto.randomBytes);

export const getUsers = async ({
  limit,
  cursor,
  role = "STORE",
  search = "",
}) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery
    ? JSON.parse(decodeURIComponent(cursorQuery))
    : null;

  try {
    const users = await prisma.users.findMany({
      take: limitQuery,
      skip: parsedCursor ? 1 : 0,
      cursor: parsedCursor
        ? {
            userId: parsedCursor.userId,
          }
        : undefined,
      where: {
        AND: [
          role ? { role: role } : {},
          search
            ? {
                OR: [
                  { username: { contains: search, mode: "insensitive" } },
                  { fullName: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      orderBy: [{ updatedAt: "desc" }, { userId: "asc" }],
    });

    const totalCount = await prisma.users.count({
      where: {
        AND: [
          role ? { role: role } : {},
          search
            ? {
                OR: [
                  { username: { contains: search, mode: "insensitive" } },
                  { fullName: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
    });

    const nextCursor =
      users.length === limitQuery
        ? {
            updatedAt: users[users.length - 1].updatedAt,
            userId: users[users.length - 1].userId,
          }
        : null;

    return {
      data: users,
      nextCursor,
      total: totalCount,
      hasNextPage: nextCursor !== null,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new HttpError(500, "Error fetching users");
  }
};

export const createUser = async ({ email = "", fullName, role }) => {
  if (!role || !fullName) {
    throw new HttpError(400, "Missing required fields");
  }

  let username;
  let isUnique = false;

  while (!isUnique) {
    username = `${fullName}_${crypto.randomBytes(5).toString("hex")}`;
    const existingUser = await prisma.users.findUnique({ where: { username } });
    if (!existingUser) isUnique = true;
  }

  const rawPassword = (await randomBytesAsync(6)).toString("hex");
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const newUser = await prisma.users.create({
    data: {
      username,
      email,
      fullName,
      role,
      password: hashedPassword,
    },
  });

  return { newUser, rawPassword };
};

export const deleteUser = async ({ userIds = [] }) => {
  if (userIds.length === 0) {
    throw new HttpError(400, "Missing required fields");
  }

  await prisma.users.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });
};

export const signIn = async ({ username, password, refreshToken }) => {
  const parsedUsername = username?.toLowerCase().trim();
  const parsedPassword = password?.trim();

  if (!parsedUsername || !parsedPassword) {
    throw new HttpError(400, "Username and password are required");
  }

  const user = await prisma.users.findFirst({
    where: { username: parsedUsername },
    select: {
      userId: true,
      username: true,
      fullName: true,
      password: true,
      refreshTokens: true,
      role: true,
    },
  });

  if (!user) {
    throw new HttpError(401, "There are no users with these credentials");
  }

  const matched = await bcrypt.compare(parsedPassword, user.password);

  if (!matched) {
    throw new HttpError(401, "There are no users with these credentials");
  }

  // Generate new access and refresh tokens
  const accessToken = generateAccessToken(user.userId, user.role);
  const newRefreshToken = generateRefreshToken(user.userId, user.role);

  let refreshTokenData = !refreshToken
    ? user.refreshTokens
    : user.refreshTokens.filter((token) => token !== refreshToken);

  if (refreshToken) {
    const foundToken = await prisma.users.findFirst({
      refreshToken: refreshToken,
    });
    if (!foundToken) {
      refreshTokenData = [];
    }
  }

  refreshTokenData = [...refreshTokenData, newRefreshToken];

  await prisma.users.update({
    where: { userId: user.userId },
    data: { refreshTokens: refreshTokenData },
  });

  return {
    userId: user.userId,
    accessToken,
    refreshToken: newRefreshToken,
    userRole: user.role,
    fullName: user.fullName,
  };
};

export const signOut = async ({ userId, refreshToken }) => {
  const user = await prisma.users.findFirst({
    where: { userId: userId },
    select: { refreshTokens: true },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  // Remove the specified refresh token
  const updatedTokens = user.refreshTokens.filter(
    (token) => token !== refreshToken
  );

  // Update the database with the new refreshTokens array
  await prisma.users.update({
    where: { userId: userId },
    data: { refreshTokens: updatedTokens },
  });

  return "Logout successful";
};

export const generateTokens = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw new HttpError(400, "Require refreshToken");
  }

  // Check if refresh token exists in the database
  const foundUser = await prisma.users.findFirst({
    where: { refreshTokens: { has: refreshToken } },
    select: { userId: true, role: true, refreshTokens: true },
  });

  // Detect reused token (token does not exist in DB)
  if (!foundUser) {
    verify(refreshToken, jwtSecret, async (err, decoded) => {
      if (err) {
        return;
      }
      await prisma.users.update({
        where: { userId: decoded.userId },
        data: { refreshTokens: [] },
      });
    });
    throw new HttpError(403, "Forbidden");
  }

  // Remove the used refresh token from the list
  const refreshTokenData = foundUser.refreshTokens.filter(
    (token) => token !== refreshToken
  );

  return verify(refreshToken, jwtSecret, async (err, decoded) => {
    if (err) {
      await prisma.users.update({
        where: { userId: foundUser.userId },
        data: { refreshTokens: refreshTokenData },
      });
      throw new HttpError(403, "Forbidden");
    }

    const userId = decoded.userId;
    const userRole = decoded.role;
    if (userId !== foundUser.userId.toString()) {
      throw new HttpError(403, "Forbidden");
    }

    const accessToken = generateAccessToken(userId, userRole);
    const newRefreshToken = generateRefreshToken(userId, userRole);

    let newRefreshTokenData = [...refreshTokenData, newRefreshToken];

    const expiredRefreshTokens = foundUser.refreshTokens.filter((token) => {
      const decodedToken = decode(token);
      return decodedToken.exp < Date.now() / 1000;
    });

    if (expiredRefreshTokens.length) {
      newRefreshTokenData = foundUser.refreshTokens.filter(
        (token) => !expiredRefreshTokens.includes(token)
      );
    }

    await prisma.users.update({
      where: { userId: userId },
      data: { refreshTokens: newRefreshTokenData },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  });
};

export const patchUser = async ({ userId, email, fullName, role }) => {
  if (!userId || !fullName || !role) {
    throw new HttpError(400, "Missing required fields");
  }

  const user = await prisma.users.findUnique({ where: { userId } });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const updatedUser = await prisma.users.update({
    where: { userId },
    data: { fullName, role, email },
  });

  return updatedUser;
};

export const getMe = async ({ userId }) => {
  const user = await prisma.users.findUnique({ where: { userId } });
  return user;
};
