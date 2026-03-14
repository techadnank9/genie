import { randomUUID } from "node:crypto";
import { Router } from "express";

import { businesses } from "../../data/businesses.js";
import { createSession, updateBusinessCall, updateSessionStatus } from "../store.js";

export function createStartSearchRouter({ broker, smallestClient }) {
  const router = Router();

  router.post("/start-search", async (request, response) => {
    const service = String(request.body.service || "").trim().toLowerCase();
    const matches = businesses.filter((business) => business.service === service);
    const sessionId = randomUUID();

    const session = createSession({
      sessionId,
      service,
      businesses: matches,
    });

    broker.broadcast("search.status", {
      sessionId,
      status: "searching",
      service,
    });

    for (const business of matches) {
      try {
        const call = await smallestClient.startOutboundCall({
          phone_number: business.phone,
          metadata: {
            sessionId,
            businessId: business.id,
            service,
          },
        });

        console.log(
          "[Genie] outbound call created",
          JSON.stringify({
            sessionId,
            businessId: business.id,
            phone: business.phone,
            response: call,
          }),
        );

        updateBusinessCall({
          sessionId,
          businessId: business.id,
          callStatus: "pending",
          callId:
            call.callId ||
            call.call_id ||
            call.conversationId ||
            call.conversation_id ||
            call.data?.conversationId ||
            call.data?.conversation_id ||
            null,
          error: null,
        });
      } catch (error) {
        console.error(
          "[Genie] outbound call failed",
          JSON.stringify({
            sessionId,
            businessId: business.id,
            phone: business.phone,
            message: error.message,
          }),
        );

        updateBusinessCall({
          sessionId,
          businessId: business.id,
          callStatus: "failed",
          error: error.message,
        });
      }
    }

    updateSessionStatus(sessionId, "calling");

    broker.broadcast("search.status", {
      sessionId,
      status: "calling",
      service,
    });

    response.status(202).json({
      session,
    });
  });

  return router;
}
