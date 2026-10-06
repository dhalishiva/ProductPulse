import { requireSession } from "../_lib/auth.js";
import { historyDays, liveProjects, resolveDays } from "../_lib/config.js";
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
    const { days } = resolveDays(params.get("days"));
    const w = windowFor(days, historyDays());

    const [pages, referrers, countries, devices] = await Promise.all([
      breakdown(project.vercelProjectId, "requestPath", w.since, w.until),
      breakdown(project.vercelProjectId, "referrerHostname", w.since, w.until),
      breakdown(project.vercelProjectId, "country", w.since, w.until),
      breakdown(project.vercelProjectId, "deviceType", w.since, w.until),
    ]);

    return json({ id: project.id, days, pages, referrers, countries, devices }, 200, privateCache);
  } catch (error) {
    return errorResponse(error);
  }
}
