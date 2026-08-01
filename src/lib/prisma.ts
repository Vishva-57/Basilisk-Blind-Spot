import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function setupDatabaseUrl() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const currentUrl = process.env.DATABASE_URL || "file:./dev.db";
    if (currentUrl.startsWith("file:")) {
      const tmpDbPath = "/tmp/dev.db";
      const localDbPath = path.join(process.cwd(), "prisma", "dev.db");

      try {
        if (!fs.existsSync(tmpDbPath) && fs.existsSync(localDbPath)) {
          fs.copyFileSync(localDbPath, tmpDbPath);
        }
      } catch (err) {
        console.warn("Could not copy dev.db to /tmp:", err);
      }

      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    }
  }
}

setupDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
