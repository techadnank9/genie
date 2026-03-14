export function normalizeWebhook(payload) {
  const metadata = payload.metadata || {};
  const extracted = payload.extracted_data || payload.extractedData || {};

  return {
    sessionId: metadata.sessionId || null,
    service: metadata.service || "",
    businessId: metadata.businessId || null,
    callId: payload.call_id || payload.callId || null,
    status:
      payload.type === "pre-conversation"
        ? "calling"
        : payload.type === "post-conversation" || payload.type === "analytics-completed"
          ? "completed"
          : "pending",
    price: Number.isFinite(extracted.price) ? extracted.price : null,
    availability: extracted.availability || "Unknown",
    notes: extracted.notes || payload.summary || "",
  };
}
