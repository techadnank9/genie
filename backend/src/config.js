import dotenv from "dotenv";

dotenv.config();

export function getConfig() {
  return {
    port: Number(process.env.PORT || 4000),
    smallestApiKey: process.env.SMALLEST_API_KEY || "",
    smallestAgentId: process.env.SMALLEST_AGENT_ID || "",
    smallestBaseUrl:
      process.env.SMALLEST_BASE_URL || "https://atoms-api.smallest.ai/api/v1",
    publicBackendUrl: process.env.PUBLIC_BACKEND_URL || "http://localhost:4000",
  };
}
