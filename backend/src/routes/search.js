import { Router } from "express";

import { businesses } from "../../data/businesses.js";

export const searchRouter = Router();

searchRouter.get("/search-business", (request, response) => {
  const service = String(request.query.service || "").trim().toLowerCase();
  const matches = businesses.filter((business) => business.service === service);

  response.json({
    service,
    businesses: matches,
  });
});
