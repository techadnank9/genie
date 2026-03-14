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
  assert.equal(session.businesses[0].callStatus, "completed");
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

  const app = buildApp({
    smallestClient: {
      async getConversationLog() {
        return {
          callId: "call-1",
          status: "no_answer",
          duration: 0,
          from: "+17712513617",
          to: "+15550301",
          disconnectionReason: "timeout",
          createdAt: "2026-03-14T15:00:00.000Z",
        };
      },
    },
  });
  const response = await inject(app, {
    method: "POST",
    url: "/webhooks/smallest",
    body: {
      type: "analytics-completed",
      call_id: "call-1",
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
  assert.equal(session.results[0].status, "no_answer");
  assert.equal(session.businesses[0].fromPhone, "+17712513617");
  assert.equal(session.businesses[0].disconnectReason, "timeout");
});

test("GET /api/results enriches sessions from smallest call logs", async () => {
  createSession({
    sessionId: "session-3",
    service: "dental cleaning",
    businesses: [
      {
        id: "dental-1",
        name: "Bright Smile Dental",
        service: "dental cleaning",
        phone: "+18728883804",
        location: "San Francisco, CA",
        priceRange: "$120-$160",
        availabilityHint: "Weekday mornings",
      },
    ],
  });

  listSessions()[0].businesses[0].callId = "call-live-1";

  const app = buildApp({
    smallestClient: {
      async getConversationLog(callId) {
        assert.equal(callId, "call-live-1");
        return {
          _id: "log-1",
          callId: "call-live-1",
          status: "completed",
          duration: 76,
          from: "+17712513617",
          to: "+18728883804",
          summary: "Customer asked about tomorrow morning availability and was quoted $60.",
          transcript: [
            {
              role: "agent",
              content: "Hi, I am calling to ask about tomorrow morning availability.",
            },
            {
              role: "user",
              content: "We have an opening at 11:30 AM and the cleaning is $60.",
            },
          ],
          extracted_data: {
            price: 60,
            availability: "Tomorrow 11:30 AM",
            notes: "Payment accepted in advance.",
          },
          createdAt: "2026-03-14T16:12:00.000Z",
        };
      },
    },
  });

  const response = await inject(app, {
    method: "GET",
    url: "/api/results",
  });

  const payload = response.json;
  const business = payload.sessions[0].businesses[0];
  const result = payload.sessions[0].results[0];

  assert.equal(response.status, 200);
  assert.equal(business.callStatus, "completed");
  assert.equal(business.fromPhone, "+17712513617");
  assert.equal(business.callDurationSeconds, 76);
  assert.equal(result.price, 60);
  assert.equal(result.availability, "Tomorrow 11:30 AM");
  assert.match(result.transcript, /agent: Hi, I am calling/i);
  assert.match(result.transcript, /user: We have an opening/i);
});
