import { ConfigError } from "./config.js";

export function json(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

/** Analytics responses may be cached by the signed-in browser only, never by shared caches. */
export const privateCache = { "Cache-Control": "private, max-age=300" };

export function errorResponse(error: unknown): Response {
  if (error instanceof ConfigError) {
    // Name the missing variable (not a secret) so setup problems are obvious.
    return json({ error: error.message }, 500);
  }
  console.error(error instanceof Error ? error.message : "Unknown error");
  return json({ error: "Something went wrong. Please try again." }, 502);
}
