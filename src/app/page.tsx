import { UrlScanForm } from "@/components/UrlScanForm";

const FEATURES = [
  {
    icon: "⚡",
    title: "Fast WCAG Scan",
    description:
      "Powered by axe-core and Playwright to catch real accessibility barriers.",
  },
  {
    icon: "✨",
    title: "Plain-English Fixes",
    description:
      "Every issue is explained clearly, with examples your team can act on.",
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    description:
      "Scan history helps you prove accessibility improvements over time.",
  },
];

export default function HomePage() {
  return (
    <main id="main-content" className="relative isolate overflow-hidden">
      <div
        className="absolute left-6 top-16 -z-10 h-48 w-48 rounded-full bg-emerald-300/30 blur-3xl animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute right-4 top-44 -z-10 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl animate-float animation-delay-300"
        aria-hidden="true"
      />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm backdrop-blur">
            <span aria-hidden="true">🛡️</span>
            WCAG 2.1 AA accessibility auditor
          </div>

          <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Find hidden web barriers before your users do.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
            Basilisk scans any public URL, spots accessibility issues, and turns
            technical WCAG findings into clear, actionable fixes.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
            <span className="rounded-full bg-white/75 px-4 py-2 shadow-sm">
              Screen reader checks
            </span>
            <span className="rounded-full bg-white/75 px-4 py-2 shadow-sm">
              Contrast insights
            </span>
            <span className="rounded-full bg-white/75 px-4 py-2 shadow-sm">
              Keyboard access
            </span>
          </div>
        </div>

        <div className="animate-fade-up animation-delay-150 rounded-[2rem] border border-white/80 bg-white/70 p-3 shadow-2xl shadow-emerald-200/60 backdrop-blur-xl">
          <div className="rounded-[1.5rem] border border-emerald-100 bg-white p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">
                  Start Scan
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Audit a website
                </h2>
              </div>
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-2xl shadow-lg shadow-emerald-200"
                aria-hidden="true"
              >
                🔎
              </div>
            </div>
            <UrlScanForm />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="features-heading"
        className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 sm:grid-cols-3"
      >
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        {FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className={`group animate-fade-up rounded-3xl border border-white/80 bg-white/75 p-6 shadow-xl shadow-slate-200/60 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-200/70 ${
              index === 1 ? "animation-delay-150" : index === 2 ? "animation-delay-300" : ""
            }`}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 text-2xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
              {feature.icon}
            </div>
            <h3 className="text-lg font-black text-slate-950">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="animate-gradient rounded-[2rem] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white shadow-2xl shadow-emerald-300/50 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-100">
            Review-ready output
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Scores, grouped errors, and fix suggestions in one report.
          </h2>
          <p className="mt-4 max-w-3xl text-emerald-50">
            Perfect for explaining accessibility problems in project reviews:
            show the score, severity chart, category breakdown, and detailed
            findings grouped by error heading.
          </p>
        </div>
      </section>
    </main>
  );
}
