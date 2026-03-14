import React from "react";

import type { CallResult } from "../lib/types";

type ResultsListProps = {
  results: CallResult[];
  cheapestOption: CallResult | null;
};

export function ResultsList({ results, cheapestOption }: ResultsListProps) {
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
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
            Results will appear here as Genie finishes each business call.
          </div>
        ) : null}
        {results.map((result) => {
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
                </div>
                <div className="text-right">
                  <p className={`text-xs uppercase tracking-[0.2em] ${isCheapest ? "text-zinc-400" : "text-zinc-500"}`}>
                    Quoted price
                  </p>
                  <p className={`mt-1 text-3xl font-semibold ${isCheapest ? "text-white" : "text-zinc-950"}`}>
                    {typeof result.price === "number" ? `$${result.price}` : "Pending"}
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
