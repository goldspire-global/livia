#!/usr/bin/env node
/**
 * Production readiness scorecard — rubric-driven, policy-backed figures.
 *
 *   pnpm readiness:score
 *   node scripts/production-readiness-score.mjs --run-gates
 *   node scripts/production-readiness-score.mjs --live-staging
 *   LIVIA_FOUNDER_UAT_SIGNED=1 node scripts/production-readiness-score.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Ensure policy dist is built before importing rubric
const policyBuild = spawnSync("pnpm", ["run", "typecheck:libs"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (policyBuild.status !== 0) process.exit(policyBuild.status ?? 1);

const {
  buildReadinessScorecard,
  formatReadinessScorecardSummary,
  headlineReadinessScores,
  v1HeadlineReadinessScores,
  PRODUCTION_READINESS_CRITERIA,
  PRODUCTION_READINESS_SCORECARD_VERSION,
} = await import("../lib/policy/dist/production-readiness-program.js");
const runGates = process.argv.includes("--run-gates");
const liveStaging = process.argv.includes("--live-staging");
const founderSigned = process.env.LIVIA_FOUNDER_UAT_SIGNED === "1";

function read(rel) {
  const path = resolve(root, rel);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function hasAll(rel, needles) {
  const text = read(rel);
  return needles.every((n) => text.includes(n));
}

function runGate(label, cmd, args) {
  console.log(`  ▶ ${label}`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  return r.status === 0;
}

/** @type {Set<string>} */
const met = new Set();

// ── Static repo evidence ──────────────────────────────────────────────
if (
  hasAll("artifacts/livia-dashboard/src/App.tsx", ["/my/account", "MyLiviaAccountPage"]) &&
  hasAll("artifacts/livia-dashboard/src/pages/my-livia-visit.tsx", ['href="/my"'])
) {
  met.add("guest_hub_cohesive");
}
if (
  hasAll("artifacts/livia-dashboard/src/pages/my-livia-visit.tsx", ['href="/my"']) &&
  hasAll("lib/policy/src/booking-experience-copy.ts", ["formatBookingStatusLabel", "bookingConfirmBlockedByDeposit"]) &&
  hasAll("artifacts/api-server/src/lib/domain-errors.ts", ["DEPOSIT_REQUIRED"])
) {
  met.add("booking_deposit_human_copy");
  met.add("guest_hub_ux_hardening");
}
if (
  hasAll("lib/policy/src/guest-care-automation.ts", ["resolveEffectiveGuestCareAutomation"]) &&
  hasAll("artifacts/api-server/src/services/guest-care-aftercare.service.ts", [
    "resolveEffectiveGuestCareAutomation",
  ])
) {
  met.add("guest_care_policy_cascade");
}
if (hasAll("lib/policy/src/guest-care-automation.ts", ["resolveEffectiveRetailGates"])) {
  met.add("tenant_retail_gates");
}
if (existsSync("docs/design/GUEST-SURFACE-PLACEMENT-CONTRACT.md")) {
  met.add("guest_placement_p0");
}
if (
  hasAll("lib/policy/src/demo-showcase-program.ts", ["listDemoShowcaseBusinessSpecs"]) &&
  read("lib/policy/src/__tests__/demo-showcase-program.test.ts").includes("specs.length >= 12")
) {
  met.add("demo_showcase_depth");
}
if (
  existsSync("lib/policy/src/activation-metrics.ts") &&
  existsSync("artifacts/livia-dashboard/src/pages/lifecycle.tsx")
) {
  met.add("activation_metrics_wired");
}
if (existsSync("e2e/tests/founder-uat-p0.spec.ts")) {
  met.add("founder_uat_e2e");
}
if (hasAll("lib/policy/src/onboarding-program.ts", ["BLOCKING_ONBOARDING_ACTS", "OnboardingActId"])) {
  met.add("onboarding_blocking_gates");
}
if (
  existsSync("docs/operations/FOUNDER-UAT-CHECKLIST.md") &&
  existsSync("scripts/founder-uat-preflight.mjs")
) {
  met.add("uat_doc_and_preflight");
}
if (existsSync("e2e/tests/screen-card-p0-pixel.spec.ts")) {
  met.add("screen_card_pixel_gate");
}
if (read("scripts/staging-readiness.mjs").includes("Dashboard bundle uses staging API")) {
  met.add("staging_bundle_leak_check");
}
if (existsSync("lib/policy/src/tenant-surface-density.ts")) {
  met.add("bucket_b_density");
}
if (read("docs/product/GTM-VERTICAL-DEPTH-PROGRAM.md").includes("nine")) {
  met.add("gtm_wave1_vertical_parity");
}
if (
  read("scripts/staging-readiness.mjs").includes("PLAN_CATALOGUE") ||
  read("scripts/staging-readiness.mjs").includes("loadPlanCataloguePricingSnapshot")
) {
  met.add("plan_catalogue_marketing");
}
if (
  existsSync("artifacts/api-server/src/routes/bookings.ts") &&
  existsSync("artifacts/api-server/src/routes/conversations.ts") &&
  existsSync("artifacts/api-server/src/routes/payments.ts")
) {
  met.add("core_loops_api");
}
if (hasAll("artifacts/api-server/src/lib/booking-deposit-gate.ts", ["DEPOSIT_REQUIRED"])) {
  met.add("stripe_deposits_staging");
}

