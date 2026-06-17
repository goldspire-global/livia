/**
 * Commitment & policy evolution depth — owner API + bookings lens.
 *
 *   pnpm --filter @workspace/e2e exec playwright test --project=platform-commitment
 */
import { test, expect } from "@playwright/test";
import {
  apiBase,
  authedApiGet,
  demoCanSignIn,
  ensureDemoProvisioned,
  signInBusiness,
} from "../helpers/demo-auth";

const SLUG = process.env.E2E_DEMO_SLUG ?? "luxe-salon-spa";

async function demoBusinessId(request: import("@playwright/test").APIRequestContext) {
  const res = await request.post(`${apiBase}/api/demo/sign-in-business`, { data: { slug: SLUG } });
  if (!res.ok()) return null;
  const body = (await res.json()) as { businessId?: string };
  return body.businessId ?? null;
}

test.describe("Platform commitment depth", () => {
  test.describe.configure({ mode: "serial", timeout: 240_000 });

  test.beforeAll(async ({ request }) => {
    await ensureDemoProvisioned(request);
  });

  test("policy evolution exposes trusted tier on showcase slug", async ({ page, request }) => {
    if (!(await demoCanSignIn(request, SLUG))) {
      test.skip(true, "Demo sign-in unavailable");
    }
    await signInBusiness(page, SLUG);
    const businessId = await demoBusinessId(request);
    if (!businessId) {
      test.skip(true, "No demo business id");
    }

    const res = await authedApiGet(page, `/api/businesses/${businessId}/policy-evolution`);
    expect(res.ok(), await res.text()).toBeTruthy();
    const body = (await res.json()) as {
      proposals?: Array<{ id?: string }>;
      qualityRegistry?: unknown[];
    };
    expect(Array.isArray(body.proposals)).toBeTruthy();
    expect(
      body.proposals?.some((p) => p.id === "emergent_trust_tier"),
      "Demo showcase should surface trusted-client proposal",
    ).toBeTruthy();
    expect(Array.isArray(body.qualityRegistry)).toBeTruthy();
  });

  test("dashboard summary exposes operating pulse buckets", async ({ page, request }) => {
    if (!(await demoCanSignIn(request, SLUG))) {
      test.skip(true, "Demo sign-in unavailable");
    }
    await signInBusiness(page, SLUG);
    const businessId = await demoBusinessId(request);
    if (!businessId) {
      test.skip(true, "No demo business id");
    }

    const res = await authedApiGet(page, `/api/businesses/${businessId}/dashboard`);
    expect(res.ok(), await res.text()).toBeTruthy();
    const body = (await res.json()) as {
      operatingPulse?: {
        needsYou?: number;
        guestAction?: number;
        livHandling?: number;
      };
      pendingCount?: number;
    };
    expect(body.operatingPulse).toBeTruthy();
    expect(typeof body.operatingPulse?.needsYou).toBe("number");
    expect(typeof body.operatingPulse?.guestAction).toBe("number");
    expect(typeof body.pendingCount).toBe("number");
  });

  test("owner intelligence bundle includes pulse and proposals", async ({ page, request }) => {
    if (!(await demoCanSignIn(request, SLUG))) {
      test.skip(true, "Demo sign-in unavailable");
    }
    await signInBusiness(page, SLUG);
    const businessId = await demoBusinessId(request);
    if (!businessId) {
      test.skip(true, "No demo business id");
    }

    const res = await authedApiGet(page, `/api/businesses/${businessId}/owner-intelligence`);
    expect(res.ok(), await res.text()).toBeTruthy();
    const body = (await res.json()) as {
      policyEvolutionProposals?: unknown[];
      qualityRegistry?: unknown[];
      ops?: { pendingCount?: number };
    };
    expect(Array.isArray(body.policyEvolutionProposals)).toBeTruthy();
    expect((body.policyEvolutionProposals?.length ?? 0) > 0).toBeTruthy();
    expect(body.ops).toBeTruthy();
  });

  test("twin hub API — /me/twin and business scope parity", async ({ page, request }) => {
    if (!(await demoCanSignIn(request, SLUG))) {
      test.skip(true, "Demo sign-in unavailable");
    }
    await signInBusiness(page, SLUG);
    const businessId = await demoBusinessId(request);
    if (!businessId) {
      test.skip(true, "No demo business id");
    }

    const meSummary = await authedApiGet(page, `/api/me/twin/summary?businessId=${businessId}`);
    expect(meSummary.ok(), await meSummary.text()).toBeTruthy();
    const summary = (await meSummary.json()) as {
      businessId?: string;
      headline?: string;
      subline?: string;
      facts?: unknown[];
    };
    expect(summary.businessId).toBe(businessId);
    expect(typeof summary.headline).toBe("string");
    expect(typeof summary.subline).toBe("string");
    expect(Array.isArray(summary.facts)).toBeTruthy();

    const bizSummary = await authedApiGet(page, `/api/businesses/${businessId}/twin/summary`);
    expect(bizSummary.ok(), await bizSummary.text()).toBeTruthy();
    const bizBody = (await bizSummary.json()) as { headline?: string };
    expect(bizBody.headline).toBe(summary.headline);

    const health = await authedApiGet(page, `/api/me/twin/health?businessId=${businessId}`);
    expect(health.ok(), await health.text()).toBeTruthy();
    const healthBody = (await health.json()) as {
      overallScore?: number;
      domains?: unknown[];
    };
    expect(typeof healthBody.overallScore).toBe("number");
    expect(Array.isArray(healthBody.domains)).toBeTruthy();

    const recs = await authedApiGet(page, `/api/me/twin/recommendations?businessId=${businessId}`);
    expect(recs.ok(), await recs.text()).toBeTruthy();
    const recsBody = (await recs.json()) as { recommendations?: unknown[] };
    expect(Array.isArray(recsBody.recommendations)).toBeTruthy();

    const obs = await authedApiGet(page, `/api/me/twin/observations?businessId=${businessId}`);
    expect(obs.ok(), await obs.text()).toBeTruthy();
    const obsBody = (await obs.json()) as { observations?: unknown[] };
    expect(Array.isArray(obsBody.observations)).toBeTruthy();

    const caps = await authedApiGet(page, `/api/me/capabilities?businessId=${businessId}`);
    expect(caps.ok(), await caps.text()).toBeTruthy();
    const capsBody = (await caps.json()) as {
      platformCapabilities?: unknown[];
      capabilityHealth?: { score?: number };
    };
    expect(Array.isArray(capsBody.platformCapabilities)).toBeTruthy();
    expect(typeof capsBody.capabilityHealth?.score).toBe("number");

    const topRec = recsBody.recommendations?.[0] as {
      evidence?: unknown[];
      confidence?: string;
      expectedOutcome?: string;
    } | undefined;
    if (topRec) {
      expect(Array.isArray(topRec.evidence)).toBeTruthy();
      expect(["high", "medium", "low"]).toContain(topRec.confidence);
      expect(typeof topRec.expectedOutcome).toBe("string");
    }
  });

  test("bookings pending lens tabs render for owner", async ({ page, request }) => {
    if (!(await demoCanSignIn(request, SLUG))) {
      test.skip(true, "Demo sign-in unavailable");
    }
    await signInBusiness(page, SLUG);
    const res = await page.goto("/bookings?status=pending", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).not.toContainText(/sign in to your command center/i);
    await expect(page.getByRole("button", { name: /needs you/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /guest completing/i })).toBeVisible();
  });
});
