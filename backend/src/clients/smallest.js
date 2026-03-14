import { getConfig } from "../config.js";

export function createSmallestClient(config = getConfig()) {
  async function parseJson(response) {
    const text = await response.text();

    if (!text) {
      return null;
    }

    return JSON.parse(text);
  }

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

      const searchResponse = await fetch(`${config.smallestBaseUrl}/conversation/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.smallestApiKey}`,
        },
        body: JSON.stringify({
          callIds: [callId],
        }),
      });

      if (!searchResponse.ok) {
        return null;
      }

      const searchPayload = await parseJson(searchResponse);
      const log =
        searchPayload?.data?.logs?.find((item) => item.callId === callId) ||
        searchPayload?.data?.logs?.[0] ||
        null;

      if (!log?._id) {
        return log;
      }

      const detailsResponse = await fetch(`${config.smallestBaseUrl}/conversation/${log._id}`, {
        headers: {
          Authorization: `Bearer ${config.smallestApiKey}`,
        },
      });

      if (!detailsResponse.ok) {
        return log;
      }

      const detailsPayload = await parseJson(detailsResponse);
      return detailsPayload?.data || detailsPayload || log;
    },
    async listConversationHistoryByNumber(phoneNumber, limit = 10) {
      if (!phoneNumber) {
        return [];
      }

      const url = new URL(`${config.smallestBaseUrl}/conversation`);
      url.searchParams.set("search", phoneNumber);
      url.searchParams.set("limit", String(limit));

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${config.smallestApiKey}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const payload = await parseJson(response);
      const logs = payload?.data?.logs || [];
      const matchingLogs = logs.filter((log) => (log.to || log.toPhone) === phoneNumber);

      const detailedLogs = await Promise.all(
        matchingLogs.map(async (log) => {
          if (!log?._id) {
            return log;
          }

          try {
            const detailsResponse = await fetch(`${config.smallestBaseUrl}/conversation/${log._id}`, {
              headers: {
                Authorization: `Bearer ${config.smallestApiKey}`,
              },
            });

            if (!detailsResponse.ok) {
              return log;
            }

            const detailsPayload = await parseJson(detailsResponse);
            return detailsPayload?.data || detailsPayload || log;
          } catch {
            return log;
          }
        }),
      );

      return detailedLogs;
    },
  };
}
