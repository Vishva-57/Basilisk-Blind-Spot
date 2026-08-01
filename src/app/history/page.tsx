"use client";

import { useEffect, useState } from "react";
import { HistoryTable } from "@/components/HistoryTable";
import { ScoreTrendChart } from "@/components/ScoreTrendChart";
import type { ScanSummary } from "@/lib/types/report";

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScans() {
      try {
        const response = await fetch("/api/scans");
        if (!response.ok) throw new Error("Failed to load scans");
        const data = await response.json();
        setScans(data.scans);
        if (data.scans.length > 0 && !selectedUrl) {
          setSelectedUrl(data.scans[0].url);
        }
      } catch {
        setError("Could not load scan history.");
      } finally {
        setLoading(false);
      }
    }

    fetchScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        Scan History
      </h1>
      <p className="mt-2 text-slate-600">
        Review past scans and track accessibility improvements over time.
      </p>

      {loading && (
        <p role="status" className="mt-8 text-slate-600">
          Loading history…
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-8 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-8 space-y-8">
          <ScoreTrendChart scans={scans} url={selectedUrl} />
          <HistoryTable
            scans={scans}
            selectedUrl={selectedUrl}
            onSelectUrl={setSelectedUrl}
          />
        </div>
      )}
    </main>
  );
}
