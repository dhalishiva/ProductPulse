/**
 * The Vercel projects ProductPulse reads Web Analytics for.
 * `vercelProject` is the Vercel project name (the API accepts a name or a prj_ id).
 * To add a product, add a row here — no other server change is needed.
 */
export interface LiveProject {
  id: string;
  vercelProject: string;
  name: string;
  domain: string;
  color: string;
  initials: string;
}

export const liveProjects: LiveProject[] = [
  {
    id: "slotrecover",
    vercelProject: "slotrecover",
    name: "SlotRecover",
    domain: "slotrecover.pro",
    color: "#7567df",
    initials: "S",
  },
  {
    id: "paidtwice",
    vercelProject: "paidtwice",
    name: "PaidTwice",
    domain: "paidtwice.kriosity.in",
    color: "#3c91b9",
    initials: "P",
  },
  {
    id: "kriosity",
    vercelProject: "kriosity",
    name: "Kriosity",
    domain: "kriosity.in",
    color: "#4d9478",
    initials: "K",
  },
  {
    id: "beamdrop",
    vercelProject: "beamdrop",
    name: "BeamDrop",
    domain: "beamdrop.kriosity.in",
    color: "#c38a55",
    initials: "B",
  },
  {
    id: "productpulse",
    vercelProject: "product-pulse",
    name: "ProductPulse",
    domain: "product-pulse-dun.vercel.app",
    color: "#7687a5",
    initials: "P",
  },
  {
    id: "aegistra",
    vercelProject: "aegistra",
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
  const value = process.env[name];
  if (!value) throw new ConfigError(name);
  return value;
}
