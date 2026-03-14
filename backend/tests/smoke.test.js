import test from "node:test";
import assert from "node:assert/strict";

import { buildApp } from "../src/app.js";

test("buildApp returns an express app function", () => {
  const app = buildApp();

  assert.equal(typeof app, "function");
});

