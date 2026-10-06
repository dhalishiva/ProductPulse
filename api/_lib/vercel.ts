import { requireEnv } from "./config.js";

const BASE = "https://api.vercel.com/v1/query/web-analytics/visits";

export interface Totals {
  visitors: number;
  pageviews: number;
}
export interface DayPoint extends Totals {
  date: string; // YYYY-MM-DD (UTC)
}
export interface BreakdownRow extends Totals {
  label: string;
}
export type Dimension =
  | "requestPath"
  | "referrerHostname"
  | "country"
  | "deviceType";

type Params = Record<string, string | number | string[]>;

async function call(kind: "count" | "aggregate", params: Params): Promise<unknown> {
  const url = new URL(`${BASE}/${kind}`);
  url.searchParams.set("teamId", requireEnv("VERCEL_TEAM_ID"));
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value))
      value.forEach((v) => url.searchParams.append(key, v));
    else url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${requireEnv("VERCEL_TOKEN")}` },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    // Vercel's error body explains rejected parameters; it never contains our token.
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(`Vercel API returned ${response.status} for ${kind}: ${detail}`);
  }
  return response.json();
}

const num = (value: unknown) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const rows = (payload: unknown): Record<string, unknown>[] => {
  const data = (payload as { data?: unknown })?.data;
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
};

export async function countTotals(
  project: string,
  since: Date,
  until: Date,
): Promise<Totals> {
  const payload = await call("count", {
    projectId: project,
    since: since.toISOString(),
    until: until.toISOString(),
  });
  const data = (payload as { data?: Record<string, unknown> })?.data ?? {};
  return { visitors: num(data.visitors), pageviews: num(data.pageviews) };
}

/** Daily series with every day in the window present (missing days are zero). */
export async function dailySeries(
  project: string,
  since: Date,
  until: Date,
): Promise<DayPoint[]> {
  const payload = await call("aggregate", {
    projectId: project,
    by: ["day"],
    since: since.toISOString(),
    until: until.toISOString(),
    limit: 100,
  });
  const byDate = new Map<string, Totals>();
  for (const row of rows(payload)) {
    const date = String(row.timestamp ?? "").slice(0, 10);
    if (date)
      byDate.set(date, { visitors: num(row.visitors), pageviews: num(row.pageviews) });
  }
  const points: DayPoint[] = [];
  for (
    let t = Date.UTC(since.getUTCFullYear(), since.getUTCMonth(), since.getUTCDate());
    t <= until.getTime();
    t += 86_400_000
  ) {
    const date = new Date(t).toISOString().slice(0, 10);
    points.push({ date, ...(byDate.get(date) ?? { visitors: 0, pageviews: 0 }) });
  }
  return points;
}

export async function breakdown(
  project: string,
  dimension: Dimension,
  since: Date,
  until: Date,
  limit = 8,
): Promise<BreakdownRow[]> {
  const payload = await call("aggregate", {
    projectId: project,
    by: [dimension],
    since: since.toISOString(),
    until: until.toISOString(),
    limit,
  });
  return rows(payload).map((row) => {
    const raw = String(row[dimension] ?? "").trim();
    return {
      label: raw || (dimension === "referrerHostname" ? "Direct / none" : "Unknown"),
      visitors: num(row.visitors),
      pageviews: num(row.pageviews),
    };
  });
}

/**
 * [since, until] for the last `days` UTC days, including today. Boundaries sit on
 * whole seconds (00:00:00 to 23:59:59) so they match Vercel's day granularity.
 */
export function windowFor(days: number, historyLimit: number, now = new Date()) {
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const since = new Date(startOfToday - (days - 1) * 86_400_000);
  const until = new Date(startOfToday + 86_400_000 - 1000);
  const previousSince = new Date(since.getTime() - days * 86_400_000);
  const previousUntil = new Date(since.getTime() - 1000);
  // The earliest day Vercel will serve for this plan. A comparison window that
  // starts before it would be rejected, so it is skipped instead.
  const earliest = startOfToday - (historyLimit - 1) * 86_400_000;
  const canCompare = previousSince.getTime() >= earliest;
  return { since, until, previousSince, previousUntil, canCompare };
}
