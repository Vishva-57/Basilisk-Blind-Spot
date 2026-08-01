"use client";

import Image from "next/image";
import type { NormalizedViolation, ScanReport, Severity } from "@/lib/types/report";

type ScreenshotPreviewProps = {
  screenshot?: ScanReport["screenshot"];
  violations: NormalizedViolation[];
};

const HIGHLIGHT_STYLES: Record<Severity, string> = {
  critical: "border-red-500 bg-red-500/15 shadow-red-500/40",
  warning: "border-amber-500 bg-amber-500/15 shadow-amber-500/40",
  notice: "border-blue-500 bg-blue-500/15 shadow-blue-500/40",
};

export function ScreenshotPreview({
  screenshot,
  violations,
}: ScreenshotPreviewProps) {
  const visibleViolations = violations.filter((violation) => violation.targetBounds);
  const visibleCount = visibleViolations.length;
  const totalCount = violations.length;
  const previewViolations = visibleViolations.slice(0, 80);

  if (!screenshot) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/75 p-6 text-sm text-slate-600 shadow-sm">
        Screenshot preview will appear for new scans. Re-run this URL to capture
        highlighted page issues.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-2xl shadow-emerald-100/70 backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">
            Visual Evidence
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Screenshot highlight overlay
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {visibleCount} of {totalCount} issues are visible in this first-screen
            capture. Highlight boxes show where judges should look.
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          {previewViolations.length} highlighted
        </div>
      </div>

      <div className="bg-slate-950 p-4 sm:p-6">
        <div
          className="relative mx-auto overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl"
          style={{ maxWidth: screenshot.width }}
        >
          <Image
            src={screenshot.dataUrl}
            width={screenshot.width}
            height={screenshot.height}
            alt="Screenshot of the scanned page with accessibility issue highlights"
            unoptimized
            className="block h-auto w-full"
          />
          {previewViolations.map((violation) => {
            const bounds = violation.targetBounds;
            if (!bounds) return null;

            return (
              <div
                key={violation.id}
                className={`absolute rounded-md border-2 shadow-lg ${HIGHLIGHT_STYLES[violation.severity]}`}
                style={{
                  left: `${(bounds.x / screenshot.width) * 100}%`,
                  top: `${(bounds.y / screenshot.height) * 100}%`,
                  width: `${(bounds.width / screenshot.width) * 100}%`,
                  height: `${(bounds.height / screenshot.height) * 100}%`,
                }}
                title={`${violation.title}: ${violation.selector}`}
                aria-hidden="true"
              />
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 p-6 text-sm sm:grid-cols-3">
        <div className="rounded-2xl bg-red-50 p-4 text-red-800">
          <span className="font-black">Red</span> = critical barriers
        </div>
        <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">
          <span className="font-black">Amber</span> = warnings
        </div>
        <div className="rounded-2xl bg-blue-50 p-4 text-blue-800">
          <span className="font-black">Blue</span> = notices
        </div>
      </div>
    </section>
  );
}
