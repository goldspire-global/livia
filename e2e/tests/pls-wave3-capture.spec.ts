/**
 * PLS Wave 3 — gateway G1–G3, chain edge cases, session expiry, marketing handoff.
 *
 *   pnpm pls:wave3
 */
import { test, expect } from "@playwright/test";
import { PlsCaptureRun, mergeManifest, plsOutRoot, slugifyRoute } from "../helpers/pls-capture";
import {
  ensureDemoProvisioned,
  resetDemoBrowserSession,
  signInBusiness,
  signInDemoPersona,
  demoCanSignIn,
  demoHasBusiness,
} from "../helpers/demo-auth";

const marketingBase = process.env.E2E_MARKETING_BASE ?? "http://127.0.0.1:5174";
const { date: runDate, dir: OUT_ROOT } = plsOutRoot(3);
let run: PlsCaptureRun;

const GATEWAY_WEDGES = ["beauty", "wellness", "hair", "medspa", "event-vendors"] as const;

async function captureGatewayWedge(
  page: import("@playwright/test").Page,
  vertical: string,
) {
  await page.goto(`/demo/wedge/${vertical}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await run.capture(page, {
    scenarioId: `F-G2-${vertical}-story`,
    persona: "prospect",
    surface: "gateway",
    route: `/demo/wedge/${vertical}`,
  });

  const beats = page.getByTestId("gateway-demo-beats-grid");
  if (await beats.isVisible().catch(() => false)) {
    await run.capture(page, {
      scenarioId: `F-G2-${vertical}-beats`,
      persona: "prospect",
      surface: "gateway",
      route: `/demo/wedge/${vertical}#beats`,
    });
  }

  const cont = page.getByTestId("gateway-demo-continue");
  if (await cont.isVisible().catch(() => false)) {
    await cont.click();
    await page.waitForTimeout(800);
    await run.capture(page, {
      scenarioId: `F-G3-${vertical}-roles`,
      persona: "prospect",
      surface: "gateway",
      route: `/demo/wedge/${vertical}#roles`,
    });
  }
}

