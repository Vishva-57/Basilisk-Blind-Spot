import { NextResponse } from "next/server";
import { getScanById } from "@/lib/scanStore";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  const params = await props.params;
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
