import { PrismaClient } from "@prisma/client";

// Prevent multiple PrismaClient instances in development due to Next.js hot-reload.
// In production a single instance is created at startup and reused across requests.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
