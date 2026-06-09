/**
 * Era 3 v0 — per-domain trajectory from Twin risks, opportunities, and health scores.
 */

import type { TwinObservationDomain } from "./twin-observations";

export type TwinDomainTrajectory = "strengthening" | "stable" | "weakening" | "unknown";

export type TwinDomainScoreInput = {
  domain: TwinObservationDomain;
  score: number;
};

export type TwinTrajectoryInput = {
  domains: TwinDomainScoreInput[];
  risks?: Array<{ domain: TwinObservationDomain }>;
  opportunities?: Array<{ domain: TwinObservationDomain }>;
};

const ALL_DOMAINS: TwinObservationDomain[] = [
  "operational",
  "revenue",
  "relationship",
  "trust",
  "growth",
  "capability",
];

/** Resolve trajectory label per Twin health domain. */
export function resolveTwinDomainTrajectory(
  domain: TwinObservationDomain,
  args: {
    score: number;
    riskCount: number;
    opportunityCount: number;
  },
): TwinDomainTrajectory {
  if (args.riskCount > 0 && args.opportunityCount > 0) {
    return args.score >= 60 ? "stable" : "weakening";
  }
  if (args.riskCount > 0 || args.score < 50) return "weakening";
  if (args.opportunityCount > 0 || args.score >= 78) return "strengthening";
  if (args.score >= 55) return "stable";
  return "unknown";
}

export function enrichTwinDomainsWithTrajectory(input: TwinTrajectoryInput): Array<
  TwinDomainScoreInput & { trajectory: TwinDomainTrajectory }
> {
  const riskByDomain = countByDomain(input.risks ?? []);
  const oppByDomain = countByDomain(input.opportunities ?? []);

  return input.domains.map((d) => ({
    ...d,
    trajectory: resolveTwinDomainTrajectory(d.domain, {
      score: d.score,
      riskCount: riskByDomain[d.domain] ?? 0,
      opportunityCount: oppByDomain[d.domain] ?? 0,
    }),
  }));
}

export const TWIN_TRAJECTORY_COPY: Record<TwinDomainTrajectory, string> = {
  strengthening: "Trending up",
  stable: "Holding steady",
  weakening: "Needs attention",
  unknown: "Still learning",
};

export function twinTrajectoryDomainsForCheck(): TwinObservationDomain[] {
  return ALL_DOMAINS;
}

function countByDomain(
  items: Array<{ domain: TwinObservationDomain }>,
): Partial<Record<TwinObservationDomain, number>> {
  const out: Partial<Record<TwinObservationDomain, number>> = {};
  for (const item of items) {
    out[item.domain] = (out[item.domain] ?? 0) + 1;
  }
  return out;
}
