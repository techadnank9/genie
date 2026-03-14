import test from "node:test";
import assert from "node:assert/strict";

import { buildApp } from "../src/app.js";
import { listSessions, resetStore } from "../src/store.js";
import { inject } from "./helpers/http.js";

test.beforeEach(() => {
  resetStore();
});

test("POST /api/start-search creates a session and triggers one outbound call per matching business", async () => {
  const outboundCalls = [];
  const app = buildApp({
    smallestClient: {
      async startOutboundCall(payload) {
        outboundCalls.push(payload);
        return { callId: `call-${outboundCalls.length}` };
      },
    },
  });

  const response = await inject(app, {
    method: "POST",
    url: "/api/start-search",
    body: {
      service: "dental cleaning",
    },
  });

  const sessions = listSessions();

  assert.equal(response.status, 202);
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].service, "dental cleaning");
  assert.equal(sessions[0].businesses.length, 2);
  assert.equal(outboundCalls.length, 2);
  assert.equal(outboundCalls[0].phone_number, "+18728883804");
  assert.equal(sessions[0].businesses[0].callStatus, "pending");
});

test("POST /api/start-search keeps the session alive when one outbound call fails", async () => {
  const app = buildApp({
    smallestClient: {
      async startOutboundCall(payload) {
        if (payload.phone_number === "+1-555-0102") {
          throw new Error("smallest unavailable");
        }

        return { callId: "call-ok" };
      },
    },
  });

  const response = await inject(app, {
    method: "POST",
    url: "/api/start-search",
    body: {
      service: "dental cleaning",
    },
  });

  const sessions = listSessions();
  const failedBusiness = sessions[0].businesses.find(
    (business) => business.phone === "+1-555-0102",
  );

  assert.equal(response.status, 202);
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].status, "calling");
  assert.equal(failedBusiness.callStatus, "failed");
  assert.match(failedBusiness.error, /smallest unavailable/);
});
