import test from "node:test";
import assert from "node:assert/strict";

import { buildApp } from "../src/app.js";
import { inject } from "./helpers/http.js";

test("GET /api/search-business returns matching businesses for a service", async () => {
  const app = buildApp();
  const response = await inject(
    app,
    { url: `/api/search-business?service=${encodeURIComponent("dental cleaning")}` },
  );

  assert.equal(response.status, 200);
  assert.equal(response.json.service, "dental cleaning");
  assert.ok(Array.isArray(response.json.businesses));
  assert.ok(response.json.businesses.length > 0);
  assert.ok(
    response.json.businesses.every((business) => business.service === "dental cleaning"),
  );
});

test("GET /api/search-business returns an empty list for an unknown service", async () => {
  const app = buildApp();
  const response = await inject(app, {
    url: `/api/search-business?service=${encodeURIComponent("snow shoveling")}`,
  });

  assert.equal(response.status, 200);
  assert.equal(response.json.service, "snow shoveling");
  assert.deepEqual(response.json.businesses, []);
});
