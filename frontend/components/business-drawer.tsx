"use client";

import React, { useEffect, useState } from "react";

import type { Business, CallResult } from "../lib/types";
import { fetchCallHistory } from "../lib/api";

type PreviousCall = {
  callId: string;
  calledNumber: string;
  status: string;
  transcript: string;
  updatedAt: string;
  durationSeconds?: number | null;
  summary?: string;
};

type BusinessDrawerProps = {
  business: Business | null;
  result: CallResult | null;
  isOpen: boolean;
  onClose: () => void;
};

function formatUpdatedAt(updatedAt: string | undefined) {
  if (!updatedAt) {
    return "Awaiting updates";
  }

  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "Awaiting updates";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatStatus(status: string | undefined) {
  if (!status) {
    return "Pending";
  }

  return status.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDuration(seconds: number | null | undefined) {
  if (typeof seconds !== "number") {
    return "Pending";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function BusinessDrawer({
  business,
  result,
  isOpen,
  onClose,
}: BusinessDrawerProps) {
  const [previousCalls, setPreviousCalls] = useState<PreviousCall[]>([]);

  useEffect(() => {
    if (!isOpen || !business) {
      setPreviousCalls([]);
      return;
    }

    fetchCallHistory(business.toPhone || business.phone, business.callId || undefined)
      .then((payload) => {
        setPreviousCalls(payload.calls || []);
      })
      .catch(() => {
        setPreviousCalls([]);
      });
  }, [business, isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
              Conversation details
            </p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-950">
              {business?.name || "No business selected"}
            </h2>
          </div>
          <button
            aria-label="Close conversation details"
            className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {business ? (
            <>
              <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-zinc-500">Status</span>
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                    {formatStatus(business.callStatus)}
                  </span>
                </div>
                <dl className="mt-4 space-y-3 text-sm text-zinc-600">
                  <div className="flex items-start justify-between gap-4">
                    <dt>Called number</dt>
                    <dd className="text-right text-zinc-950">{business.toPhone || business.phone}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Outbound line</dt>
                    <dd className="text-right text-zinc-950">{business.fromPhone || "Pending"}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Call ID</dt>
                    <dd className="text-right text-zinc-950">
                      {business.callId || "Pending assignment"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Duration</dt>
                    <dd className="text-right text-zinc-950">
                      {formatDuration(result?.durationSeconds ?? business.callDurationSeconds)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Last update</dt>
                    <dd className="text-right text-zinc-950">
                      {formatUpdatedAt(result?.updatedAt || business.lastUpdatedAt || undefined)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Typical availability</dt>
                    <dd className="text-right text-zinc-950">{business.availabilityHint}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Last event</dt>
                    <dd className="text-right text-zinc-950">
                      {formatStatus(business.lastEventType || undefined)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>End reason</dt>
                    <dd className="text-right text-zinc-950">
                      {result?.disconnectReason || business.disconnectReason || "Pending"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Notes
                </h3>
                <div className="mt-3 space-y-3 text-sm text-zinc-600">
                  <p>
                    {business.error
                      ? `Issue: ${business.error}`
                      : result?.notes || business.summary || "No notes captured yet."}
                  </p>
                  <p>
                    {typeof result?.price === "number"
                      ? `Quoted price: $${result.price}`
                      : "Quoted price pending"}
                  </p>
                  <p>{result?.availability || "Availability pending"}</p>
                </div>
              </section>

              <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Transcript
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {result?.transcript || business.transcript || "No transcript yet. Live conversation details will appear here as webhook updates come in."}
                </p>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Previous calls
                </h3>
                <div className="mt-3 space-y-3">
                  {previousCalls.length === 0 ? (
                    <p className="text-sm leading-6 text-zinc-600">
                      No previous calls recorded for this number yet.
                    </p>
                  ) : (
                    previousCalls.map((call) => (
                      <article
                        key={call.callId}
                        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-950">{call.callId}</p>
                            <p className="text-xs text-zinc-500">
                              {formatUpdatedAt(call.updatedAt)} · {formatStatus(call.status)}
                            </p>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {formatDuration(call.durationSeconds)}
                          </p>
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-zinc-600">
                          <p>Called number: {call.calledNumber}</p>
                          <p>{call.summary || "No summary captured."}</p>
                          {call.transcript ? (
                            <p className="whitespace-pre-line">{call.transcript}</p>
                          ) : null}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
              Select a business to inspect its call details.
            </section>
          )}
        </div>
      </aside>
    </>
  );
}
