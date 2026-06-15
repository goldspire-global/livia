/**
 * Production readiness rubric — policy hub authority for dimension scores.
 * Automated checks: `pnpm readiness:score` (scripts/production-readiness-score.mjs).
 */

export const PRODUCTION_READINESS_SCORECARD_VERSION = "2026-06-15" as const;

export type ProductionReadinessDimensionId =
  | "product_completeness"
  | "activation_readiness"
  | "commercial_readiness"
  | "market_readiness"
  | "founder_acceptance";

export type ProductionReadinessCriterionId =
  | "vertical_registry_gate"
  | "repo_production_gate"
  | "guest_hub_cohesive"
  | "booking_deposit_human_copy"
  | "guest_care_policy_cascade"
  | "tenant_retail_gates"
  | "staging_readiness_strict"
  | "guest_placement_p0"
  | "core_loops_api"
  | "mutation_paths_complete"
  | "demo_showcase_depth"
  | "activation_metrics_wired"
  | "founder_uat_e2e"
  | "onboarding_blocking_gates"
  | "first_booking_funnel_dashboard"
  | "gate2_field_evidence"
  | "stripe_deposits_staging"
  | "plan_catalogue_marketing"
  | "prod_monetization_path"
  | "gtm_wave1_vertical_parity"
  | "dublin_design_partners"
  | "retention_mrr_proof"
  | "uat_doc_and_preflight"
  | "screen_card_pixel_gate"
  | "staging_bundle_leak_check"
  | "bucket_b_density"
  | "guest_hub_ux_hardening"
  | "founder_walkthrough_signed";

export type ProductionReadinessCriterion = {
  id: ProductionReadinessCriterionId;
  dimension: ProductionReadinessDimensionId;
  label: string;
  /** Points toward 10 when met. Each dimension's criteria sum to 10. */
  points: number;
  /** Human-only — never auto-marked met by scripts. */
  manual?: boolean;
  /** Blocks customer go-live even if engineering gates pass. */
  blocksCustomerGoLive?: boolean;
};

export const PRODUCTION_READINESS_DIMENSION_LABELS: Record<
  ProductionReadinessDimensionId,
  string
> = {
  product_completeness: "Product completeness",
  activation_readiness: "Activation readiness",
  commercial_readiness: "Commercial readiness",
  market_readiness: "Market readiness",
  founder_acceptance: "Founder acceptance (Bucket C)",
};

