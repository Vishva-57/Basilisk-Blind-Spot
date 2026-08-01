import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ScanReport } from "@/lib/types/report";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const scan = await prisma.scan.findUnique({
    where: { id: params.id },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: scan.id,
    url: scan.url,
    score: scan.score,
    createdAt: scan.createdAt.toISOString(),
    report: JSON.parse(scan.results) as ScanReport,
  });
}
