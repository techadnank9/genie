import { Router } from "express";

import { getSession, stopSession } from "../store.js";

export function createStopSearchRouter({ broker, smallestClient }) {
  const router = Router();

  router.post("/stop-search", async (request, response) => {
    const sessionId = String(request.body.sessionId || "").trim();
    const session = getSession(sessionId);

    if (!session) {
      response.status(404).json({
        error: "Session not found",
      });
      return;
    }

    const activeCalls = session.businesses.filter((business) => business.callId);

    await Promise.all(
      activeCalls.map(async (business) => {
        try {
          await smallestClient.stopOutboundCall?.(business.callId);
        } catch (_error) {
          return null;
        }

        return null;
      }),
    );

    const updatedSession = stopSession(sessionId);

    broker.broadcast("search.status", {
      sessionId,
      status: "stopped",
      service: session.service,
    });

    response.json({
      session: updatedSession,
    });
  });

  return router;
}
