import { Router } from "express";

import { getSession, syncBusinessLiveDetails, upsertResult } from "../store.js";
import { normalizeWebhook } from "../utils/normalizeWebhook.js";

export function createWebhooksRouter({ broker, smallestClient }) {
  const router = Router();

  router.post("/smallest", async (request, response) => {
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
    let liveLog = null;

    if (normalized.callId && typeof smallestClient.getConversationLog === "function") {
      try {
        liveLog = await smallestClient.getConversationLog(normalized.callId);
      } catch {
        liveLog = null;
      }
    }

    syncBusinessLiveDetails({
      sessionId: normalized.sessionId,
      businessId: normalized.businessId,
      callStatus: liveLog?.status || normalized.status,
      callId: normalized.callId,
      error: null,
      callDurationSeconds:
        typeof liveLog?.duration === "number" ? liveLog.duration : normalized.callDurationSeconds,
      fromPhone: liveLog?.from || normalized.fromPhone,
      toPhone: liveLog?.to || normalized.toPhone,
      disconnectReason: liveLog?.disconnectionReason || normalized.disconnectReason,
      transcript: normalized.transcript || business?.transcript || "",
      summary: normalized.summary || business?.summary || "",
      lastEventType: normalized.eventType,
      lastUpdatedAt: liveLog?.createdAt || normalized.lastUpdatedAt,
    });

    const updatedSession = upsertResult({
      sessionId: normalized.sessionId,
      service: normalized.service || session.service,
      result: {
        businessId: normalized.businessId,
        businessName: business?.name || normalized.businessId,
        phone: liveLog?.to || business?.phone || "",
        status: liveLog?.status || normalized.status,
        price: normalized.price,
        availability: normalized.availability,
        notes: normalized.notes,
        transcript: normalized.transcript || "",
        callId: normalized.callId,
        durationSeconds:
          typeof liveLog?.duration === "number" ? liveLog.duration : normalized.callDurationSeconds,
        fromPhone: liveLog?.from || normalized.fromPhone,
        toPhone: liveLog?.to || normalized.toPhone,
        disconnectReason: liveLog?.disconnectionReason || normalized.disconnectReason,
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
