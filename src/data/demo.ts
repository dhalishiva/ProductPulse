import type {
  AnalyticsRepository,
  Period,
  Product,
  Snapshot,
} from "../domain/types";
export const WORKSPACE_ID = "ws-personal-demo";
export const STORAGE_KEY = "productpulse:demo:v1";
const initial: Snapshot = {
  version: 1,
  workspace: {
    id: WORKSPACE_ID,
    name: "My workspace",
    ownerId: "demo-owner",
    planId: "personal",
  },
  membership: {
    workspaceId: WORKSPACE_ID,
    userId: "demo-owner",
    role: "owner",
  },
  products: [
    {
      id: "slotrecover",
      workspaceId: WORKSPACE_ID,
      name: "SlotRecover",
      domain: "slotrecover.pro",
      initials: "S",
      color: "#7567df",
      base: 144,
      trend: 0.26,
    },
    {
      id: "flowsentinel",
      workspaceId: WORKSPACE_ID,
      name: "FlowSentinel",
      domain: "flowsentinel.example",
      initials: "F",
      color: "#3c91b9",
      base: 96,
      trend: 0.14,
    },
    {
      id: "ledgerleaf",
      workspaceId: WORKSPACE_ID,
      name: "LedgerLeaf",
      domain: "ledgerleaf.example",
      initials: "L",
      color: "#4d9478",
      base: 72,
      trend: -0.08,
    },
    {
      id: "darksutra",
      workspaceId: WORKSPACE_ID,
      name: "DarkSutra",
      domain: "darksutra.com",
      initials: "D",
      color: "#c38a55",
      base: 49,
      trend: 0.19,
    },
  ],
  connections: [
    "slotrecover",
    "flowsentinel",
    "ledgerleaf",
    "darksutra",
  ].flatMap((productId) =>
    (["ga4", "gsc", "vercel"] as const).map((provider) => ({
      productId,
      provider,
      connected: true,
    })),
  ),
  alerts: [
    {
      id: "a1",
      productId: "slotrecover",
      type: "opportunity",
      title: "Your search visibility is growing",
      description:
        "SlotRecover is getting more attention in search. Review the queries behind the increase and the pages they lead to.",
      read: false,
    },
    {
      id: "a2",
      productId: "ledgerleaf",
      type: "attention",
      title: "A quieter week for LedgerLeaf",
      description:
        "Traffic is trending below the previous period. Start with acquisition channels to see what changed.",
      read: false,
    },
    {
      id: "a3",
      productId: "flowsentinel",
      type: "milestone",
      title: "A small win worth noticing",
      description:
        "FlowSentinel passed 100 key events in this sample period. Take a look at which pages are converting.",
      read: true,
    },
  ],
  preferences: { digest: true, weekly: true, threshold: 20 },
};
const fresh = () => structuredClone(initial);
function valid(value: unknown): value is Snapshot {
  if (!value || typeof value !== "object") return false;
  const s = value as Snapshot;
  return (
    s.version === 1 &&
    s.workspace?.id === WORKSPACE_ID &&
    typeof s.workspace.name === "string" &&
    s.workspace.planId === "personal" &&
    s.membership?.workspaceId === WORKSPACE_ID &&
    s.membership.role === "owner" &&
    Array.isArray(s.products) &&
    s.products.every(
      (p) =>
        p.workspaceId === WORKSPACE_ID &&
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        typeof p.domain === "string" &&
        typeof p.color === "string" &&
        typeof p.initials === "string" &&
        Number.isFinite(p.base) &&
        Number.isFinite(p.trend),
    ) &&
    Array.isArray(s.connections) &&
    s.connections.every(
      (c) =>
        typeof c.productId === "string" &&
        ["ga4", "gsc", "vercel"].includes(c.provider) &&
        typeof c.connected === "boolean",
    ) &&
    Array.isArray(s.alerts) &&
    s.alerts.every(
      (a) =>
        typeof a.id === "string" &&
        typeof a.title === "string" &&
        typeof a.description === "string" &&
        typeof a.read === "boolean" &&
        ["opportunity", "attention", "milestone"].includes(a.type),
    ) &&
    typeof s.preferences?.digest === "boolean" &&
    typeof s.preferences.weekly === "boolean" &&
    Number.isFinite(s.preferences.threshold)
  );
}
export const demoRepository: AnalyticsRepository = {
  async load(workspaceId) {
    if (workspaceId !== WORKSPACE_ID) throw new Error("Workspace not found.");
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return fresh();
    try {
      const value: unknown = JSON.parse(stored);
      return valid(value) ? value : fresh();
    } catch {
      return fresh();
    }
  },
  save(snapshot) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  },
  async reset(workspaceId) {
    if (workspaceId !== WORKSPACE_ID) throw new Error("Workspace not found.");
    localStorage.removeItem(STORAGE_KEY);
    return fresh();
  },
};
export { fresh as freshDemo };
export interface Day {
  label: string;
  date: string;
  users: number;
  previous: number;
  clicks: number;
  impressions: number;
  events: number;
  vercel: number;
}
export function series(products: Product[], period: Period): Day[] {
  return Array.from({ length: period }, (_, i) => {
    const date = new Date(Date.UTC(2026, 8, 30 - period + 1 + i));
    let users = 0,
      previous = 0,
      events = 0,
      clicks = 0,
      impressions = 0,
      vercel = 0;
    for (const p of products) {
      const j =
        Array.from(p.id).reduce((sum, c) => sum + c.charCodeAt(0), 0) % 4;
      const wave =
        0.86 + Math.sin(i * 0.78 + j) * 0.19 + (i % 7 < 5 ? 0.2 : -0.12);
      const n = Math.round(p.base * wave * (1 + (p.trend * i) / period));
      users += n;
      previous += Math.round(n / (1 + p.trend));
      events += Math.round(n * (0.026 + j * 0.004));
      clicks += Math.round(n * 0.42);
      impressions += Math.round(n * 8.6);
      vercel += Math.round(n * 1.12);
    }
    return {
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      date: date.toISOString().slice(0, 10),
      users,
      previous,
      clicks,
      impressions,
      events,
      vercel,
    };
  });
}
export function summary(products: Product[], period: Period) {
  const days = series(products, period);
  const totals = days.reduce(
    (acc, d) => ({
      users: acc.users + d.users,
      previous: acc.previous + d.previous,
      clicks: acc.clicks + d.clicks,
      impressions: acc.impressions + d.impressions,
      events: acc.events + d.events,
      vercel: acc.vercel + d.vercel,
    }),
    { users: 0, previous: 0, clicks: 0, impressions: 0, events: 0, vercel: 0 },
  );
  return {
    ...totals,
    change: totals.previous ? (totals.users / totals.previous - 1) * 100 : 0,
    rate: totals.users ? (totals.events / totals.users) * 100 : 0,
  };
}
export const format = (n: number) => new Intl.NumberFormat("en-US").format(n);
export const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
