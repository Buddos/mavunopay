import { loadApiHandler } from "./utils/api-handlers";
import { runNextHandler } from "./utils/next-adapter";

export async function handleApiRequest(request: Request): Promise<Response> {
  const routeName =
    new URL(request.url).pathname
      .replace(/^\/api\/?/, "")
      .split("/")
      .filter(Boolean)
      .join("/") || "health";

  const handler = await loadApiHandler(routeName);
  if (!handler) {
    return new Response(JSON.stringify({ error: "API route not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  return runNextHandler(handler, request);
}
