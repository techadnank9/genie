import type { ResultsResponse } from "./types";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function fetchResults(): Promise<ResultsResponse> {
  const response = await fetch(`${backendUrl}/api/results`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch results");
  }

  return response.json();
}

export async function startSearch(service: string) {
  const response = await fetch(`${backendUrl}/api/start-search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ service }),
  });

  if (!response.ok) {
    throw new Error("Failed to start Genie search");
  }

  return response.json();
}

export async function stopSearch(sessionId: string) {
  const response = await fetch(`${backendUrl}/api/stop-search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    throw new Error("Failed to stop Genie search");
  }

  return response.json();
}

export function createResultsStream() {
  if (typeof EventSource === "undefined") {
    return null;
  }

  return new EventSource(`${backendUrl}/api/stream`);
}
