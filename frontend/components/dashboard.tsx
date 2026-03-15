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
  const displayedResults =
    currentSession?.results.map((result) => {
      const matchingBusiness =
        currentSession.businesses.find((business) => business.id === result.businessId) || null;

      return {
        ...result,
        status: result.status || matchingBusiness?.callStatus || "pending",
        availability:
          result.availability && result.availability !== "Unknown"
            ? result.availability
            : matchingBusiness?.summary || matchingBusiness?.availabilityHint || "Unknown",
        notes:
          result.notes ||
          matchingBusiness?.summary ||
          matchingBusiness?.transcript ||
          "No extra notes yet.",
        updatedAt: result.updatedAt || matchingBusiness?.lastUpdatedAt || currentSession.createdAt,
        durationSeconds:
          result.durationSeconds ?? matchingBusiness?.callDurationSeconds ?? null,
      };
    }) || [];
  const activeBusiness =
    currentSession?.businesses.find((business) =>
      ["calling", "requested"].includes(business.callStatus),
    ) || null;
  const selectedBusiness =
    currentSession?.businesses.find((business) => business.id === selectedBusinessId) || null;
  const selectedResult =
    currentSession?.results.find((result) => result.businessId === selectedBusinessId) || null;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-4 text-white md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(251,191,36,0.14),transparent_18%),radial-gradient(circle_at_78%_14%,rgba(168,85,247,0.2),transparent_24%),linear-gradient(180deg,rgba(9,9,29,0.94),rgba(13,18,48,0.96))]" />
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(13,19,45,0.82),rgba(39,16,68,0.72))] p-5 shadow-[0_35px_100px_rgba(4,4,24,0.45)] backdrop-blur-2xl md:p-7">
          <div className="pointer-events-none absolute -top-12 right-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.24),transparent_70%)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.18),transparent_68%)] blur-3xl" />
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-amber-200/74">Genie</p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1 className="font-['Cinzel_Decorative'] text-3xl tracking-tight text-transparent bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-200 bg-clip-text md:text-4xl">
                Search in progress
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100/76 md:text-base">
                Genie is searching businesses, placing calls, and collecting live quotes for you.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-indigo-100/62">
                <span className="rounded-full border border-amber-300/20 bg-white/8 px-3 py-1 font-medium capitalize text-amber-100">
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
                  className="text-sm font-medium text-indigo-100/68 transition hover:text-amber-100"
                  onClick={onBackToPrompt}
                  type="button"
                >
                  Back to Genie
                </button>
              ) : null}
              {currentSession?.status !== "stopped" ? (
                <button
                  className="text-sm font-medium text-rose-300 transition hover:text-rose-200"
                  onClick={handleStopSearch}
                  type="button"
                >
                  {stopping ? "Stopping..." : "Stop all calls"}
                </button>
              ) : null}
              <button
                className="sparkle-hover rounded-2xl border border-amber-300/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-amber-50 transition hover:bg-white/14"
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
            businesses={currentSession?.businesses || []}
            results={displayedResults}
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
