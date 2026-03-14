import React from "react";

type StatusPanelProps = {
  status: string;
  service: string;
  totalBusinesses: number;
  totalResults: number;
};

export function StatusPanel({
  status,
  service,
  totalBusinesses,
  totalResults,
}: StatusPanelProps) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-medium capitalize text-zinc-600">
          {status}
        </span>
        <span>{service}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-600">
        Genie is checking businesses and collecting quotes in the background.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Businesses</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{totalBusinesses}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Results in</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{totalResults}</p>
        </div>
      </div>
    </section>
  );
}
