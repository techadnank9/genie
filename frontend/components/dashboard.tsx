"use client";

import React, { useEffect, useState } from "react";

import { createResultsStream, fetchResults, startSearch, stopSearch } from "../lib/api";
import type { SearchSession } from "../lib/types";
import { BusinessList } from "./business-list";
import { BusinessDrawer } from "./business-drawer";
import { ResultsList } from "./results-list";

type DashboardProps = {
  services: string[];
  selectedService: string;
  session: SearchSession | null;
  onServiceChange?: (service: string) => void;
  onStartSearch?: () => void;
  onStopSearch?: (sessionId: string) => void | Promise<void>;
  onBackToPrompt?: () => void;
  isStarting?: boolean;
};

export function Dashboard({
  services,
  selectedService,
  session,
  onServiceChange,
  onStartSearch,
  onStopSearch,
  onBackToPrompt,
  isStarting = false,
}: DashboardProps) {
  const [activeService, setActiveService] = useState(selectedService);
  const [activeSession, setActiveSession] = useState<SearchSession | null>(session);
  const [starting, setStarting] = useState(isStarting);
  const [stopping, setStopping] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  useEffect(() => {
    setActiveSession(session);
  }, [session]);

  useEffect(() => {
    setActiveService(selectedService);
  }, [selectedService]);

  useEffect(() => {
    const nextBusinesses = activeSession?.businesses || [];

    if (nextBusinesses.length === 0) {
      setSelectedBusinessId(null);
      return;
    }

    const currentSelectionStillExists = nextBusinesses.some(
      (business) => business.id === selectedBusinessId,
    );

    if (currentSelectionStillExists) {
      return;
    }

    setSelectedBusinessId(null);
  }, [activeSession, selectedBusinessId]);

  useEffect(() => {
    if (onServiceChange || onStartSearch) {
      return;
    }

    let mounted = true;

    fetchResults()
      .then((data) => {
        if (!mounted) {
          return;
        }

        setActiveSession(data.sessions.at(-1) || null);
      })
      .catch(() => {});

    const stream = createResultsStream();
    const refresh = () => {
      fetchResults()
        .then((data) => {
          if (!mounted) {
            return;
          }

          setActiveSession(data.sessions.at(-1) || null);
        })
        .catch(() => {});
    };

    stream?.addEventListener("results.updated", refresh);
    stream?.addEventListener("search.status", refresh);

    return () => {
      mounted = false;
      stream?.close();
    };
  }, [onServiceChange, onStartSearch]);

  const handleStartSearch = async () => {
    if (onStartSearch) {
      onStartSearch();
      return;
    }

    setStarting(true);

    try {
      await startSearch(activeService);
      const data = await fetchResults();
      setActiveSession(data.sessions.at(-1) || null);
    } finally {
      setStarting(false);
    }
  };

  const handleStopSearch = async () => {
    if (!activeSession?.sessionId) {
      return;
    }

    setStopping(true);

    try {
      if (onStopSearch) {
        await onStopSearch(activeSession.sessionId);
      } else {
        await stopSearch(activeSession.sessionId);
        const data = await fetchResults();
        setActiveSession(data.sessions.at(-1) || null);
      }
    } finally {
      setStopping(false);
    }
  };

  const currentSession = activeSession;
  const status = currentSession?.status || "idle";
  const activeBusiness =
    currentSession?.businesses.find((business) =>
      ["calling", "requested"].includes(business.callStatus),
    ) || null;
  const selectedBusiness =
    currentSession?.businesses.find((business) => business.id === selectedBusinessId) || null;
  const selectedResult =
    currentSession?.results.find((result) => result.businessId === selectedBusinessId) || null;

  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-zinc-200 bg-white p-5 md:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">Genie</p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
                Search in progress
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-base">
                Genie is searching businesses, placing calls, and collecting live quotes for you.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500">
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-medium capitalize text-zinc-600">
                  {status}
                </span>
                <span>{activeService}</span>
                <span>{currentSession?.businesses.length || 0} businesses</span>
                <span>{currentSession?.results.length || 0} results</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {onBackToPrompt ? (
                <button
                  className="text-sm font-medium text-zinc-500 transition hover:text-zinc-800"
                  onClick={onBackToPrompt}
                  type="button"
                >
                  Back to Genie
                </button>
              ) : null}
              {currentSession?.status !== "stopped" ? (
                <button
                  className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
                  onClick={handleStopSearch}
                  type="button"
                >
                  {stopping ? "Stopping..." : "Stop all calls"}
                </button>
              ) : null}
              <button
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
                onClick={handleStartSearch}
                type="button"
              >
                {starting ? "Restarting..." : "Run again"}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <BusinessList
              activeBusinessId={activeBusiness?.id || null}
              businesses={currentSession?.businesses || []}
              onSelectBusiness={setSelectedBusinessId}
              selectedBusinessId={selectedBusinessId}
            />
          </div>
          <ResultsList
            results={currentSession?.results || []}
            cheapestOption={currentSession?.cheapestOption || null}
          />
        </div>
      </div>
      <BusinessDrawer
        business={selectedBusiness}
        isOpen={Boolean(selectedBusiness)}
        onClose={() => setSelectedBusinessId(null)}
        result={selectedResult}
      />
    </main>
  );
}
