import test from "node:test";
import assert from "node:assert/strict";

import { buildApp } from "../src/app.js";
import { createSession, getSession, resetStore, updateBusinessCall } from "../src/store.js";
import { inject } from "./helpers/http.js";

test.beforeEach(() => {
  resetStore();
});

test("POST /api/stop-search marks the active session as stopped and updates active calls", async () => {
  createSession({
    sessionId: "session-stop-1",
    service: "dental cleaning",
    businesses: [
      {
        id: "dental-1",
        name: "Bright Smile Dental",
        service: "dental cleaning",
        phone: "+1-555-0101",
        location: "San Francisco, CA",
        priceRange: "$120-$160",
        availabilityHint: "Weekday mornings",
      },
      {
        id: "dental-2",
        name: "Market Street Dental Care",
        service: "dental cleaning",
        phone: "+1-555-0102",
        location: "Oakland, CA",
        priceRange: "$95-$140",
        availabilityHint: "Same-week afternoon slots",
      },
    ],
  });

  updateBusinessCall({
    sessionId: "session-stop-1",
    businessId: "dental-1",
    callStatus: "calling",
    callId: "call-1",
  });

  const stoppedCalls = [];
  const app = buildApp({
    smallestClient: {
      async stopOutboundCall(callId) {
        stoppedCalls.push(callId);
        return { ok: true };
      },
    },
  });

  const response = await inject(app, {
    method: "POST",
    url: "/api/stop-search",
    body: {
      sessionId: "session-stop-1",
    },
  });

  const session = getSession("session-stop-1");

  assert.equal(response.status, 200);
  assert.equal(session?.status, "stopped");
  assert.equal(session?.businesses[0].callStatus, "stopped");
  assert.equal(session?.businesses[1].callStatus, "stopped");
  assert.deepEqual(stoppedCalls, ["call-1"]);
});

test("POST /api/stop-search returns 404 for an unknown session", async () => {
  const app = buildApp({
    smallestClient: {
      async stopOutboundCall() {
        return { ok: true };
      },
    },
  });

  const response = await inject(app, {
    method: "POST",
    url: "/api/stop-search",
    body: {
      sessionId: "missing-session",
    },
  });

  assert.equal(response.status, 404);
});
