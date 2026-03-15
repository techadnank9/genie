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
  summary?: string;
};

function looksLikeVoicemail(summary: string | undefined) {
  const text = (summary || "").trim().toLowerCase();

  if (!text) {
    return false;
  }

  return (
    text.includes("voicemail") ||
    text.includes("voice mail") ||
    text.includes("left a message") ||
    text.includes("recording a message") ||
    text.includes("person being called was unavailable") ||
    text.includes("call was directed to voicemail") ||
    text.includes("call was forwarded to voicemail")
  );
}

function isSuccessfulCompleted(status: string | undefined, durationSeconds: number | null | undefined) {
  const normalizedStatus = (status || "").trim().toLowerCase();
  return normalizedStatus === "completed" && typeof durationSeconds === "number" && durationSeconds > 0;
}

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
                isSuccessfulCompleted(call.status, call.durationSeconds) &&
                !looksLikeVoicemail(call.summary),
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
        isSuccessfulCompleted(result.status, result.durationSeconds) &&
        !looksLikeVoicemail(result.notes || result.availability),
    )
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .filter((result, index, collection) => {
      return index === collection.findIndex((item) => item.businessId === result.businessId);
    });

  const businessIds = new Set([
    ...latestCompletedResults.map((result) => result.businessId),
    ...historicalResults.map((result) => result.businessId),
  ]);

  const visibleResults = Array.from(businessIds)
    .map((businessId) => {
      const currentResult = latestCompletedResults.find((result) => result.businessId === businessId);

      if (currentResult) {
        return currentResult;
      }

      return historicalResults.find((result) => result.businessId === businessId) || null;
    })
    .filter(Boolean) as Array<CallResult | HistoricalResult>;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,22,48,0.78),rgba(25,13,46,0.74))] p-6 shadow-[0_24px_70px_rgba(4,4,24,0.36)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h2 className="font-['Cinzel_Decorative'] text-2xl text-amber-100">Collected results</h2>
        {cheapestOption ? (
          <span className="rounded-full border border-amber-300/20 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-amber-100/72">
            Best current option
          </span>
        ) : null}
      </div>
      <div className="mt-4 space-y-4">
        {visibleResults.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-indigo-100/58">
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
                  ? "border-amber-200/40 bg-[linear-gradient(180deg,rgba(251,191,36,0.16),rgba(76,29,149,0.24))] text-white shadow-[0_0_0_1px_rgba(251,191,36,0.18)]"
                  : "border-white/10 bg-white/6"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className={`text-xl font-semibold ${isCheapest ? "text-amber-50" : "text-amber-50"}`}>
                    {result.businessName}
                  </h3>
                </div>
              </div>
              <p className={`mt-4 text-sm leading-7 ${isCheapest ? "text-indigo-100/82" : "text-indigo-100/78"}`}>
                {result.notes || "No extra notes yet."}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
