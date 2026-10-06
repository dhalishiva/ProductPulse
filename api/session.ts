import {
  clearedCookie,
  hasSession,
  passcodeMatches,
  sessionCookie,
} from "./_lib/auth.js";
import { errorResponse, json } from "./_lib/http.js";

/** GET: am I signed in? POST {passcode}: sign in. DELETE: sign out. */
export function GET(request: Request) {
  return json({ signedIn: hasSession(request) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { passcode?: unknown } | null;
    const passcode = typeof body?.passcode === "string" ? body.passcode : "";
    if (!passcode || passcode.length > 200 || !passcodeMatches(passcode)) {
      await new Promise((resolve) => setTimeout(resolve, 600)); // slow down guessing
      return json({ error: "That passcode isn't right." }, 401);
    }
    return json({ signedIn: true }, 200, { "Set-Cookie": sessionCookie(request) });
  } catch (error) {
    return errorResponse(error);
  }
}

export function DELETE(request: Request) {
  return json({ signedIn: false }, 200, { "Set-Cookie": clearedCookie(request) });
}
