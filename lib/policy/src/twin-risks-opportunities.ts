/**
 * Twin insight promotion + Era 3 risk/opportunity seed from observations.
 */

import type { TwinObservationDraft, TwinObservationDomain } from "./twin-observations";

export type TwinRiskOrOpportunity = {
  id: string;
  kind: "risk" | "opportunity";
  domain: TwinObservationDomain;
  title: string;
  body: string;
  href?: string;
  confidence: "high" | "medium" | "low";
};

const RISK_KEYS = new Set([
  "operational:pending-backlog",
  "operational:inbox-handoffs",
  "revenue:low-capture-rate",
  "capability:setup-blockers",
  "capability:low-health-score",
  "relationship:at-risk-guests",
  "trust:low-visit-scores",
  "growth:activation-pending",
]);

const OPPORTUNITY_KEYS = new Set(["trust:strong-reputation"]);

/** High-confidence operational/revenue observations become Twin insights (Layer 5). */
export function shouldPromoteTwinInsight(draft: TwinObservationDraft): boolean {
  return (
    draft.confidence === "high" &&
    (draft.domain === "revenue" ||
      draft.domain === "operational" ||
      draft.domain === "growth" ||
      draft.domain === "capability")
  );
}

export function resolveTwinRisksAndOpportunities(
  items: Array<{
    observationKey: string;
    domain: TwinObservationDomain;
    title: string;
    body: string;
    href?: string | null;
    confidence: "high" | "medium" | "low";
  }>,
): { risks: TwinRiskOrOpportunity[]; opportunities: TwinRiskOrOpportunity[] } {
  const risks: TwinRiskOrOpportunity[] = [];
  const opportunities: TwinRiskOrOpportunity[] = [];

  for (const item of items) {
    const base = {
      domain: item.domain,
      title: item.title,
      body: item.body,
      href: item.href ?? undefined,
      confidence: item.confidence,
    };
    if (RISK_KEYS.has(item.observationKey) || item.observationKey.startsWith("revenue:commerce-")) {
      risks.push({
        id: `risk:${item.observationKey}`,
        kind: "risk",
        ...base,
      });
    }
    if (OPPORTUNITY_KEYS.has(item.observationKey)) {
      opportunities.push({
        id: `opp:${item.observationKey}`,
        kind: "opportunity",
        ...base,
      });
    }
  }

  return { risks, opportunities };
}
