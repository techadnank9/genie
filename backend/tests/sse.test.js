import test from "node:test";
import assert from "node:assert/strict";

import { buildApp } from "../src/app.js";
import { createSseBroker } from "../src/sseBroker.js";

test("sse broker broadcasts structured events to connected clients", () => {
  const broker = createSseBroker();
  const writes = [];

  const response = {
    write(chunk) {
      writes.push(chunk);
    },
    on() {},
  };

  broker.addClient(response);
  broker.broadcast("results.updated", {
    sessionId: "session-1",
  });

  assert.equal(writes.length, 1);
  assert.match(writes[0], /event: results\.updated/);
  assert.match(writes[0], /"sessionId":"session-1"/);
});

test("GET /api/stream responds with event stream headers", async () => {
  const app = buildApp();
  const headers = {};

  const request = {
    method: "GET",
    url: "/api/stream",
    headers: {},
  };
  const response = {
    statusCode: 200,
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    flushHeaders() {},
    on() {},
    write() {},
  };

  app.handle(request, response);

  assert.equal(response.statusCode, 200);
  assert.equal(headers["content-type"], "text/event-stream; charset=utf-8");
  assert.equal(headers["cache-control"], "no-cache");
});
