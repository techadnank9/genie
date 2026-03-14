import { Router } from "express";

import { getSession, updateBusinessCall, upsertResult } from "../store.js";
import { normalizeWebhook } from "../utils/normalizeWebhook.js";

export function createWebhooksRouter({ broker }) {
  const router = Router();

  router.post("/smallest", (request, response) => {
    const normalized = normalizeWebhook(request.body);
    const session = getSession(normalized.sessionId);

    if (!session || !normalized.businessId) {
      response.status(202).json({
        ignored: true,
      });
      return;
    }

    if (session.status === "stopped") {
      response.status(202).json({
        ignored: true,
      });
      return;
    }

    const business = session.businesses.find((item) => item.id === normalized.businessId);

    updateBusinessCall({
      sessionId: normalized.sessionId,
      businessId: normalized.businessId,
      callStatus: normalized.status,
      callId: normalized.callId,
      error: null,
    });

    const updatedSession = upsertResult({
      sessionId: normalized.sessionId,
      service: normalized.service || session.service,
      result: {
        businessId: normalized.businessId,
        businessName: business?.name || normalized.businessId,
        phone: business?.phone || "",
        status: normalized.status,
        price: normalized.price,
        availability: normalized.availability,
        notes: normalized.notes,
      },
    });

    broker.broadcast("results.updated", {
      sessionId: normalized.sessionId,
      result: updatedSession.results.find((item) => item.businessId === normalized.businessId),
      cheapestOption: updatedSession.cheapestOption,
    });

    response.status(202).json({
      received: true,
    });
  });

  return router;
}
