/**
 * The Vercel projects ProductPulse reads Web Analytics for.
 * `vercelProjectId` is the Vercel project id (prj_...), shown in Project Settings -> General.
 * To add a product, add a row here — no other server change is needed.
 */
export interface LiveProject {
  id: string;
  vercelProjectId: string;
  name: string;
  domain: string;
  color: string;
  initials: string;
}

export const liveProjects: LiveProject[] = [
  {
    id: "slotrecover",
    vercelProjectId: "prj_ml5JLNkJUaYUW6SfpJR46pGhGZaT",
    name: "SlotRecover",
    domain: "slotrecover.pro",
    color: "#7567df",
    initials: "S",
  },
  {
    id: "paidtwice",
    vercelProjectId: "prj_5IW6ayydfO8bOKm6niEGXD94QCK5",
    name: "PaidTwice",
    domain: "paidtwice.kriosity.in",
    color: "#3c91b9",
    initials: "P",
  },
  {
    id: "kriosity",
    vercelProjectId: "prj_qbW7te9TG57u9xdzCia0XFCqtb8a",
    name: "Kriosity",
    domain: "kriosity.in",
    color: "#4d9478",
    initials: "K",
  },
  {
    id: "beamdrop",
    vercelProjectId: "prj_cnfz8v98npPOE6sFwXsez6UaTE7N",
    name: "BeamDrop",
    domain: "beamdrop.kriosity.in",
    color: "#c38a55",
    initials: "B",
  },
  {
    id: "productpulse",
    vercelProjectId: "prj_TWu2tkUbO7kkwzQEBllM5vg9p8u4",
    name: "ProductPulse",
    domain: "product-pulse-dun.vercel.app",
    color: "#7687a5",
    initials: "P",
  },
  {
    id: "aegistra",
    vercelProjectId: "prj_puKulAidD3JEiMU0KTgzqpqJJLfZ",
    name: "Aegistra",
    domain: "aegistra.kriosity.in",
    color: "#b0607a",
    initials: "A",
  },
];

export const allowedPeriods = [7, 28, 90] as const;
export type LivePeriod = (typeof allowedPeriods)[number];

export class ConfigError extends Error {
  constructor(public readonly variable: string) {
    super(`Server is not configured: ${variable} is missing.`);
  }
}

export function requireEnv(name: string): string {
  // Trim: a stray space or newline pasted into a dashboard field breaks requests.
  const value = process.env[name]?.trim();
  if (!value) throw new ConfigError(name);
  return value;
}
