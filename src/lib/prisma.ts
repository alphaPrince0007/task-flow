/**
 * Prisma client singleton.
 *
 * Next.js hot-reloads modules in development, which would otherwise create a
 * new PrismaClient (and a new DB connection pool) on every reload and quickly
 * exhaust connections. We cache the instance on globalThis in non-production
 * so there is only ever one.
 */
import { PrismaClient } from "@prisma/client";
import { isProduction } from "@/config/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ["error"] : ["error", "warn"],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
