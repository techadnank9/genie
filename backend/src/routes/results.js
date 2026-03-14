import { Router } from "express";

import { listSessions, upsertResult } from "../store.js";

export function createResultsRouter({ broker }) {
  const router = Router();

  router.post("/store-result", (request, response) => {
    const { sessionId, service, result } = request.body;

    const session = upsertResult({ sessionId, service, result });

    broker.broadcast("results.updated", {
      sessionId: session.sessionId,
      result,
      cheapestOption: session.cheapestOption,
    });

    response.status(201).json({
      session,
    });
  });

  router.get("/results", (_request, response) => {
    response.json({
      sessions: listSessions(),
    });
  });

  return router;
}
