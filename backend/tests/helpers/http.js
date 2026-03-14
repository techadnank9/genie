import { Readable, Writable } from "node:stream";

export async function inject(app, { method = "GET", url, body } = {}) {
  const payload = body ? JSON.stringify(body) : null;
  const request = new Readable({
    read() {
      if (payload) {
        this.push(payload);
      }

      this.push(null);
    },
  });

  request.url = url;
  request.method = method;
  request.headers = body
    ? {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(payload).toString(),
      }
    : {};

  let responseBody = "";

  const response = new Writable({
    write(chunk, _encoding, callback) {
      responseBody += chunk.toString();
      callback();
    },
  });

  response.statusCode = 200;
  response.headers = {};
  response.setHeader = (name, value) => {
    response.headers[name.toLowerCase()] = value;
  };
  response.getHeader = (name) => response.headers[name.toLowerCase()];
  response.removeHeader = (name) => {
    delete response.headers[name.toLowerCase()];
  };
  response.end = (chunk) => {
    if (chunk) {
      responseBody += chunk.toString();
    }

    response.emit("finish");
  };

  await new Promise((resolve, reject) => {
    response.on("finish", resolve);
    response.on("error", reject);
    app.handle(request, response);
  });

  return {
    status: response.statusCode,
    json: responseBody ? JSON.parse(responseBody) : null,
    headers: response.headers,
  };
}
