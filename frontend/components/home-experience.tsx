"use client";

import React, { useState } from "react";

import { Dashboard } from "./dashboard";
import { fetchResults, startSearch } from "../lib/api";
import { parseRequestToService } from "../lib/parse-request";
import type { SearchSession } from "../lib/types";

type HomeExperienceProps = {
  services: string[];
  onStartFromPrompt?: (request: string, service: string) => Promise<SearchSession | null>;
};

export function HomeExperience({
  services,
  onStartFromPrompt,
}: HomeExperienceProps) {
  const [request, setRequest] = useState("");
  const [error, setError] = useState("");
  const [activeService, setActiveService] = useState(services[0] || "");
  const [activeSession, setActiveSession] = useState<SearchSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startFromPrompt = async () => {
    const nextService = parseRequestToService(request, services);

    if (!nextService) {
      setError("Try dental cleaning, oil change, plumbing, home cleaning, or haircut.");
      return;
    }

    setError("");
    setActiveService(nextService);
    setIsStarting(true);

    try {
      const session = onStartFromPrompt
        ? await onStartFromPrompt(request, nextService)
        : await (async () => {
            await startSearch(nextService);
            const data = await fetchResults();
            return data.sessions.at(-1) || null;
          })();

      setActiveSession(session);
    } finally {
      setIsStarting(false);
    }
  };

  if (activeSession) {
    return (
      <Dashboard
        services={services}
        selectedService={activeService}
        session={activeSession}
        isStarting={isStarting}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-5 md:px-6">
        <header className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-900/50 bg-[radial-gradient(circle_at_40%_35%,rgba(207,250,254,0.95),rgba(129,140,248,0.25)_30%,rgba(9,9,11,0.9)_70%)] shadow-[0_0_30px_rgba(99,102,241,0.18)]">
              <span className="text-2xl text-cyan-100">G</span>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight">Genie</p>
              <p className="text-sm text-zinc-500">AI business calling concierge</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Get started
            </button>
          </div>
        </header>

        <section className="relative flex flex-1 flex-col items-center justify-center py-6 text-center md:py-10">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-violet-900/60 bg-[radial-gradient(circle_at_45%_35%,rgba(224,242,254,0.95),rgba(129,140,248,0.22)_34%,rgba(17,24,39,0.92)_72%)] shadow-[0_0_36px_rgba(99,102,241,0.2)]">
            <span className="text-3xl text-cyan-100">G</span>
          </div>

          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Tell Genie what you need
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
            Describe the service in plain English. Genie will identify the request, pull matching
            businesses, and start calling them right away.
          </p>

          <div className="mt-10 w-full max-w-3xl rounded-[1.75rem] border border-zinc-800 bg-[#121212] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.38)] md:p-5">
            <textarea
              className="min-h-28 w-full resize-none border-0 bg-transparent text-lg leading-8 text-white outline-none placeholder:text-zinc-500 md:min-h-32"
              placeholder="Tell Genie what you need. Example: Find me the cheapest dental cleaning tomorrow morning."
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  void startFromPrompt();
                }
              }}
            />

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <span className="rounded-full border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300">
                  Cmd + Enter
                </span>
                <span>to submit</span>
              </div>
              <button
                className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-500 text-2xl text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                type="button"
                onClick={() => void startFromPrompt()}
                disabled={isStarting || request.trim().length === 0}
                aria-label="Submit Genie request"
              >
                ↑
              </button>
            </div>

            {error ? <p className="mt-4 text-left text-sm text-rose-400">{error}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
