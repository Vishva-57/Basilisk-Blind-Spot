"use client";

import Link from "next/link";
import type { ScanSummary } from "@/lib/types/report";

type HistoryTableProps = {
  scans: ScanSummary[];
  selectedUrl: string | null;
  onSelectUrl: (url: string) => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getScoreBadgeClass(score: number): string {
  if (score >= 90) return "bg-emerald-100 text-emerald-800";
  if (score >= 70) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export function HistoryTable({
  scans,
  selectedUrl,
  onSelectUrl,
}: HistoryTableProps) {
  if (scans.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-700">No scans yet.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          Run your first scan →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <caption className="sr-only">Scan history</caption>
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                URL
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Score
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Issues
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {scans.map((scan) => {
              const issueCount =
                scan.severityCounts.critical +
                scan.severityCounts.warning +
                scan.severityCounts.notice;
              const isSelected = selectedUrl === scan.url;

              return (
                <tr
                  key={scan.id}
                  className={isSelected ? "bg-emerald-50" : "hover:bg-slate-50"}
                >
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-900">
                    <button
                      type="button"
                      onClick={() => onSelectUrl(scan.url)}
                      className="truncate text-left font-medium text-emerald-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                      title={scan.url}
                    >
                      {scan.url}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getScoreBadgeClass(scan.score)}`}
                    >
                      {scan.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {issueCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatDate(scan.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/scan/${scan.id}`}
                      className="text-sm font-medium text-emerald-700 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                    >
                      View report
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
