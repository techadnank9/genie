import React from "react";

import type { Business } from "../lib/types";

type BusinessListProps = {
  businesses: Business[];
};

export function BusinessList({ businesses }: BusinessListProps) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-950">Businesses</h2>
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Live call queue
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {businesses.map((business) => (
          <article
            key={business.id}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-950">{business.name}</h3>
                <p className="text-sm text-zinc-600">{business.location}</p>
              </div>
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                {business.callStatus}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
              <p>Phone: {business.phone}</p>
              <p>Estimated range: {business.priceRange}</p>
              <p>Availability hint: {business.availabilityHint}</p>
              <p>{business.callId ? `Call ID: ${business.callId}` : "Call ID pending"}</p>
              <p>{business.error ? `Issue: ${business.error}` : `State: ${business.callStatus}`}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
