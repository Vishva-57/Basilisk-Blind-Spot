"use client";

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
import type { CategoryCounts } from "@/lib/types/report";
import { getCategoryLabel, ALL_CATEGORIES } from "@/lib/audit/categorize";

const CATEGORY_COLORS: Record<string, string> = {
  images: "#8b5cf6",
  forms: "#0891b2",
  contrast: "#dc2626",
  aria: "#d97706",
  keyboard: "#059669",
  other: "#64748b",
};

type CategoryBreakdownProps = {
  categoryCounts: CategoryCounts;
};

export function CategoryBreakdown({ categoryCounts }: CategoryBreakdownProps) {
  const chartData = ALL_CATEGORIES.map((category) => ({
    name: getCategoryLabel(category),
    category,
    count: categoryCounts[category],
    fill: CATEGORY_COLORS[category],
  })).filter((item) => item.count > 0);

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Issues by Category
        </h2>
        <p className="mt-4 text-sm text-slate-600">
          No categorized issues found. Great job!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Issues by Category
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Breakdown by accessibility area: images, forms, contrast, ARIA, and
        keyboard navigation.
      </p>
      <div className="mt-4 h-72" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" allowDecimals={false} stroke="#64748b" />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              stroke="#64748b"
              tick={{ fontSize: 12 }}
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
          <li key={item.category}>
            {item.name}: {item.count} issues
          </li>
        ))}
      </ul>
    </div>
  );
}
