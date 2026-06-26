/**
 * Cross-tenant Liv learning (Bet 8) — policy gate only until k-anonymity cohort exists.
 * No tenant data crosses boundary without explicit owner opt-in.
 */
export type PeerLearningOptIn = {
  enabled: boolean;
  optedInAt?: string;
};

export type PeerBenchmarkDraft = {
  aggregateKey: string;
  vertical: string;
  region: string;
  contributingTenantCount: number;
  headline: string;
  body: string;
};

const MIN_COHORT = 10;

/** Returns null until platform has enough opted-in tenants — honest, not fake benchmarks. */
export function resolvePeerBenchmarkDraft(input: {
  optIn: PeerLearningOptIn;
  vertical: string;
  region: string;
  contributingTenantCount: number;
}): PeerBenchmarkDraft | null {
  if (!input.optIn.enabled) return null;
  if (input.contributingTenantCount < MIN_COHORT) return null;
  return {
    aggregateKey: `${input.vertical}:${input.region}`,
    vertical: input.vertical,
    region: input.region,
    contributingTenantCount: input.contributingTenantCount,
    headline: "Benchmarks unlock when your cohort is large enough",
    body: `Cross-tenant intelligence activates at ${MIN_COHORT}+ opted-in businesses in your vertical and region. Today: ${input.contributingTenantCount}.`,
  };
}

export const PEER_LEARNING_MIN_COHORT = MIN_COHORT;
