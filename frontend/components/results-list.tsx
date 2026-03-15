import React, { useEffect, useState } from "react";

import { fetchCallHistory } from "../lib/api";
import type { Business, CallResult } from "../lib/types";

type ResultsListProps = {
  businesses: Business[];
  results: CallResult[];
  cheapestOption: CallResult | null;
};

type HistoricalResult = CallResult & {
  businessId: string;
  businessName: string;
};

export function ResultsList({ businesses, results, cheapestOption }: ResultsListProps) {
  const [historicalResults, setHistoricalResults] = useState<HistoricalResult[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistoricalResults() {
      const settled = await Promise.all(
        businesses.map(async (business) => {
          try {
            const payload = await fetchCallHistory(business.toPhone || business.phone, business.callId || undefined);
            const latestCompletedCall = (payload.calls || []).find(
              (call: HistoricalResult) =>
                call.status === "completed" &&
                typeof call.durationSeconds === "number" &&
                call.durationSeconds > 0,
            );

            if (!latestCompletedCall) {
              return null;
            }

            return {
              businessId: business.id,
              businessName: business.name,
              phone: latestCompletedCall.calledNumber || business.phone,
              status: latestCompletedCall.status,
              price: null,
              availability: latestCompletedCall.summary || business.availabilityHint,
              notes: latestCompletedCall.summary || "No extra notes yet.",
              updatedAt: latestCompletedCall.updatedAt,
              transcript: latestCompletedCall.transcript,
              callId: latestCompletedCall.callId,
              durationSeconds: latestCompletedCall.durationSeconds,
              fromPhone: business.fromPhone || null,
              toPhone: latestCompletedCall.calledNumber || business.phone,
              disconnectReason: null,
            } satisfies HistoricalResult;
          } catch {
            return null;
          }
        }),
      );

      if (!cancelled) {
        setHistoricalResults(settled.filter(Boolean) as HistoricalResult[]);
      }
    }

    void loadHistoricalResults();

    return () => {
      cancelled = true;
    };
  }, [businesses]);

  const latestCompletedResults = results
    .filter(
      (result) =>
        result.status === "completed" &&
        typeof result.durationSeconds === "number" &&
        result.durationSeconds > 0,
    )
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .filter((result, index, collection) => {
      return index === collection.findIndex((item) => item.businessId === result.businessId);
    });

  const visibleResults = latestCompletedResults.length > 0 ? latestCompletedResults : historicalResults;

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-950">Collected results</h2>
        {cheapestOption ? (
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Best current option
          </span>
        ) : null}
      </div>
      <div className="mt-4 space-y-4">
        {visibleResults.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
            Results will appear here as Genie finishes each business call.
          </div>
        ) : null}
        {visibleResults.map((result) => {
          const isCheapest = cheapestOption?.businessId === result.businessId;

          return (
            <article
              key={result.businessId}
              className={`rounded-2xl border p-4 ${
                isCheapest
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-zinc-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className={`text-lg font-semibold ${isCheapest ? "text-white" : "text-zinc-950"}`}>
                    {result.businessName}
                  </h3>
                  <p className={`text-sm ${isCheapest ? "text-zinc-300" : "text-zinc-600"}`}>
                    {result.availability}
                  </p>
                  <p className={`mt-1 text-xs uppercase tracking-[0.18em] ${isCheapest ? "text-zinc-400" : "text-zinc-500"}`}>
                    Last completed conversation
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs uppercase tracking-[0.2em] ${isCheapest ? "text-zinc-400" : "text-zinc-500"}`}>
                    Quoted price
                  </p>
                  <p className={`mt-1 text-3xl font-semibold ${isCheapest ? "text-white" : "text-zinc-950"}`}>
                    {typeof result.price === "number" ? `$${result.price}` : "Pending"}
                  </p>
                  <p className={`mt-2 text-xs ${isCheapest ? "text-zinc-300" : "text-zinc-500"}`}>
                    {new Date(result.updatedAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <p className={`mt-3 text-sm ${isCheapest ? "text-zinc-300" : "text-zinc-600"}`}>
                {result.notes || "No extra notes yet."}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