test.describe("PLS Wave 3 — gateway + chain + session unhappy", () => {
  test.describe.configure({ mode: "serial", timeout: 720_000 });

  test.beforeAll(async ({ request }) => {
    await ensureDemoProvisioned(request);
    run = new PlsCaptureRun(3, OUT_ROOT, runDate);
  });

  test.afterAll(() => {
    run.flush();
    mergeManifest(3, runDate);
  });

  test("Pack F — G1 demo launcher", async ({ page }) => {
    await page.goto("/demo", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await expect(page.getByTestId("gateway-g1-launcher")).toBeVisible({ timeout: 20_000 });
    await run.capture(page, {
      scenarioId: "F-G1-launcher",
      persona: "prospect",
      surface: "gateway",
      route: "/demo",
    });
    await expect(page.getByTestId("demo-wedge-grid")).toBeVisible();
    const locked = page.locator(".gateway-g1-world-card--locked").first();
    if (await locked.isVisible().catch(() => false)) {
      await run.capture(page, {
        scenarioId: "F-G1-locked-card-state",
        persona: "prospect",
        surface: "gateway",
        route: "/demo#locked-card",
      });
    }
  });

  test("Pack F — G2/G3 wedge stories", async ({ page }) => {
    for (const vertical of GATEWAY_WEDGES) {
      await captureGatewayWedge(page, vertical);
    }
  });

  test("Pack F — unhappy gateway paths", async ({ page }) => {
    await page.goto("/demo/wedge/not-a-real-vertical", { waitUntil: "domcontentloaded" });
    await run.capture(page, {
      scenarioId: "F-unhappy-invalid-wedge",
      persona: "prospect",
      surface: "gateway",
      route: "/demo/wedge/not-a-real-vertical",
    });

    await page.goto("/demo/wedge/beauty", { waitUntil: "domcontentloaded" });
    const back = page.getByTestId("gateway-demo-back-brief");
    if (await back.isVisible().catch(() => false)) {
      await back.click();
      await page.waitForTimeout(600);
      await run.capture(page, {
        scenarioId: "F-unhappy-g2-back-to-g1",
        persona: "prospect",
        surface: "gateway",
        route: "/demo#back-from-g2",
      });
    }
  });

  test("Pack F — marketing → demo handoff", async ({ page }) => {
    await page.goto(`${marketingBase}/verticals/beauty`, { waitUntil: "domcontentloaded" });
    await run.capture(page, {
      scenarioId: "F-marketing-vertical-beauty",
      persona: "prospect",
      surface: "marketing",
      route: "/verticals/beauty",
    });
    await page.goto(`${marketingBase}/get-started?vertical=beauty`, { waitUntil: "domcontentloaded" });
    await run.capture(page, {
      scenarioId: "F-marketing-get-started-beauty",
      persona: "prospect",
      surface: "marketing",
      route: "/get-started?vertical=beauty",
    });
  });

  test("Pack E — chain edge cases", async ({ page, request }) => {
    await resetDemoBrowserSession(page);
    await signInDemoPersona(page, "org_admin");
    await page.goto("/chain", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await run.capture(page, {
      scenarioId: "E-chain-hq-portfolio",
      persona: "founder",
      surface: "dashboard",
      route: "/chain",
    });
    const showAll = page.getByRole("button", { name: /show all|view all/i });
    if (await showAll.isVisible().catch(() => false)) {
      await showAll.click();
      await page.waitForTimeout(400);
      await run.capture(page, {
        scenarioId: "E-chain-expanded-shops",
        persona: "founder",
        surface: "dashboard",
        route: "/chain#expanded",
      });
    }
    await page.goto("/onboarding?intent=second-shop", { waitUntil: "domcontentloaded" });
    await run.capture(page, {
      scenarioId: "E-chain-add-second-location",
      persona: "founder",
      surface: "dashboard",
      route: "/onboarding?intent=second-shop",
    });

    const singleSlug = "bloom-beauty-dublin";
    if (await demoHasBusiness(request, singleSlug) && (await demoCanSignIn(request, singleSlug))) {
      await resetDemoBrowserSession(page);
      await signInBusiness(page, singleSlug, { resetSession: true });
      await page.goto("/chain", { waitUntil: "domcontentloaded", timeout: 45_000 });
      await run.capture(page, {
        scenarioId: "E-unhappy-single-shop-chain",
        persona: "owner",
        surface: "dashboard",
        route: `/chain @${singleSlug}`,
      });
    }
  });

  test("Pack B — session expiry + protected routes", async ({ page }) => {
    await resetDemoBrowserSession(page);
    for (const route of ["/dashboard", "/inbox", "/settings?tab=billing"]) {
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await run.capture(page, {
        scenarioId: `B-unhappy-expired-${slugifyRoute(route)}`,
        persona: "anonymous",
        surface: "gateway",
        route: `${route} (no session)`,
      });
    }
    await page.goto("/sign-in?redirect=/dashboard", { waitUntil: "domcontentloaded" });
    await run.capture(page, {
      scenarioId: "B-unhappy-sign-in-redirect",
      persona: "anonymous",
      surface: "gateway",
      route: "/sign-in?redirect=/dashboard",
    });
  });

  test("Pack B — billing addon locked state", async ({ page, request }) => {
    const slug = "luxe-salon-spa";
    if (!(await demoHasBusiness(request, slug)) || !(await demoCanSignIn(request, slug))) {
      test.skip(true, "luxe owner unavailable");
    }
    await resetDemoBrowserSession(page);
    await signInBusiness(page, slug, { resetSession: true });
    await page.goto("/settings?tab=billing", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await run.capture(page, {
      scenarioId: "B-billing-addon-catalog",
      persona: "owner",
      surface: "dashboard",
      route: "/settings?tab=billing",
    });
  });

  test("content audit summary", async () => {
    const failed = run.contentFailures();
    if (failed.length > 0) {
      console.log("\nPLS Wave 3 content failures:");
      for (const f of failed) {
        console.log(`  ${f.scenarioId}: ${f.contentHits.join(", ")}`);
      }
    }
    expect(failed, `Forbidden copy on ${failed.length} screen(s)`).toHaveLength(0);
  });
});
