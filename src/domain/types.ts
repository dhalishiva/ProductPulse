export type Provider = "ga4" | "gsc" | "vercel";
export type Period = 7 | 28 | 90;
export type PlanId = "personal" | "starter" | "studio";
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  planId: PlanId;
}
export interface Membership {
  workspaceId: string;
  userId: string;
  role: "owner" | "admin" | "viewer";
}
export interface Product {
  id: string;
  workspaceId: string;
  name: string;
  domain: string;
  color: string;
  initials: string;
  base: number;
  trend: number;
}
export interface Connection {
  productId: string;
  provider: Provider;
  connected: boolean;
}
export interface Alert {
  id: string;
  productId: string;
  type: "opportunity" | "attention" | "milestone";
  title: string;
  description: string;
  read: boolean;
}
export interface Preferences {
  digest: boolean;
  weekly: boolean;
  threshold: number;
}
export interface Snapshot {
  version: 1;
  workspace: Workspace;
  membership: Membership;
  products: Product[];
  connections: Connection[];
  alerts: Alert[];
  preferences: Preferences;
}
/** Replace this adapter with authenticated server requests when adding live accounts. */
export interface AnalyticsRepository {
  load(workspaceId: string): Promise<Snapshot>;
  save(snapshot: Snapshot): void;
  reset(workspaceId: string): Promise<Snapshot>;
}
export interface Plan {
  id: PlanId;
  name: string;
  productLimit: number;
  alerts: boolean;
  available: boolean;
}
export const plans: Record<PlanId, Plan> = {
  personal: {
    id: "personal",
    name: "Personal preview",
    productLimit: 10,
    alerts: true,
    available: true,
  },
  starter: {
    id: "starter",
    name: "Starter",
    productLimit: 5,
    alerts: true,
    available: false,
  },
  studio: {
    id: "studio",
    name: "Studio",
    productLimit: 25,
    alerts: true,
    available: false,
  },
};
export const providers: Record<
  Provider,
  { name: string; short: string; description: string }
> = {
  ga4: {
    name: "Google Analytics",
    short: "GA4",
    description:
      "Understand your visitors, acquisition channels, and key events.",
  },
  gsc: {
    name: "Search Console",
    short: "GSC",
    description:
      "Follow search clicks, impressions, and the queries that bring people in.",
  },
  vercel: {
    name: "Vercel Analytics",
    short: "Vercel",
    description:
      "Keep an independent view of page views, visitors, and referrers.",
  },
};
