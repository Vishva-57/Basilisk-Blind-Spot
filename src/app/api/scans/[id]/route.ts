import { NextResponse } from "next/server";
import { getScanById } from "@/lib/scanStore";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const scan = await getScanById(params.id);

  if (!scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: scan.id,
    url: scan.url,
    score: scan.score,
    createdAt: scan.createdAt,
    report: scan.report,
  });
}
