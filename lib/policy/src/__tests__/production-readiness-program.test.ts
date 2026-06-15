import assert from "node:assert/strict";
import {
  PRODUCTION_READINESS_CRITERIA,
  buildReadinessScorecard,
  headlineReadinessScores,
  scoreReadinessDimension,
  v1HeadlineReadinessScores,
  type ProductionReadinessCriterionId,
  type ProductionReadinessDimensionId,
} from "../production-readiness-program";

const DIMENSIONS: ProductionReadinessDimensionId[] = [
  "product_completeness",
  "activation_readiness",
  "commercial_readiness",
  "market_readiness",
  "founder_acceptance",
];

for (const dimension of DIMENSIONS) {
  const total = PRODUCTION_READINESS_CRITERIA.filter(
    (c) => c.dimension === dimension,
  ).reduce((sum, c) => sum + c.points, 0);
  assert.equal(total, 10, `${dimension} criteria must sum to 10`);
}

/** Representative June 2026 staging snapshot (static + gates, no founder sign-off). */
const stagingSnapshot = new Set([
  "vertical_registry_gate",
  "repo_production_gate",
  "guest_hub_cohesive",
  "booking_deposit_human_copy",
  "guest_care_policy_cascade",
  "tenant_retail_gates",
  "staging_readiness_strict",
  "guest_placement_p0",
  "core_loops_api",
  "demo_showcase_depth",
  "activation_metrics_wired",
  "founder_uat_e2e",
  "onboarding_blocking_gates",
  "stripe_deposits_staging",
  "plan_catalogue_marketing",
  "gtm_wave1_vertical_parity",
  "uat_doc_and_preflight",
  "screen_card_pixel_gate",
  "staging_bundle_leak_check",
  "bucket_b_density",
  "guest_hub_ux_hardening",
] as ProductionReadinessCriterionId[]);

const card = buildReadinessScorecard(stagingSnapshot);
assert.equal(card.customerGoLiveBlocked, true);
assert.equal(card.stagingUatGo, true);

assert.equal(scoreReadinessDimension("product_completeness", stagingSnapshot).score, 9);
assert.equal(scoreReadinessDimension("activation_readiness", stagingSnapshot).score, 7);
assert.equal(scoreReadinessDimension("commercial_readiness", stagingSnapshot).score, 5);
assert.equal(scoreReadinessDimension("market_readiness", stagingSnapshot).score, 2);
assert.equal(scoreReadinessDimension("founder_acceptance", stagingSnapshot).score, 8);

const headlines = headlineReadinessScores(card);
assert.equal(headlines.product_completeness, 9);
assert.equal(headlines.activation_readiness, 7);
assert.equal(headlines.commercial_readiness, 5);
assert.equal(headlines.market_readiness, 2);
assert.equal(headlines.founder_acceptance_pct, 80);

const v1 = v1HeadlineReadinessScores(card);
assert.equal(v1.product_completeness, 5);
assert.equal(v1.activation_readiness, 4);
assert.equal(v1.commercial_readiness, 3.5);
assert.equal(v1.market_readiness, 2);
assert.equal(v1.founder_acceptance_pct, 80);

console.log("production-readiness-program.test.ts OK");
