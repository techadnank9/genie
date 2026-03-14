export function createSseBroker() {
  const clients = new Set();

  return {
    addClient(response) {
      clients.add(response);

      response.on("close", () => {
        clients.delete(response);
      });
    },
    broadcast(event, data) {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

      for (const client of clients) {
        client.write(payload);
      }
    },
  };
}
