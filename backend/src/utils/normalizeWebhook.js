export function normalizeWebhook(payload) {
  const metadata = payload.metadata || {};
  const extracted = payload.extracted_data || payload.extractedData || {};
  const eventType = metadata.eventType || payload.type || "";
  const callStatus =
    payload.status ||
    payload.callStatus ||
    metadata.status ||
    (eventType === "pre-conversation"
      ? "in_progress"
      : eventType === "post-conversation" || eventType === "analytics-completed"
        ? "completed"
        : "pending");
  const duration =
    typeof payload.duration === "number"
      ? payload.duration
      : typeof payload.callDuration === "number"
        ? payload.callDuration
        : null;
  const transcript =
    payload.transcript ||
    payload.conversationTranscript ||
    payload.data?.transcript ||
    "";
  const summary = payload.summary || payload.data?.summary || "";

  return {
    sessionId: metadata.sessionId || null,
    service: metadata.service || "",
    businessId: metadata.businessId || null,
    callId: payload.call_id || payload.callId || null,
    eventType,
    status: callStatus,
    price: Number.isFinite(extracted.price) ? extracted.price : null,
    availability: extracted.availability || "Unknown",
    notes: extracted.notes || summary || "",
    transcript,
    summary,
    callDurationSeconds: duration,
    fromPhone: metadata.fromPhone || payload.from || payload.data?.from || null,
    toPhone: metadata.toPhone || payload.to || payload.data?.to || null,
    disconnectReason:
      payload.disconnectionReason || payload.disconnectReason || payload.data?.disconnectionReason || null,
    lastUpdatedAt: payload.createdAt || payload.updatedAt || new Date().toISOString(),
  };
}