/** Rubric criteria — weights sum to 10 per dimension. */
export const PRODUCTION_READINESS_CRITERIA: ProductionReadinessCriterion[] = [
  // product_completeness (10) — engineering shippability, not field proof
  {
    id: "vertical_registry_gate",
    dimension: "product_completeness",
    label: "vertical:check passes (9 verticals, cascade)",
    points: 1,
  },
  {
    id: "repo_production_gate",
    dimension: "product_completeness",
    label: "Repo production gate (typecheck + API tests)",
    points: 1,
  },
  {
    id: "guest_hub_cohesive",
    dimension: "product_completeness",
    label: "Guest hub cohesive (/my, /my/account, visit nav)",
    points: 1,
  },
  {
    id: "booking_deposit_human_copy",
    dimension: "product_completeness",
    label: "Human booking status + deposit confirm gate",
    points: 1,
  },
  {
    id: "guest_care_policy_cascade",
    dimension: "product_completeness",
    label: "Guest-care effective automation (policy → API)",
    points: 1,
  },
  {
    id: "tenant_retail_gates",
    dimension: "product_completeness",
    label: "Tenant retail effective gates (policy hub)",
    points: 1,
  },
  {
    id: "staging_readiness_strict",
    dimension: "product_completeness",
    label: "Staging readiness strict (API + marketing bundles)",
    points: 1,
  },
  {
    id: "guest_placement_p0",
    dimension: "product_completeness",
    label: "Guest placement P0b–P0e shipped",
    points: 1,
  },
  {
    id: "core_loops_api",
    dimension: "product_completeness",
    label: "Core loops API (bookings, inbox, payments routes)",
    points: 1,
  },
  {
    id: "mutation_paths_complete",
    dimension: "product_completeness",
    label: "All mutation paths publish events + notify",
    points: 1,
    blocksCustomerGoLive: true,
  },

  // activation_readiness (10)
  {
    id: "demo_showcase_depth",
    dimension: "activation_readiness",
    label: "Demo showcase depth (12+ slugs, subvertical profiles)",
    points: 1.5,
  },
  {
    id: "activation_metrics_wired",
    dimension: "activation_readiness",
    label: "Activation metrics + milestone surfaces",
    points: 1,
  },
  {
    id: "founder_uat_e2e",
    dimension: "activation_readiness",
    label: "Founder UAT E2E (medspa + luxe, axe)",
    points: 1.5,
  },
  {
    id: "onboarding_blocking_gates",
    dimension: "activation_readiness",
    label: "Onboarding blocking gates (policy acts)",
    points: 1,
  },
  {
    id: "staging_readiness_strict",
    dimension: "activation_readiness",
    label: "Staging demo portal + health checks",
    points: 1,
  },
  {
    id: "vertical_registry_gate",
    dimension: "activation_readiness",
    label: "Nine vertical packs + vertical:check",
    points: 1,
  },
  {
    id: "first_booking_funnel_dashboard",
    dimension: "activation_readiness",
    label: "First-booking funnel dashboard (time-to-activate)",
    points: 1.5,
    blocksCustomerGoLive: true,
  },
  {
    id: "gate2_field_evidence",
    dimension: "activation_readiness",
    label: "Gate 2 field evidence (10 Dublin design partners)",
    points: 1.5,
    manual: true,
    blocksCustomerGoLive: true,
  },

  // commercial_readiness (10)
  {
    id: "stripe_deposits_staging",
    dimension: "commercial_readiness",
    label: "Stripe deposits + ledger on staging",
    points: 2,
  },
  {
    id: "plan_catalogue_marketing",
    dimension: "commercial_readiness",
    label: "PLAN_CATALOGUE on marketing SPA",
    points: 1.5,
  },
  {
    id: "prod_monetization_path",
    dimension: "commercial_readiness",
    label: "Prod Stripe subscription + entitlement path",
    points: 4,
    blocksCustomerGoLive: true,
  },
  {
    id: "repo_production_gate",
    dimension: "commercial_readiness",
    label: "Commerce API tests in production gate",
    points: 1.5,
  },
  {
    id: "retention_mrr_proof",
    dimension: "commercial_readiness",
    label: "Paid MRR evidence on prod",
    points: 1,
    manual: true,
    blocksCustomerGoLive: true,
  },

  // market_readiness (10)
  {
    id: "gtm_wave1_vertical_parity",
    dimension: "market_readiness",
    label: "GTM Wave 1 — nine verticals at one parity bar",
    points: 2,
  },
  {
    id: "dublin_design_partners",
    dimension: "market_readiness",
    label: "10 Dublin design partners activated",
    points: 4,
    manual: true,
    blocksCustomerGoLive: true,
  },
  {
    id: "retention_mrr_proof",
    dimension: "market_readiness",
    label: "Retention + MRR proof (V1 exit metrics)",
    points: 4,
    manual: true,
    blocksCustomerGoLive: true,
  },

  // founder_acceptance (10) — Bucket C
  {
    id: "uat_doc_and_preflight",
    dimension: "founder_acceptance",
    label: "Founder UAT doc + preflight script",
    points: 1,
  },
  {
    id: "founder_uat_e2e",
    dimension: "founder_acceptance",
    label: "Founder UAT E2E automated",
    points: 1.5,
  },
  {
    id: "screen_card_pixel_gate",
    dimension: "founder_acceptance",
    label: "Screen-card P0 pixel diff gate",
    points: 1,
  },
  {
    id: "staging_bundle_leak_check",
    dimension: "founder_acceptance",
    label: "Staging dashboard bundle API leak check",
    points: 1,
  },
  {
    id: "bucket_b_density",
    dimension: "founder_acceptance",
    label: "Bucket B surface density complete",
    points: 1,
  },
  {
    id: "guest_hub_ux_hardening",
    dimension: "founder_acceptance",
    label: "Guest hub UX hardening (account, visit, deposit, Liv moments)",
    points: 1,
  },
  {
    id: "staging_readiness_strict",
    dimension: "founder_acceptance",
    label: "Staging readiness strict pass",
    points: 1.5,
  },
  {
    id: "founder_walkthrough_signed",
    dimension: "founder_acceptance",
    label: "Founder staging walkthrough signed",
    points: 2,
    manual: true,
    blocksCustomerGoLive: true,
  },
];

export type ReadinessDimensionScore = {
  dimension: ProductionReadinessDimensionId;
  label: string;
  score: number;
  max: number;
  met: ProductionReadinessCriterionId[];
  pending: ProductionReadinessCriterionId[];
  blockers: ProductionReadinessCriterionId[];
};

export type ReadinessScorecard = {
  version: typeof PRODUCTION_READINESS_SCORECARD_VERSION;
  dimensions: ReadinessDimensionScore[];
  customerGoLiveBlocked: boolean;
  stagingUatGo: boolean;
};

function criteriaForDimension(
  dimension: ProductionReadinessDimensionId,
): ProductionReadinessCriterion[] {
  return PRODUCTION_READINESS_CRITERIA.filter((c) => c.dimension === dimension);
}

