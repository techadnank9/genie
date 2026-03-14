import { getCheapestOption } from "./utils/getCheapestOption.js";

const state = {
  sessions: [],
};

function findSession(sessionId) {
  return state.sessions.find((session) => session.sessionId === sessionId);
}

export function resetStore() {
  state.sessions = [];
}

export function getSession(sessionId) {
  return findSession(sessionId) || null;
}

export function createSession({ sessionId, service, businesses }) {
  const session = {
    sessionId,
    service,
    status: "calling",
    createdAt: new Date().toISOString(),
    businesses: businesses.map((business) => ({
      ...business,
      callStatus: "queued",
      callId: null,
      error: null,
      callDurationSeconds: null,
      fromPhone: null,
      toPhone: business.phone || null,
      disconnectReason: null,
      transcript: "",
      summary: "",
      lastEventType: null,
      lastUpdatedAt: null,
    })),
    results: [],
    cheapestOption: null,
  };

  state.sessions.push(session);

  return session;
}

export function upsertResult({ sessionId, service, result }) {
  let session = findSession(sessionId);

  if (!session) {
    session = createSession({
      sessionId,
      service,
    businesses: [],
    });
  }

  if (session.status === "stopped") {
    return session;
  }

  const nextResult = {
    ...result,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = session.results.findIndex(
    (item) => item.businessId === result.businessId,
  );

  if (existingIndex >= 0) {
    session.results[existingIndex] = {
      ...session.results[existingIndex],
      ...nextResult,
    };
  } else {
    session.results.push(nextResult);
  }

  session.cheapestOption = getCheapestOption(session.results);

  return session;
}

export function updateBusinessCall({ sessionId, businessId, callStatus, callId = null, error = null }) {
  const session = findSession(sessionId);

  if (!session) {
    return null;
  }

  const business = session.businesses.find((item) => item.id === businessId);

  if (!business) {
    return session;
  }

  business.callStatus = callStatus;
  business.callId = callId ?? business.callId;
  business.error = error;

  return session;
}

export function syncBusinessLiveDetails({
  sessionId,
  businessId,
  callStatus,
  callId = null,
  error = null,
  callDurationSeconds,
  fromPhone,
  toPhone,
  disconnectReason,
  transcript,
  summary,
  lastEventType,
  lastUpdatedAt,
}) {
  const session = findSession(sessionId);

  if (!session) {
    return null;
  }

  const business = session.businesses.find((item) => item.id === businessId);

  if (!business) {
    return session;
  }

  if (callStatus) {
    business.callStatus = callStatus;
  }

  if (callId) {
    business.callId = callId;
  }

  if (error !== undefined) {
    business.error = error;
  }

  if (callDurationSeconds !== undefined) {
    business.callDurationSeconds = callDurationSeconds;
  }

  if (fromPhone !== undefined) {
    business.fromPhone = fromPhone;
  }

  if (toPhone !== undefined) {
    business.toPhone = toPhone;
  }

  if (disconnectReason !== undefined) {
    business.disconnectReason = disconnectReason;
  }

  if (transcript !== undefined) {
    business.transcript = transcript;
  }

  if (summary !== undefined) {
    business.summary = summary;
  }

  if (lastEventType !== undefined) {
    business.lastEventType = lastEventType;
  }

  if (lastUpdatedAt !== undefined) {
    business.lastUpdatedAt = lastUpdatedAt;
  }

  return session;
}

export function updateSessionStatus(sessionId, status) {
  const session = findSession(sessionId);

  if (!session) {
    return null;
  }

  session.status = status;
  return session;
}

export function stopSession(sessionId) {
  const session = findSession(sessionId);

  if (!session) {
    return null;
  }

  session.status = "stopped";
  session.businesses = session.businesses.map((business) => ({
    ...business,
    callStatus:
      business.callStatus === "completed" || business.callStatus === "failed"
        ? business.callStatus
        : "stopped",
    error: business.error,
  }));

  return session;
}

export function listSessions() {
  return state.sessions;
}
