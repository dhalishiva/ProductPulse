import { requireSession } from "../_lib/auth.js";
import { historyDays, liveProjects, resolveDays } from "../_lib/config.js";
import { errorResponse, json, privateCache } from "../_lib/http.js";
import { countTotals, dailySeries, windowFor } from "../_lib/vercel.js";

export async function GET(request: Request) {
  const denied = requireSession(request);
  if (denied) return denied;
  try {
    const { requested, days } = resolveDays(new URL(request.url).searchParams.get("days"));
    const w = windowFor(days, historyDays());

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
            w.canCompare
              ? countTotals(project.vercelProjectId, w.previousSince, w.previousUntil)
              : Promise.resolve(null),
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
        requestedDays: requested,
        historyDays: historyDays(),
        comparison: w.canCompare,
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
