import type { Period } from "../domain/types";

export interface Totals {
  visitors: number;
  pageviews: number;
}
export interface DayPoint extends Totals {
  date: string;
}
export interface LiveProductMeta {
  id: string;
  name: string;
  domain: string;
  color: string;
  initials: string;
}
export type LiveProduct = LiveProductMeta &
  (
    | { totals: Totals; previous: Totals; daily: DayPoint[]; error?: undefined }
    | { error: string; totals?: undefined; previous?: undefined; daily?: undefined }
  );
export interface LiveOverview {
  days: Period;
  since: string;
  until: string;
  generatedAt: string;
  projects: LiveProduct[];
}
export interface BreakdownRow extends Totals {
  label: string;
}
export interface LiveDetail {
  id: string;
  days: Period;
  pages: BreakdownRow[];
  referrers: BreakdownRow[];
  countries: BreakdownRow[];
  devices: BreakdownRow[];
}

/** Thrown when the server says the passcode session is missing or expired. */
export class SignedOutError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...init });
  if (response.status === 401 && !path.startsWith("/api/session"))
    throw new SignedOutError();
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok)
    throw new Error(body.error ?? "The request failed. Please try again.");
  return body as T;
}

export const liveApi = {
  isSignedIn: () =>
    request<{ signedIn: boolean }>("/api/session").then((r) => r.signedIn),
  signIn: (passcode: string) =>
    request<{ signedIn: boolean }>("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    }),
  signOut: () =>
    request<{ signedIn: boolean }>("/api/session", { method: "DELETE" }),
  overview: (days: Period) =>
    request<LiveOverview>(`/api/vercel/overview?days=${days}`),
  detail: (id: string, days: Period) =>
    request<LiveDetail>(
      `/api/vercel/project?id=${encodeURIComponent(id)}&days=${days}`,
    ),
};
