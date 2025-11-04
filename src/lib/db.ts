import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton
 * Prevents multiple instances in development hot reload
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Under bygging (når DATABASE_URL ikke er tilgjengelig), returner undefined
// Dette forhindrer at Prisma krasjer under static generation
let db: PrismaClient | undefined;

try {
  if (process.env.DATABASE_URL) {
    db = globalForPrisma.prisma || new PrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = db;
    }
  } else {
    console.warn("DATABASE_URL not found - Prisma Client not initialized");
    db = undefined;
  }
} catch (error) {
  console.error("Failed to initialize Prisma Client:", error);
  db = undefined;
}

export { db };
export const prisma = db; // Alias for backwards compatibility
