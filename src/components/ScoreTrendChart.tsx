"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ScanSummary } from "@/lib/types/report";

type ScoreTrendChartProps = {
  scans: ScanSummary[];
  url: string | null;
};

export function ScoreTrendChart({ scans, url }: ScoreTrendChartProps) {
  const filtered = url
    ? scans.filter((s) => s.url === url).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : [];

  if (!url) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Score Over Time</h2>
        <p className="mt-4 text-sm text-slate-600">
          Click a URL in the table to see how its accessibility score changes
          over time.
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Score Over Time</h2>
        <p className="mt-4 text-sm text-slate-600">
          No scans found for this URL.
        </p>
      </div>
    );
  }

  const chartData = filtered.map((scan) => ({
    date: new Date(scan.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    score: scan.score,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Score Over Time</h2>
      <p className="mt-1 truncate text-sm text-slate-600" title={url}>
        {url}
      </p>
      <div className="mt-4 h-64" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} stroke="#64748b" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#059669"
              strokeWidth={2}
              dot={{ fill: "#059669", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="sr-only">
        {chartData.map((point) => (
          <li key={point.date}>
            {point.date}: score {point.score}
          </li>
        ))}
      </ul>
    </div>
  );
}
