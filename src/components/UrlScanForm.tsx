"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ScanProgress, STEPS } from "./ScanProgress";

export function UrlScanForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    setStep(0);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        if (!response.ok) {
          setError(`Server error (${response.status}). The scan may have timed out or failed.`);
          setLoading(false);
          return;
        }
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        setError(data.error || "Scan failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push(`/scan/${data.id}`);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? `Error: ${err.message}`
          : "Network error. Please check your connection and try again."
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="url-input" className="block text-sm font-bold text-slate-900">
          Website URL
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="url-input"
            type="url"
            inputMode="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            required
            aria-describedby={error ? "url-error" : "url-hint"}
            className="flex-1 rounded-2xl border border-emerald-100 bg-white/90 px-5 py-4 text-lg text-slate-900 shadow-inner shadow-slate-100 placeholder:text-slate-400 transition-all duration-300 focus:-translate-y-0.5 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-emerald-600 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="group rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-2">
              {loading ? "Scanning…" : "Scan now"}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </button>
        </div>
        <p id="url-hint" className="mt-2 text-sm text-slate-600">
          Try a public URL and get a polished WCAG 2.1 AA report in seconds.
        </p>
      </form>

      {error && (
        <div
          id="url-error"
          role="alert"
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 shadow-sm"
        >
          {error}
        </div>
      )}

      {loading && <ScanProgress currentStep={step} />}
    </div>
  );
}
