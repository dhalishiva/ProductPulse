import { requireSession } from "../_lib/auth.js";
import { allowedPeriods, liveProjects, type LivePeriod } from "../_lib/config.js";
import { errorResponse, json, privateCache } from "../_lib/http.js";
import { breakdown, windowFor } from "../_lib/vercel.js";

export async function GET(request: Request) {
  const denied = requireSession(request);
  if (denied) return denied;
  try {
    const params = new URL(request.url).searchParams;
    // Only configured projects can be queried; the id is never passed through to Vercel.
    const project = liveProjects.find((p) => p.id === params.get("id"));
    if (!project) return json({ error: "Unknown project." }, 404);
    const requested = Number(params.get("days") ?? 28);
    const days = (allowedPeriods as readonly number[]).includes(requested)
      ? (requested as LivePeriod)
      : 28;
    const w = windowFor(days);

    const [pages, referrers, countries, devices] = await Promise.all([
      breakdown(project.vercelProject, "requestPath", w.since, w.until),
      breakdown(project.vercelProject, "referrerHostname", w.since, w.until),
      breakdown(project.vercelProject, "country", w.since, w.until),
      breakdown(project.vercelProject, "deviceType", w.since, w.until),
    ]);

    return json({ id: project.id, days, pages, referrers, countries, devices }, 200, privateCache);
  } catch (error) {
    return errorResponse(error);
  }
}
