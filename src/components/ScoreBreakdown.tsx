import type { NormalizedViolation, Severity } from "@/lib/types/report";
import { getCategoryLabel, getSeverityLabel } from "@/lib/audit/categorize";

type ScoreBreakdownProps = {
  violations: NormalizedViolation[];
};

type RuleDeduction = {
  ruleId: string;
  title: string;
  severity: Severity;
  category: NormalizedViolation["category"];
  count: number;
  deduction: number;
};

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 10,
  warning: 5,
  notice: 1,
};

function calculateRuleDeductions(
  violations: NormalizedViolation[]
): RuleDeduction[] {
  const groups = new Map<string, RuleDeduction>();

  for (const violation of violations) {
    const existing = groups.get(violation.ruleId);
    if (existing) {
      existing.count++;
    } else {
      groups.set(violation.ruleId, {
        ruleId: violation.ruleId,
        title: violation.title,
        severity: violation.severity,
        category: violation.category,
        count: 1,
        deduction: 0,
      });
    }
  }

  return Array.from(groups.values())
    .map((group) => {
      const baseDeduction = SEVERITY_WEIGHTS[group.severity];
      return {
        ...group,
        deduction: Math.round(
          baseDeduction + Math.min(baseDeduction, Math.log2(group.count))
        ),
      };
    })
    .sort((first, second) => second.deduction - first.deduction);
}

export function ScoreBreakdown({ violations }: ScoreBreakdownProps) {
  const deductions = calculateRuleDeductions(violations);
  const totalDeduction = deductions.reduce(
    (total, deduction) => total + deduction.deduction,
    0
  );

  return (
    <section className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">
            Score Transparency
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Why this score?
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Basilisk groups repeated failures by rule, then applies a capped
            weighted deduction so large pages are judged fairly.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-white">
          <span className="block text-xs font-bold uppercase tracking-wide text-slate-300">
            Total Penalty
          </span>
          <span className="text-2xl font-black">−{totalDeduction}</span>
        </div>
      </div>

      {deductions.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          No score deductions. No accessibility issues were detected.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[1fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 sm:grid-cols-[1fr_120px_120px_auto]">
            <span>Error heading</span>
            <span className="hidden sm:block">Severity</span>
            <span className="hidden sm:block">Category</span>
            <span>Penalty</span>
          </div>
          <div className="divide-y divide-slate-200 bg-white">
            {deductions.map((deduction) => (
              <div
                key={deduction.ruleId}
                className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 text-sm sm:grid-cols-[1fr_120px_120px_auto]"
              >
                <div>
                  <p className="font-bold text-slate-950">
                    {deduction.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {deduction.count} affected element
                    {deduction.count === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="hidden text-slate-600 sm:block">
                  {getSeverityLabel(deduction.severity)}
                </span>
                <span className="hidden text-slate-600 sm:block">
                  {getCategoryLabel(deduction.category)}
                </span>
                <span className="font-black text-red-600">
                  −{deduction.deduction}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
