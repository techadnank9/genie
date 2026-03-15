"use client";

import React, { useEffect, useState } from "react";

import { Dashboard } from "./dashboard";
import { GenieShowcase } from "./genie-showcase";
import { MagicLamp } from "./magic-lamp";
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
  const [request, setRequest] = useState("Find me a dental cleaning tomorrow morning");
  const [error, setError] = useState("");
  const [activeService, setActiveService] = useState(services[0] || "");
  const [activeSession, setActiveSession] = useState<SearchSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [restoreLatestSession, setRestoreLatestSession] = useState(true);
  const [lampActive, setLampActive] = useState(false);

  useEffect(() => {
    if (onStartFromPrompt || !restoreLatestSession) {
      return;
    }

    let mounted = true;

    fetchResults()
      .then((data) => {
        if (!mounted) {
          return;
        }

        const latestSession = data.sessions.at(-1) || null;

        if (!latestSession) {
          return;
        }

        setActiveService(latestSession.service);
        setActiveSession(latestSession);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [onStartFromPrompt, restoreLatestSession]);

  const startFromPrompt = async () => {
    const nextService = parseRequestToService(request, services);

    if (!nextService) {
      setError("Try dental cleaning, oil change, plumbing, home cleaning, or haircut.");
      return;
    }

    setError("");
    setActiveService(nextService);
    setIsStarting(true);
    setRestoreLatestSession(true);

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
        onBackToPrompt={() => {
          setActiveSession(null);
          setRequest("");
          setError("");
          setRestoreLatestSession(false);
        }}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="palace-silhouette pointer-events-none absolute inset-x-0 bottom-0 h-[28vh] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(168,85,247,0.16),transparent_26%),radial-gradient(circle_at_50%_72%,rgba(251,191,36,0.1),transparent_30%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 md:px-8">
        <header className="relative z-10 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.6rem] border border-amber-300/30 bg-[linear-gradient(145deg,rgba(91,33,182,0.7),rgba(15,23,42,0.9))] shadow-[0_0_40px_rgba(168,85,247,0.28)]">
              <span className="font-['Cinzel_Decorative'] text-2xl text-amber-100">G</span>
            </div>
            <div>
              <p className="font-['Cinzel_Decorative'] text-3xl text-amber-100">Genie</p>
              <p className="text-sm text-indigo-100/68">Midnight concierge for business calls</p>
            </div>
          </div>
          <button
            type="button"
            className="sparkle-hover rounded-full border border-amber-300/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-amber-100 backdrop-blur-lg transition hover:bg-white/15"
          >
            Summon Genie
          </button>
        </header>

        <section className="relative z-10 flex flex-1 flex-col justify-start py-5 md:py-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
            <div className="relative w-full">
              <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.28),transparent_68%)] blur-3xl" />
              <div className="pointer-events-none absolute left-[42%] top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.18),transparent_64%)] blur-3xl" />

              <h1 className="mx-auto mt-0 max-w-5xl font-['Cinzel_Decorative'] text-4xl leading-[1.04] text-transparent bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-200 bg-clip-text md:text-6xl">
                Make A Wish
              </h1>
              <div className="relative mt-3 flex justify-center">
                <div className="pointer-events-none absolute inset-0 flex justify-center">
                  <div className="h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(201,236,255,0.22),transparent_65%)] blur-2xl" />
                </div>
                {[...Array(10)].map((_, index) => (
                  <span
                    key={`hero-particle-${index}`}
                    className="float-particle absolute rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),rgba(201,236,255,0.15))]"
                    style={{
                      width: `${6 + (index % 3) * 4}px`,
                      height: `${6 + (index % 3) * 4}px`,
                      left: `${30 + index * 4}%`,
                      bottom: `${10 + (index % 4) * 8}%`,
                      animationDuration: `${5 + (index % 4)}s`,
                      animationDelay: `${index * 0.3}s`,
                    }}
                  />
                ))}
                <div className="lamp-breathe relative z-10">
                  <MagicLamp
                    active={lampActive}
                    className="h-24 w-24 md:h-28 md:w-28"
                    onClick={() => {
                      setLampActive(true);
                      setTimeout(() => setLampActive(false), 900);
                    }}
                  />
                </div>
              </div>
              <p className="mx-auto mt-3 max-w-3xl text-base leading-8 text-indigo-100/78 md:text-lg">
                Drop a request into the lamp. Genie will search, call businesses in the real world,
                and return with the best options, prices, and availability.
              </p>
            </div>

            <div className="relative mt-7 flex w-full max-w-4xl justify-center">
              <div className="w-full max-w-5xl rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(10,15,37,0.88),rgba(40,16,76,0.76))] p-5 pt-10 shadow-[0_24px_70px_rgba(5,5,26,0.42)] backdrop-blur-2xl md:p-6 md:pt-12">
                <textarea
                  className="min-h-16 w-full resize-none border-0 bg-transparent text-lg leading-8 text-amber-50 outline-none placeholder:text-indigo-100/38 md:min-h-20"
                  placeholder="Tell Genie what you need. Example: Find me the cheapest dental cleaning tomorrow morning."
                  value={request}
                  onChange={(event) => setRequest(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void startFromPrompt();
                    }
                  }}
                />

                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-sm text-indigo-100/55">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-amber-100">
                      Enter
                    </span>
                    <span>to release the magic</span>
                  </div>
                  <button
                    className="sparkle-hover flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6d36c,#b7791f)] text-xl text-slate-950 shadow-[0_0_26px_rgba(251,191,36,0.35)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    onClick={() => void startFromPrompt()}
                    disabled={isStarting || request.trim().length === 0}
                    aria-label="Submit Genie request"
                  >
                    ↑
                  </button>
                </div>

                {error ? <p className="mt-4 text-left text-sm text-rose-300">{error}</p> : null}
              </div>
            </div>
          </div>

          <GenieShowcase />
        </section>

        <button
          type="button"
          className="sparkle-hover fixed bottom-6 right-6 z-20 flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/35 bg-[linear-gradient(145deg,rgba(109,40,217,0.9),rgba(15,23,42,0.95))] shadow-[0_0_35px_rgba(168,85,247,0.4)] backdrop-blur-xl"
          onClick={() => {
            setLampActive(true);
            setTimeout(() => setLampActive(false), 900);
          }}
        >
          <span className="font-['Cinzel_Decorative'] text-2xl text-amber-100">G</span>
        </button>
      </div>
    </main>
  );
}
