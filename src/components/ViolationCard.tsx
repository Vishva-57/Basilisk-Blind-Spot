"use client";

import { useState } from "react";
import type { NormalizedViolation } from "@/lib/types/report";
import { getCategoryLabel, getSeverityLabel } from "@/lib/audit/categorize";

import { generateFixSuggestion } from "@/lib/audit/fixSuggestions";

type ViolationCardProps = {
  violation: NormalizedViolation;
};

const SEVERITY_STYLES = {
  critical: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  notice: "bg-blue-100 text-blue-800 border-blue-200",
};

export function ViolationCard({ violation }: ViolationCardProps) {
  const [copied, setCopied] = useState(false);
  const fixSuggestion = generateFixSuggestion(violation.ruleId, violation.html);

  async function copyHtml(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable
    }
  }

  return (
    <article className="p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_STYLES[violation.severity]}`}
        >
          {getSeverityLabel(violation.severity)}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {getCategoryLabel(violation.category)}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-900">
        {violation.title}
      </h3>

      <p className="mt-2 text-sm text-slate-700">{violation.description}</p>

      <div className="mt-3 rounded-lg bg-emerald-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
          Why it matters
        </p>
        <p className="mt-1 text-sm text-emerald-900">{violation.whyItMatters}</p>
      </div>

      {violation.wcagTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {violation.wcagTags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Offending HTML
            </p>
            <button
              type="button"
              onClick={() => copyHtml(violation.html)}
              className="rounded px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900">
            <code>{violation.html}</code>
          </pre>
          <p className="mt-1 text-xs text-slate-500">
            Selector: <code className="font-mono">{violation.selector}</code>
          </p>
        </div>

        {fixSuggestion && (
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Suggested Fix
              </p>
              <button
                type="button"
                onClick={() => copyHtml(fixSuggestion)}
                className="rounded px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Copy
              </button>
            </div>
            <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              <code>{fixSuggestion}</code>
            </pre>
            <p className="mt-1 text-xs text-slate-500">
              Apply this fix to resolve the issue.
            </p>
          </div>
        )}
      </div>

      <a
        href={violation.helpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        Learn more about this rule →
      </a>
    </article>
  );
}