// ── Optional gates ────────────────────────────────────────────────────
if (runGates) {
  if (runGate("vertical:check", "node", ["scripts/vertical-check.mjs"])) {
    met.add("vertical_registry_gate");
  }
  if (
    runGate("typecheck", "pnpm", ["run", "typecheck"]) &&
    runGate("API tests", "pnpm", ["--filter", "@workspace/api-server", "run", "test"])
  ) {
    met.add("repo_production_gate");
  }
} else {
  console.log("  (skip gates — pass --run-gates for vertical:check + typecheck + API tests)");
}

if (liveStaging) {
  if (runGate("staging:readiness --strict", "node", ["scripts/staging-readiness.mjs", "--strict"])) {
    met.add("staging_readiness_strict");
  }
} else {
  console.log("  (skip live staging — pass --live-staging for strict HTTP checks)");
}

if (founderSigned) {
  met.add("founder_walkthrough_signed");
}

// ── Scorecard ─────────────────────────────────────────────────────────
const card = buildReadinessScorecard(met);
const headlines = headlineReadinessScores(card);
const v1 = v1HeadlineReadinessScores(card);

console.log(`\n══ Livia production readiness scorecard (${PRODUCTION_READINESS_SCORECARD_VERSION}) ══\n`);
console.log(formatReadinessScorecardSummary(card));

console.log("\n── Dimension detail ──\n");
for (const d of card.dimensions) {
  console.log(`${d.label}: ${d.score}/${d.max}`);
  if (d.met.length) console.log(`  met: ${d.met.join(", ")}`);
  if (d.pending.length) console.log(`  pending: ${d.pending.join(", ")}`);
  if (d.blockers.length) console.log(`  blockers: ${d.blockers.join(", ")}`);
}

console.log("\n── Engineering rubric (raw) ──\n");
console.log(`Product completeness:     ${headlines.product_completeness}/10`);
console.log(`Activation readiness:     ${headlines.activation_readiness}/10`);
console.log(`Commercial readiness:     ${headlines.commercial_readiness}/10`);
console.log(`Market readiness:         ${headlines.market_readiness}/10`);
console.log(`Founder acceptance:       ${headlines.founder_acceptance_pct}% (Bucket C)`);

console.log("\n── V1 headline lens (gap matrix) ──\n");
console.log(`Product completeness:     ${v1.product_completeness}/10`);
console.log(`Activation readiness:     ${v1.activation_readiness}/10`);
console.log(`Commercial readiness:     ${v1.commercial_readiness}/10`);
console.log(`Market readiness:         ${v1.market_readiness}/10`);
console.log(`Founder acceptance:       ${v1.founder_acceptance_pct}% (Bucket C)`);

const unknown = PRODUCTION_READINESS_CRITERIA.filter(
  (c) => c.points > 0 && !c.manual && !met.has(c.id),
);
if (unknown.length) {
  console.log("\n── Run with gates for full evidence ──\n");
  console.log(`  pnpm readiness:score -- --run-gates --live-staging`);
}

console.log("");
