import { requireSession } from "../_lib/auth.js";
import { allowedPeriods, liveProjects, type LivePeriod } from "../_lib/config.js";
import { errorResponse, json, privateCache } from "../_lib/http.js";
import { countTotals, dailySeries, windowFor } from "../_lib/vercel.js";

export async function GET(request: Request) {
  const denied = requireSession(request);
  if (denied) return denied;
  try {
    const requested = Number(new URL(request.url).searchParams.get("days") ?? 28);
    const days = (allowedPeriods as readonly number[]).includes(requested)
      ? (requested as LivePeriod)
      : 28;
    const w = windowFor(days);

    const projects = await Promise.all(
      liveProjects.map(async (project) => {
        const meta = {
          id: project.id,
          name: project.name,
          domain: project.domain,
          color: project.color,
          initials: project.initials,
        };
        try {
          const [totals, previous, daily] = await Promise.all([
            countTotals(project.vercelProjectId, w.since, w.until),
            countTotals(project.vercelProjectId, w.previousSince, w.previousUntil),
            dailySeries(project.vercelProjectId, w.since, w.until),
          ]);
          return { ...meta, totals, previous, daily };
        } catch (error) {
          // One failing project must not blank the whole dashboard.
          console.error(`overview: ${project.id}`, error instanceof Error ? error.message : error);
          return { ...meta, error: "Could not load analytics for this project." };
        }
      }),
    );

    return json(
      {
        days,
        since: w.since.toISOString(),
        until: w.until.toISOString(),
        generatedAt: new Date().toISOString(),
        projects,
      },
      200,
      privateCache,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
