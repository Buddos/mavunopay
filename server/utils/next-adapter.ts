import type { NextApiRequest, NextApiResponse } from "next";

type NextHandler = (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>;

export async function runNextHandler(handler: NextHandler, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query: Record<string, string | string[]> = {};

  url.searchParams.forEach((value, key) => {
    const existing = query[key];
    if (existing === undefined) {
      query[key] = value;
      return;
    }
    query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  });

  let body: unknown;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const text = await request.text();
      body = text.length > 0 ? text : undefined;
    }
  }

  const req = {
    method: request.method,
    query,
    body,
    headers: Object.fromEntries(request.headers.entries()),
  } as NextApiRequest;

  let statusCode = 200;
  const headers = new Headers();
  let responseBody: BodyInit | null = null;

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    setHeader(name: string, value: string | number | string[]) {
      if (Array.isArray(value)) {
        value.forEach((entry) => headers.append(name, String(entry)));
      } else {
        headers.set(name, String(value));
      }
      return res;
    },
    json(data: unknown) {
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
      responseBody = JSON.stringify(data);
      return res;
    },
    send(data: string | Buffer) {
      responseBody = typeof data === "string" ? data : new Uint8Array(data);
      return res;
    },
    end(data?: string | Buffer) {
      if (data !== undefined) {
        responseBody = typeof data === "string" ? data : new Uint8Array(data);
      }
      return res;
    },
  } as NextApiResponse;

  await handler(req, res);

  return new Response(responseBody, { status: statusCode, headers });
}
