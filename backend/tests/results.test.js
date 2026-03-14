import test from "node:test";
import assert from "node:assert/strict";

import { buildApp } from "../src/app.js";
import { resetStore } from "../src/store.js";
import { inject } from "./helpers/http.js";

test.beforeEach(() => {
  resetStore();
});

test("POST /api/store-result stores a new result and GET /api/results returns it", async () => {
  const app = buildApp();

  const storeResponse = await inject(app, {
    method: "POST",
    url: "/api/store-result",
    body: {
      sessionId: "session-1",
      service: "dental cleaning",
      result: {
        businessId: "dental-1",
        businessName: "Bright Smile Dental",
        phone: "+1-555-0101",
        status: "completed",
        price: 125,
        availability: "Tomorrow at 10 AM",
        notes: "Includes exam",
      },
    },
  });

  const resultsResponse = await inject(app, {
    url: "/api/results",
  });

  assert.equal(storeResponse.status, 201);
  assert.equal(resultsResponse.status, 200);
  assert.equal(resultsResponse.json.sessions.length, 1);
  assert.equal(resultsResponse.json.sessions[0].results.length, 1);
  assert.equal(resultsResponse.json.sessions[0].results[0].price, 125);
});

test("POST /api/store-result updates an existing business result instead of duplicating it", async () => {
  const app = buildApp();

  await inject(app, {
    method: "POST",
    url: "/api/store-result",
    body: {
      sessionId: "session-2",
      service: "oil change",
      result: {
        businessId: "oil-1",
        businessName: "Quick Lube Garage",
        phone: "+1-555-0201",
        status: "completed",
        price: 70,
        availability: "Today at 4 PM",
        notes: "Synthetic available",
      },
    },
  });

  await inject(app, {
    method: "POST",
    url: "/api/store-result",
    body: {
      sessionId: "session-2",
      service: "oil change",
      result: {
        businessId: "oil-1",
        businessName: "Quick Lube Garage",
        phone: "+1-555-0201",
        status: "completed",
        price: 55,
        availability: "Today at 2 PM",
        notes: "Discount applied",
      },
    },
  });

  const resultsResponse = await inject(app, {
    url: "/api/results",
  });

  assert.equal(resultsResponse.status, 200);
  assert.equal(resultsResponse.json.sessions[0].results.length, 1);
  assert.equal(resultsResponse.json.sessions[0].results[0].price, 55);
  assert.equal(resultsResponse.json.sessions[0].results[0].notes, "Discount applied");
});

test("GET /api/results returns the cheapest completed option per session", async () => {
  const app = buildApp();

  await inject(app, {
    method: "POST",
    url: "/api/store-result",
    body: {
      sessionId: "session-3",
      service: "haircut",
      result: {
        businessId: "hair-1",
        businessName: "Cut & Craft Studio",
        phone: "+1-555-0501",
        status: "completed",
        price: 45,
        availability: "Friday 1 PM",
        notes: "Senior stylist",
      },
    },
  });

  await inject(app, {
    method: "POST",
    url: "/api/store-result",
    body: {
      sessionId: "session-3",
      service: "haircut",
      result: {
        businessId: "hair-2",
        businessName: "West Bay Barbers",
        phone: "+1-555-0502",
        status: "completed",
        price: 32,
        availability: "Walk-in now",
        notes: "Cash only",
      },
    },
  });

  const resultsResponse = await inject(app, {
    url: "/api/results",
  });

  assert.equal(resultsResponse.status, 200);
  assert.equal(resultsResponse.json.sessions[0].cheapestOption.businessId, "hair-2");
  assert.equal(resultsResponse.json.sessions[0].cheapestOption.price, 32);
});
