import { Router } from "express";

import { listSessions, syncBusinessLiveDetails, upsertResult } from "../store.js";

function normalizeLiveLog(log) {
  if (!log) {
    return null;
  }

  const extracted = log.extracted_data || log.extractedData || {};
  const transcriptEntries = log.transcript || log.metadata?.transcript || log.data?.transcript;
  const transcript = Array.isArray(transcriptEntries)
    ? transcriptEntries
        .map((entry) => `${entry.role || "speaker"}: ${entry.content || ""}`.trim())
        .join("\n")
    : transcriptEntries || log.conversationTranscript || "";
  const summary = log.summary || log.callSummary || log.metadata?.summary || "";

  return {
    callId: log.callId || log.call_id || null,
    status: log.status || "pending",
    durationSeconds:
      typeof log.duration === "number"
        ? log.duration
        : typeof log.callDuration === "number"
          ? log.callDuration
          : null,
    fromPhone: log.from || log.fromPhone || null,
    toPhone: log.to || log.toPhone || null,
    disconnectReason: log.disconnectionReason || log.disconnectReason || null,
    transcript,
    summary,
    updatedAt: log.updatedAt || log.createdAt || new Date().toISOString(),
    price:
      typeof extracted.price === "number"
        ? extracted.price
        : typeof log.price === "number"
          ? log.price
          : null,
    availability: extracted.availability || log.availability || "Unknown",
    notes: extracted.notes || log.notes || log.summary || "",
  };
}

export function createResultsRouter({ broker, smallestClient }) {
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

  router.get("/results", async (_request, response) => {
    if (typeof smallestClient?.getConversationLog === "function") {
      const sessions = listSessions();

      for (const session of sessions) {
        for (const business of session.businesses) {
          if (!business.callId) {
            continue;
          }

          try {
            const liveLog = normalizeLiveLog(
              await smallestClient.getConversationLog(business.callId),
            );

            if (!liveLog) {
              continue;
            }

            syncBusinessLiveDetails({
              sessionId: session.sessionId,
              businessId: business.id,
              callStatus: liveLog.status,
              callId: liveLog.callId,
              error: business.error,
              callDurationSeconds: liveLog.durationSeconds,
              fromPhone: liveLog.fromPhone,
              toPhone: liveLog.toPhone,
              disconnectReason: liveLog.disconnectReason,
              transcript: liveLog.transcript || business.transcript || "",
              summary: liveLog.summary || business.summary || "",
              lastEventType: business.lastEventType || "conversation-log",
              lastUpdatedAt: liveLog.updatedAt,
            });

            upsertResult({
              sessionId: session.sessionId,
              service: session.service,
              result: {
                businessId: business.id,
                businessName: business.name,
                phone: liveLog.toPhone || business.phone,
                status: liveLog.status,
                price: liveLog.price,
                availability: liveLog.availability,
                notes: liveLog.notes,
                transcript: liveLog.transcript,
                callId: liveLog.callId,
                durationSeconds: liveLog.durationSeconds,
                fromPhone: liveLog.fromPhone,
                toPhone: liveLog.toPhone,
                disconnectReason: liveLog.disconnectReason,
              },
            });
          } catch {
            // Keep the existing session state when live log enrichment is unavailable.
          }
        }
      }
    }

    response.json({
      sessions: listSessions(),
    });
  });

  return router;
}
