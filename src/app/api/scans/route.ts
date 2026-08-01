import { NextRequest, NextResponse } from "next/server";
import { getAllScansSummary } from "@/lib/scanStore";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const urlFilter = request.nextUrl.searchParams.get("url");
  const summaries = await getAllScansSummary(urlFilter);
  return NextResponse.json({ scans: summaries });
}
