import { PrismaClient } from "@prisma/client";
import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";
import crypto from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();
const randomBytesAsync = promisify(crypto.randomBytes);

export const getUsers = async ({ limit, cursor, role = "", search = "" }) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery ? JSON.parse(cursorQuery) : null;

  const users = await prisma.users.findMany({
    take: limitQuery,
    skip: parsedCursor ? 1 : 0,
    cursor: parsedCursor
      ? {
          updatedAt_userId: {
            updatedAt: parsedCursor.updatedAt,
            userId: parsedCursor.userId,
          },
        }
      : undefined,
    where: {
      AND: [
        role ? { role: role } : {},
        search ? { username: { contains: search, mode: "insensitive" } } : {},
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = await prisma.users.count({
    where: {
      AND: [
        role ? { role: role } : {},
        search ? { username: { contains: search, mode: "insensitive" } } : {},
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
  const hashedPassword = crypto
    .createHash("sha256")
    .update(rawPassword)
    .digest("hex");

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
