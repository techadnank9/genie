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
  };
}
