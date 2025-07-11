import { PrismaClient } from "@prisma/client";

/** @type {globalThis & { prisma?: PrismaClient }} */
const globalForPrisma = globalThis;

/** @type {import('@prisma/client').PrismaClient} */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma; // ✅ Store instance globally in development
}
