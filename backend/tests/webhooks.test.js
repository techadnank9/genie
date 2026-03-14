import test from "node:test";
import assert from "node:assert/strict";

import { buildApp } from "../src/app.js";
import { createSession, listSessions, resetStore } from "../src/store.js";
import { inject } from "./helpers/http.js";

test.beforeEach(() => {
  resetStore();
});

test("POST /webhooks/smallest maps webhook payloads into stored results", async () => {
  createSession({
    sessionId: "session-1",
    service: "dental cleaning",
    businesses: [
      {
        id: "dental-1",
        name: "Bright Smile Dental",
        service: "dental cleaning",
        phone: "+1-555-0101",
        location: "San Francisco, CA",
      },
    ],
  });

  const app = buildApp();
  const response = await inject(app, {
    method: "POST",
    url: "/webhooks/smallest",
    body: {
      type: "post-conversation",
      call_id: "call-1",
      metadata: {
        sessionId: "session-1",
        businessId: "dental-1",
        service: "dental cleaning",
      },
      extracted_data: {
        price: 119,
        availability: "Tomorrow at 9 AM",
        notes: "Includes x-rays",
      },
    },
  });

  const session = listSessions()[0];

  assert.equal(response.status, 202);
  assert.equal(session.results.length, 1);
  assert.equal(session.results[0].price, 119);
  assert.equal(session.results[0].availability, "Tomorrow at 9 AM");
});

test("POST /webhooks/smallest ignores unknown session references safely", async () => {
  const app = buildApp();
  const response = await inject(app, {
    method: "POST",
    url: "/webhooks/smallest",
    body: {
      type: "post-conversation",
      metadata: {
        sessionId: "missing-session",
        businessId: "dental-1",
        service: "dental cleaning",
      },
      extracted_data: {
        price: 140,
      },
    },
  });

  assert.equal(response.status, 202);
  assert.deepEqual(listSessions(), []);
});

test("POST /webhooks/smallest keeps partial data without crashing", async () => {
  createSession({
    sessionId: "session-2",
    service: "plumbing",
    businesses: [
      {
        id: "plumbing-1",
        name: "FlowFix Plumbing",
        service: "plumbing",
        phone: "+1-555-0301",
        location: "San Mateo, CA",
      },
    ],
  });

  const app = buildApp();
  const response = await inject(app, {
    method: "POST",
    url: "/webhooks/smallest",
    body: {
      type: "analytics-completed",
      metadata: {
        sessionId: "session-2",
        businessId: "plumbing-1",
        service: "plumbing",
      },
      extracted_data: {
        availability: "Monday after 3 PM",
      },
    },
  });

  const session = listSessions()[0];

  assert.equal(response.status, 202);
  assert.equal(session.results[0].price, null);
  assert.equal(session.results[0].availability, "Monday after 3 PM");
});
