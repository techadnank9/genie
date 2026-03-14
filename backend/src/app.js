import cors from "cors";
import express from "express";

import { createSmallestClient } from "./clients/smallest.js";
import { searchRouter } from "./routes/search.js";
import { createResultsRouter } from "./routes/results.js";
import { createStartSearchRouter } from "./routes/startSearch.js";
import { createStopSearchRouter } from "./routes/stopSearch.js";
import { createWebhooksRouter } from "./routes/webhooks.js";
import { createSseBroker } from "./sseBroker.js";

export function buildApp({ smallestClient = createSmallestClient() } = {}) {
  const app = express();
  const broker = createSseBroker();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api", searchRouter);
  app.use("/api", createResultsRouter({ broker, smallestClient }));
  app.use("/api", createStartSearchRouter({ broker, smallestClient }));
  app.use("/api", createStopSearchRouter({ broker, smallestClient }));
  app.use("/webhooks", createWebhooksRouter({ broker, smallestClient }));
  app.get("/api/stream", (_request, response) => {
    response.setHeader("content-type", "text/event-stream; charset=utf-8");
    response.setHeader("cache-control", "no-cache");
    response.setHeader("connection", "keep-alive");
    response.flushHeaders?.();
    broker.addClient(response);
  });

  return app;
}
