import type { ScanReport } from "@/lib/types/report";
import { prisma } from "@/lib/prisma";

export type StoredScan = {
  id: string;
  url: string;
  score: number;
  createdAt: string;
  report: ScanReport;
};

const globalForScanStore = globalThis as unknown as {
  scanCache: Map<string, StoredScan> | undefined;
};

export const scanCache =
  globalForScanStore.scanCache ?? new Map<string, StoredScan>();
globalForScanStore.scanCache = scanCache;

let tablesEnsured = false;

async function ensureTablesExist() {
  if (tablesEnsured) return;
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

export async function saveScan(
  url: string,
  score: number,
  report: ScanReport
): Promise<string> {
  const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const storedScan: StoredScan = {
    id: scanId,
    url,
    score,
    createdAt: new Date().toISOString(),
    report,
  };

  // Always cache in memory first for instantaneous retrieval
  scanCache.set(scanId, storedScan);

  // Safely attempt database persistence
  try {
    await ensureTablesExist();
    const dbRecord = await prisma.scan.create({
      data: {
        id: scanId,
        url,
        score,
        results: JSON.stringify(report),
      },
    });
    return dbRecord.id;
  } catch (err) {
    console.warn("Prisma DB save warning (using in-memory fallback):", err);
    return scanId;
  }
}

export async function getScanById(id: string): Promise<StoredScan | null> {
  // Check memory cache first
  const cached = scanCache.get(id);
  if (cached) {
    return cached;
  }

  // Fallback to database
  try {
    await ensureTablesExist();
    const scan = await prisma.scan.findUnique({
      where: { id },
    });

    if (!scan) return null;

    const storedScan: StoredScan = {
      id: scan.id,
      url: scan.url,
      score: scan.score,
      createdAt: scan.createdAt.toISOString(),
      report: JSON.parse(scan.results) as ScanReport,
    };

    scanCache.set(id, storedScan);
    return storedScan;
  } catch (err) {
    console.warn("Prisma DB lookup warning:", err);
    return null;
  }
}

export async function getAllScansSummary(urlFilter?: string | null) {
  const cachedItems = Array.from(scanCache.values())
    .filter((s) => !urlFilter || s.url === urlFilter)
    .map((s) => ({
      id: s.id,
      url: s.url,
      score: s.score,
      createdAt: s.createdAt,
      severityCounts: s.report.severityCounts ?? {
        critical: 0,
        warning: 0,
        notice: 0,
      },
    }));

  try {
    await ensureTablesExist();
    const scans = await prisma.scan.findMany({
      where: urlFilter ? { url: urlFilter } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const dbItems = scans.map((scan) => {
      const results = JSON.parse(scan.results) as ScanReport;
      return {
        id: scan.id,
        url: scan.url,
        score: scan.score,
        createdAt: scan.createdAt.toISOString(),
        severityCounts: results?.severityCounts ?? {
          critical: 0,
          warning: 0,
          notice: 0,
        },
      };
    });

    // Merge cached and DB items, deduplicating by ID
    const itemMap = new Map<string, (typeof dbItems)[0]>();
    for (const item of [...dbItems, ...cachedItems]) {
      itemMap.set(item.id, item);
    }

    return Array.from(itemMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.warn("Prisma DB list warning, returning cached items:", err);
    return cachedItems;
  }
}
