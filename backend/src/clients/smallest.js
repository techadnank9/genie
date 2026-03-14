import { getConfig } from "../config.js";

export function createSmallestClient(config = getConfig()) {
  return {
    async startOutboundCall({ phone_number, metadata }) {
      const response = await fetch(`${config.smallestBaseUrl}/conversation/outbound`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.smallestApiKey}`,
        },
        body: JSON.stringify({
          agentId: config.smallestAgentId,
          phoneNumber: phone_number,
          variables: metadata,
          webhookUrl: `${config.publicBackendUrl}/webhooks/smallest`,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`Failed to start outbound call: ${message}`);
      }

      return response.json();
    },
    async stopOutboundCall(callId) {
      if (!callId) {
        return { ok: true };
      }

      return {
        ok: true,
        callId,
      };
    },
    async getConversationLog(callId) {
      if (!callId) {
        return null;
      }

      const url = new URL(`${config.smallestBaseUrl}/conversation`);
      url.searchParams.set("search", callId);
      url.searchParams.set("limit", "1");

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${config.smallestApiKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const payload = await response.json();
      return payload?.data?.logs?.find((item) => item.callId === callId) || payload?.data?.logs?.[0] || null;
    },
  };
}