/** Score one dimension from met criterion ids (0–10 scale). */
export function scoreReadinessDimension(
  dimension: ProductionReadinessDimensionId,
  metIds: ReadonlySet<ProductionReadinessCriterionId>,
): ReadinessDimensionScore {
  const criteria = criteriaForDimension(dimension);
  const max = criteria.reduce((sum, c) => sum + c.points, 0);
  let score = 0;
  const met: ProductionReadinessCriterionId[] = [];
  const pending: ProductionReadinessCriterionId[] = [];
  const blockers: ProductionReadinessCriterionId[] = [];

  for (const c of criteria) {
    if (metIds.has(c.id)) {
      score += c.points;
      met.push(c.id);
    } else {
      pending.push(c.id);
      if (c.blocksCustomerGoLive) blockers.push(c.id);
    }
  }

  return {
    dimension,
    label: PRODUCTION_READINESS_DIMENSION_LABELS[dimension],
    score: Math.round(score * 10) / 10,
    max,
    met,
    pending,
    blockers,
  };
}

const DIMENSION_ORDER: ProductionReadinessDimensionId[] = [
  "product_completeness",
  "activation_readiness",
  "commercial_readiness",
  "market_readiness",
  "founder_acceptance",
];

/** Build full scorecard from met criterion ids. */
export function buildReadinessScorecard(
  metIds: ReadonlySet<ProductionReadinessCriterionId>,
): ReadinessScorecard {
  const dimensions = DIMENSION_ORDER.map((d) => scoreReadinessDimension(d, metIds));
  const customerGoLiveBlocked = dimensions.some((d) => d.blockers.length > 0);
  const founder = dimensions.find((d) => d.dimension === "founder_acceptance");
  const stagingUatGo =
    founder !== undefined &&
    founder.blockers.every((b) => b === "founder_walkthrough_signed");

  return {
    version: PRODUCTION_READINESS_SCORECARD_VERSION,
    dimensions,
    customerGoLiveBlocked,
    stagingUatGo,
  };
}

/** One-line summary for docs and CLI. */
export function formatReadinessScorecardSummary(card: ReadinessScorecard): string {
  const lines = card.dimensions.map(
    (d) => `${d.label}: ${d.score}/${d.max}`,
  );
  lines.push(
    card.stagingUatGo
      ? "Staging UAT: GO (founder sign-off pending)"
      : "Staging UAT: NO-GO",
  );
  lines.push(
    card.customerGoLiveBlocked
      ? "Customer go-live: NO-GO (blockers remain)"
      : "Customer go-live: GO",
  );
  return lines.join("\n");
}

/** Canonical headline scores for gap matrix (rounded to one decimal). */
export function headlineReadinessScores(
  card: ReadinessScorecard,
): Record<
  Exclude<ProductionReadinessDimensionId, "founder_acceptance">,
  number
> & { founder_acceptance_pct: number } {
  const byId = Object.fromEntries(
    card.dimensions.map((d) => [d.dimension, d]),
  ) as Record<ProductionReadinessDimensionId, ReadinessDimensionScore>;

  return {
    product_completeness: byId.product_completeness.score,
    activation_readiness: byId.activation_readiness.score,
    commercial_readiness: byId.commercial_readiness.score,
    market_readiness: byId.market_readiness.score,
    founder_acceptance_pct: Math.round(
      (byId.founder_acceptance.score / byId.founder_acceptance.max) * 100,
    ),
  };
}

/**
 * V1 proof lens for gap matrix — caps engineering-heavy rubric scores until
 * known V1 blockers (mutation coverage, funnel dashboard, prod billing) clear.
 */
export function v1HeadlineReadinessScores(
  card: ReadinessScorecard,
): ReturnType<typeof headlineReadinessScores> {
  const raw = headlineReadinessScores(card);
  const product = card.dimensions.find((d) => d.dimension === "product_completeness");
  const activation = card.dimensions.find((d) => d.dimension === "activation_readiness");
  const commercial = card.dimensions.find((d) => d.dimension === "commercial_readiness");

  return {
    product_completeness:
      product?.met.includes("mutation_paths_complete") === true
        ? raw.product_completeness
        : Math.min(raw.product_completeness, 5),
    activation_readiness:
      activation?.met.includes("first_booking_funnel_dashboard") === true &&
      activation?.met.includes("gate2_field_evidence") === true
        ? raw.activation_readiness
        : Math.min(raw.activation_readiness, 4),
    commercial_readiness:
      commercial?.met.includes("prod_monetization_path") === true &&
      commercial?.met.includes("retention_mrr_proof") === true
        ? raw.commercial_readiness
        : Math.min(raw.commercial_readiness, 3.5),
    market_readiness: raw.market_readiness,
    founder_acceptance_pct: raw.founder_acceptance_pct,
  };
}
