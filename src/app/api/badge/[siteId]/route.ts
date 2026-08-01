import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getScoreColor(score: number): string {
  if (score >= 90) return "#10b981"; // emerald-500
  if (score >= 70) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
}

function generateSvg(score: number): string {
  const color = getScoreColor(score);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="28" role="img" aria-label="Accessibility Score: ${score}">
  <title>Accessibility Score: ${score}</title>
  <clipPath id="r">
    <rect width="120" height="28" rx="4" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="80" height="28" fill="#555"/>
    <rect x="80" width="40" height="28" fill="${color}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110" font-weight="bold">
    <text x="400" y="190" transform="scale(.1)" textLength="600">A11Y SCORE</text>
    <text x="1000" y="190" transform="scale(.1)" textLength="200">${score}</text>
  </g>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const siteId = params.siteId;
    
    // First try to find by ID
    let scan = await prisma.scan.findUnique({
      where: { id: siteId },
    });

    // If not found, try to find the latest scan by exact URL
    if (!scan) {
      // url decode if necessary
      const decodedUrl = decodeURIComponent(siteId);
      const urlMatches = await prisma.scan.findMany({
        where: { url: decodedUrl },
        orderBy: { createdAt: "desc" },
        take: 1,
      });
      if (urlMatches.length > 0) {
        scan = urlMatches[0];
      }
    }

    if (!scan) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const svg = generateSvg(scan.score);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Badge generation failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
