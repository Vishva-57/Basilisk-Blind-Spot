"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SeverityCounts } from "@/lib/types/report";

type ScorecardProps = {
  score: number;
  severityCounts: SeverityCounts;
};

function getScoreColor(score: number): string {
  if (score >= 90) return "#059669";
  if (score >= 70) return "#d97706";
  return "#dc2626";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Good";
  if (score >= 70) return "Needs Improvement";
  return "Poor";
}

export function Scorecard({ score, severityCounts }: ScorecardProps) {
  const scoreColor = getScoreColor(score);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }

    let frame = 0;
    const totalFrames = 35;
    const interval = window.setInterval(() => {
      frame++;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setDisplayScore(Math.round(score * progress));

      if (frame >= totalFrames) {
        window.clearInterval(interval);
        setDisplayScore(score);
      }
    }, 24);

    return () => window.clearInterval(interval);
  }, [score]);

  const chartData = [
    { name: "Critical", count: severityCounts.critical, fill: "#dc2626" },
    { name: "Warnings", count: severityCounts.warning, fill: "#d97706" },
    { name: "Notices", count: severityCounts.notice, fill: "#2563eb" },
  ];

  const totalIssues =
    severityCounts.critical + severityCounts.warning + severityCounts.notice;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-600">
          Overall Score
        </p>
        <div
          className="mt-4 flex h-36 w-36 items-center justify-center rounded-full border-8"
          style={{ borderColor: scoreColor }}
          role="img"
          aria-label={`Accessibility score: ${score} out of 100, rated ${getScoreLabel(score)}`}
        >
          <div className="text-center">
            <span
              className="text-5xl font-bold"
              style={{ color: scoreColor }}
              aria-hidden="true"
            >
              {displayScore}
            </span>
            <span className="block text-sm text-slate-500" aria-hidden="true">
              / 100
            </span>
          </div>
        </div>
        <p
          className="mt-4 text-lg font-semibold"
          style={{ color: scoreColor }}
        >
          {getScoreLabel(score)}
        </p>
        <p className="mt-2 text-center text-sm text-slate-600">
          {totalIssues === 0
            ? "No accessibility issues detected."
            : `${totalIssues} issue${totalIssues === 1 ? "" : "s"} found across this page.`}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Issues by Severity
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Critical errors block access; warnings should be fixed soon.
        </p>
        <div className="mt-4 h-64" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} stroke="#64748b" />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                stroke="#64748b"
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul className="sr-only">
          {chartData.map((item) => (
            <li key={item.name}>
              {item.name}: {item.count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
