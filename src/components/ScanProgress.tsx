"use client";

const STEPS = [
  "Connecting to site…",
  "Loading page…",
  "Running accessibility checks…",
  "Building report…",
];

type ScanProgressProps = {
  currentStep: number;
};

export function ScanProgress({ currentStep }: ScanProgressProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mt-8 rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-xl shadow-emerald-100/70"
    >
      <div className="flex items-center gap-3">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent motion-reduce:animate-none motion-reduce:border-emerald-600"
          aria-hidden="true"
        />
        <p className="text-base font-bold text-slate-900">
          {STEPS[Math.min(currentStep, STEPS.length - 1)]}
        </p>
      </div>
      <ol className="mt-4 space-y-2" aria-label="Scan progress">
        {STEPS.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          return (
            <li
              key={step}
              className={`flex items-center gap-2 text-sm ${
                done
                  ? "text-emerald-700"
                  : active
                    ? "font-medium text-slate-900"
                    : "text-slate-400"
              }`}
            >
              <span aria-hidden="true">{done ? "✓" : active ? "→" : "○"}</span>
              {step}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-sm text-slate-600">
        This usually takes 10–30 seconds depending on the site.
      </p>
    </div>
  );
}

export { STEPS };
