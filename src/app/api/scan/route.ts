import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  runAudit,
  buildReportFromAxe,
  AuditError,
} from "@/lib/audit/runAudit";
import type { ScanReport } from "@/lib/types/report";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please provide a URL to scan." },
        { status: 400 }
      );
    }

    const { url: normalizedUrl, axeResults, screenshot, boundsByTarget } =
      await runAudit(url);
    const report: ScanReport = buildReportFromAxe(
      normalizedUrl,
      axeResults,
      screenshot,
      boundsByTarget
    );

    const scan = await prisma.scan.create({
      data: {
        url: normalizedUrl,
        score: report.score,
        results: JSON.stringify(report),
      },
    });

    return NextResponse.json({
      id: scan.id,
      score: report.score,
      summary: {
        severityCounts: report.severityCounts,
        categoryCounts: report.categoryCounts,
        violationCount: report.violations.length,
        passesCount: report.passesCount,
      },
    });
  } catch (error) {
    if (error instanceof AuditError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Scan failed:", error);
    return NextResponse.json(
      { error: "Could not complete the scan. Please try again." },
      { status: 500 }
    );
  }
}
