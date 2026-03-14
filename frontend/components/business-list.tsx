import React from "react";

import type { Business } from "../lib/types";

type BusinessListProps = {
  businesses: Business[];
  activeBusinessId?: string | null;
  selectedBusinessId?: string | null;
  onSelectBusiness?: (businessId: string) => void;
};

export function BusinessList({
  businesses,
  activeBusinessId = null,
  selectedBusinessId = null,
  onSelectBusiness,
}: BusinessListProps) {
  const formatStatus = (status: string) =>
    status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  const formatDuration = (seconds?: number | null) => {
    if (typeof seconds !== "number") {
      return "Pending";
    }

    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-950">Businesses</h2>
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Live call queue
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {businesses.map((business) => {
          const isSelected = selectedBusinessId === business.id;
          const isActive = activeBusinessId === business.id;

          return (
            <button
              key={business.id}
              className={`block w-full rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-zinc-950 bg-white shadow-sm"
                  : isActive
                    ? "border-emerald-300 bg-emerald-50/60"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-white"
              }`}
              onClick={() => onSelectBusiness?.(business.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-950">{business.name}</h3>
                  <p className="text-sm text-zinc-600">{business.location}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${
                    isActive
                      ? "border-emerald-200 bg-white text-emerald-700"
                      : "border-zinc-200 bg-white text-zinc-500"
                  }`}
                >
                  {business.callStatus}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                <p>Called number: {business.toPhone || business.phone}</p>
                <p>Outbound line: {business.fromPhone || "Pending"}</p>
                <p>Estimated price range: {business.priceRange}</p>
                <p>Typical availability: {business.availabilityHint}</p>
                <p>{business.callId ? `Call ID: ${business.callId}` : "Call ID pending"}</p>
                <p>Duration: {formatDuration(business.callDurationSeconds)}</p>
                <p>
                  {business.error
                    ? `Issue: ${business.error}`
                    : `Live status: ${formatStatus(business.callStatus)}`}
                </p>
                <p>{business.disconnectReason ? `End reason: ${business.disconnectReason}` : "End reason pending"}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
