import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { requireEnv } from "./config.js";
import { json } from "./http.js";

/**
 * Single-owner passcode gate. The passcode and signing secret live only in
 * server environment variables. A successful login sets a signed, HttpOnly,
 * SameSite=Strict cookie that expires after SESSION_DAYS.
 */
const COOKIE = "pp_session";
const SESSION_DAYS = 7;

const digest = (value: string) => createHash("sha256").update(value).digest();
const sign = (payload: string) =>
  createHmac("sha256", requireEnv("SESSION_SECRET"))
    .update(payload)
    .digest("base64url");

export function passcodeMatches(candidate: string): boolean {
  // Compare fixed-length digests so length differences leak nothing.
  return timingSafeEqual(digest(candidate), digest(requireEnv("PRODUCTPULSE_PASSCODE")));
}

function secureFlag(request: Request): string {
  const host = new URL(request.url).hostname;
  return host === "localhost" || host === "127.0.0.1" ? "" : "; Secure";
}

export function sessionCookie(request: Request): string {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = String(expires);
  return `${COOKIE}=${payload}.${sign(payload)}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${SESSION_DAYS * 86400}${secureFlag(request)}`;
}

export function clearedCookie(request: Request): string {
  return `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${secureFlag(request)}`;
}

export function hasSession(request: Request): boolean {
  const header = request.headers.get("cookie") ?? "";
  const raw = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return false;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return false;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}

/** Returns a 401 response when the request is not signed in, otherwise null. */
export function requireSession(request: Request): Response | null {
  return hasSession(request) ? null : json({ error: "Not signed in." }, 401);
}
