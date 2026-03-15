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

  const roundedSeconds = Math.round(seconds);

  if (roundedSeconds < 60) {
    return `${roundedSeconds} s`;
  }

  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;
  return `${minutes} m ${remainingSeconds} s`;
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
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[linear-gradient(180deg,rgba(11,16,37,0.96),rgba(22,12,42,0.98))] text-white shadow-[0_25px_120px_rgba(3,3,22,0.65)] transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-200/72">
              Conversation details
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-amber-50">
              {business?.name || "No business selected"}
            </h2>
          </div>
          <button
            aria-label="Close conversation details"
            className="rounded-full border border-amber-300/25 px-4 py-2 text-sm text-amber-100 transition hover:bg-white/8"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {business ? (
            <>
              <section className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-amber-100/76">Status</span>
                  <span className="rounded-full border border-amber-300/20 bg-white/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-amber-100">
                    {formatStatus(business.callStatus)}
                  </span>
                </div>
                <dl className="mt-4 space-y-3 text-sm text-indigo-100/72">
                  <div className="flex items-start justify-between gap-4">
                    <dt>Called number</dt>
                    <dd className="text-right text-amber-50">{business.toPhone || business.phone}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Outbound line</dt>
                    <dd className="text-right text-amber-50">{business.fromPhone || "Pending"}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Call ID</dt>
                    <dd className="text-right text-amber-50">
                      {business.callId || "Pending assignment"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Duration</dt>
                    <dd className="text-right text-amber-50">
                      {formatDuration(result?.durationSeconds ?? business.callDurationSeconds)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Last update</dt>
                    <dd className="text-right text-amber-50">
                      {formatUpdatedAt(result?.updatedAt || business.lastUpdatedAt || undefined)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Typical availability</dt>
                    <dd className="text-right text-amber-50">{business.availabilityHint}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>Last event</dt>
                    <dd className="text-right text-amber-50">
                      {formatStatus(business.lastEventType || undefined)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt>End reason</dt>
                    <dd className="text-right text-amber-50">
                      {result?.disconnectReason || business.disconnectReason || "Pending"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/72">
                  Previous calls
                </h3>
                <div className="mt-3 space-y-3">
                  {previousCalls.length === 0 ? (
                    <p className="text-sm leading-6 text-indigo-100/68">
                      No previous calls recorded for this number yet.
                    </p>
                  ) : (
                    previousCalls.map((call) => (
                      <article
                        key={call.callId}
                        className="rounded-2xl border border-white/10 bg-white/6 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-amber-50">{call.callId}</p>
                            <p className="text-xs text-indigo-100/58">
                              {formatUpdatedAt(call.updatedAt)} · {formatStatus(call.status)}
                            </p>
                          </div>
                          <p className="text-xs text-indigo-100/58">
                            {formatDuration(call.durationSeconds)}
                          </p>
                        </div>
                        <div className="mt-3 space-y-2 text-sm leading-7 text-indigo-100/76">
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
