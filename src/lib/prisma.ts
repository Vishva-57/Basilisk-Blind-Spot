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

let prismaInstance: any;

try {
  const { PrismaClient } = require("@prisma/client");
  prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
} catch {
  prismaInstance = null;
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma = globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let tablesEnsured = false;

// Ensures SQLite database tables exist on serverless deployments
export async function ensureTablesExist() {
  if (tablesEnsured || !prisma) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Scan" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "url" TEXT NOT NULL,
        "score" INTEGER NOT NULL,
        "results" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Scan_url_idx" ON "Scan"("url");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Scan_createdAt_idx" ON "Scan"("createdAt");`);
    tablesEnsured = true;
  } catch (err) {
    console.warn("Could not auto-create Scan table:", err);
  }
}
