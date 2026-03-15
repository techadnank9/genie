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

    const roundedSeconds = Math.round(seconds);

    if (roundedSeconds < 60) {
      return `${roundedSeconds} s`;
    }

    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    return `${minutes} m ${remainingSeconds} s`;
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,22,48,0.78),rgba(25,13,46,0.74))] p-6 shadow-[0_24px_70px_rgba(4,4,24,0.36)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h2 className="font-['Cinzel_Decorative'] text-2xl text-amber-100">Businesses</h2>
        <span className="rounded-full border border-amber-300/20 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-amber-100/72">
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
                  ? "border-amber-200/60 bg-white/10 shadow-[0_0_0_1px_rgba(251,191,36,0.18)]"
                  : isActive
                    ? "border-fuchsia-300/45 bg-fuchsia-400/10"
                    : "border-white/10 bg-white/5 hover:border-amber-200/35 hover:bg-white/8"
              }`}
              onClick={() => onSelectBusiness?.(business.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-amber-50">{business.name}</h3>
                  <p className="text-sm text-indigo-100/68">{business.location}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${
                    isActive
                      ? "border-fuchsia-300/40 bg-white/10 text-fuchsia-100"
                      : "border-amber-300/20 bg-white/8 text-amber-100/74"
                  }`}
                >
                  {business.callStatus}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-indigo-100/74 sm:grid-cols-2">
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
