"use client";

import { useMemo, useState } from "react";
import type { NormalizedViolation, Severity, ViolationCategory } from "@/lib/types/report";
import { ViolationCard } from "./ViolationCard";
import {
  getCategoryLabel,
  getSeverityLabel,
  ALL_CATEGORIES,
} from "@/lib/audit/categorize";

type ViolationListProps = {
  violations: NormalizedViolation[];
};

type FilterType = "all" | Severity | ViolationCategory;

type ViolationGroup = {
  ruleId: string;
  title: string;
  severity: Severity;
  category: ViolationCategory;
  violations: NormalizedViolation[];
};

const SEVERITY_FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warnings" },
  { value: "notice", label: "Notices" },
];

export function ViolationList({ violations }: ViolationListProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = violations.filter((v) => {
    if (filter === "all") return true;
    if (filter === "critical" || filter === "warning" || filter === "notice") {
      return v.severity === filter;
    }
    return v.category === filter;
  });

  const groupedFindings = useMemo(() => {
    const groups = new Map<string, ViolationGroup>();

    for (const violation of filtered) {
      const existing = groups.get(violation.ruleId);
      if (existing) {
        existing.violations.push(violation);
      } else {
        groups.set(violation.ruleId, {
          ruleId: violation.ruleId,
          title: violation.title,
          severity: violation.severity,
          category: violation.category,
          violations: [violation],
        });
      }
    }

    return Array.from(groups.values()).sort(
      (first, second) => second.violations.length - first.violations.length
    );
  }, [filtered]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Detailed Findings
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {violations.length} issue{violations.length === 1 ? "" : "s"} with
          plain-English explanations and fix guidance.
        </p>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter violations"
        >
          {SEVERITY_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                filter === value
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="mx-1 self-center text-slate-300" aria-hidden="true">
            |
          </span>
          {ALL_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              aria-pressed={filter === category}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                filter === category
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">
            No issues match this filter.
          </p>
        ) : (
          groupedFindings.map((group) => (
            <section key={group.ruleId} className="p-6">
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {group.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {group.violations.length} error
                      {group.violations.length === 1 ? "" : "s"} found under
                      this heading.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                      {getSeverityLabel(group.severity)}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                      {getCategoryLabel(group.category)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
                {group.violations.map((violation) => (
                  <ViolationCard key={violation.id} violation={violation} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
