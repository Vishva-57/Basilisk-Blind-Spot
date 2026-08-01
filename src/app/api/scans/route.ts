import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ScanReport, SeverityCounts } from "@/lib/types/report";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const urlFilter = request.nextUrl.searchParams.get("url");

  const scans = await prisma.scan.findMany({
    where: urlFilter ? { url: urlFilter } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      url: true,
      score: true,
      createdAt: true,
      results: true,
    },
  });

  const summaries = scans.map((scan) => {
    const results = JSON.parse(scan.results) as ScanReport;
    const severityCounts: SeverityCounts = results?.severityCounts ?? {
      critical: 0,
      warning: 0,
      notice: 0,
    };

    return {
      id: scan.id,
      url: scan.url,
      score: scan.score,
      createdAt: scan.createdAt.toISOString(),
      severityCounts,
    };
  });

  return NextResponse.json({ scans: summaries });
}
