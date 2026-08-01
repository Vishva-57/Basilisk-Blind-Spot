import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Scorecard } from "@/components/Scorecard";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { ViolationList } from "@/components/ViolationList";
import { ScreenshotPreview } from "@/components/ScreenshotPreview";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import type { ScanReport } from "@/lib/types/report";

type PageProps = {
  params: { id: string };
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export default async function ScanReportPage({ params }: PageProps) {
  const scan = await prisma.scan.findUnique({
    where: { id: params.id },
  });

  if (!scan) {
    notFound();
  }

  const report = JSON.parse(scan.results) as ScanReport;

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          ← New scan
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          Accessibility Report
        </h1>
        <p className="mt-2 break-all text-slate-600">
          <span className="font-medium">URL:</span>{" "}
          <a
            href={report.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            {report.url}
          </a>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Scanned {formatDate(report.scannedAt)} · {report.passesCount} checks
          passed
        </p>
      </div>

      <div className="space-y-8">
        <Scorecard score={report.score} severityCounts={report.severityCounts} />

        <CategoryBreakdown categoryCounts={report.categoryCounts} />

        <ScoreBreakdown violations={report.violations} />

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            <strong>How scoring works:</strong> We start at 100 and deduct more
            for serious rule failures, while repeated instances of the same rule
            use a smaller capped penalty. A score of 90+ is good, 70–89 needs
            improvement, below 70 requires immediate attention.
          </p>
        </div>

        <ScreenshotPreview
          screenshot={report.screenshot}
          violations={report.violations}
        />

        <ViolationList violations={report.violations} />
      </div>
    </main>
  );
}
