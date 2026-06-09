import type { CommerceSignal } from "./commerce-signals";
import type { CapabilityHealthScore } from "./capability-health-score";

export type MorningBriefingIntel = {
  commerceSignals: Array<Pick<CommerceSignal, "id" | "title" | "severity" | "body">>;
  capabilityHealth?: CapabilityHealthScore;
  twinHeadline?: string | null;
  twinSubline?: string | null;
  twinRisks?: Array<{ title: string; body: string }>;
  twinOpportunities?: Array<{ title: string; body: string }>;
  twinObservations?: Array<{ title: string; body: string; domain?: string }>;
};

/** Deterministic briefing bullets from commerce + capability + Twin (before Liv narrative). */
export function buildMorningBriefingIntelHighlights(intel: MorningBriefingIntel): string[] {
  const out: string[] = [];
  for (const s of intel.commerceSignals.filter((x) => x.severity === "act").slice(0, 2)) {
    out.push(s.title + (s.body ? ` — ${s.body}` : ""));
  }
  for (const risk of intel.twinRisks?.slice(0, 1) ?? []) {
    out.push(`Risk: ${risk.title}${risk.body ? ` — ${risk.body}` : ""}`);
  }
  for (const opp of intel.twinOpportunities?.slice(0, 1) ?? []) {
    out.push(`Opportunity: ${opp.title}${opp.body ? ` — ${opp.body}` : ""}`);
  }
  if (intel.capabilityHealth && intel.capabilityHealth.score < 70) {
    out.push(`Capability health ${intel.capabilityHealth.score}% (${intel.capabilityHealth.grade}) — ${intel.capabilityHealth.headline}`);
  }
  const topObs = intel.twinObservations?.[0];
  if (topObs && out.length < 3) {
    out.push(
      topObs.domain
        ? `${topObs.domain}: ${topObs.title}`
        : topObs.title + (topObs.body ? ` — ${topObs.body}` : ""),
    );
  }
  if (out.length === 0 && intel.twinHeadline?.trim()) {
    out.push(
      intel.twinSubline?.trim()
        ? `${intel.twinHeadline.trim()} — ${intel.twinSubline.trim()}`
        : intel.twinHeadline.trim(),
    );
  }
  return out.slice(0, 4);
}
