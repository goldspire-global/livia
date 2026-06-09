/**
 * Founder UAT — signed-in P0 paths for medspa + salon owners.
 *
 *   pnpm --filter @workspace/e2e run test:founder-uat
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  assertHealthyPage,
  demoCanSignIn,
  demoCanSignInOrgAdmin,
  demoHasBusiness,
  dismissPlatformTour,
  ensureDemoProvisioned,
  signInBusiness,
  signInOrgAdmin,
} from "../helpers/demo-auth";

const LUXE = process.env.E2E_DEMO_SLUG ?? "luxe-salon-spa";
const MEDSPA = "clarity-medspa-dublin";
const BLOOM = "bloom-beauty-dublin";

async function expectNoSeriousAxe(page: import("@playwright/test").Page, label: string) {
  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(serious, `${label}: ${serious.map((v) => v.id).join(", ")}`).toEqual([]);
}

test.describe("Founder UAT P0", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  test.beforeAll(async ({ request }) => {
    test.setTimeout(300_000);
    await ensureDemoProvisioned(request);
  });

  test.describe("Medspa owner (Clarity)", () => {
    test.beforeEach(async ({ page, request }) => {
      if (!(await demoHasBusiness(request, MEDSPA))) {
        test.skip(true, `${MEDSPA} missing`);
      }
      if (!(await demoCanSignIn(request, MEDSPA))) {
        test.skip(true, "Clerk sign-in unavailable");
      }
      await signInBusiness(page, MEDSPA);
      await dismissPlatformTour(page);
    });

    test("dashboard ritual — no full Liv hub on home", async ({ page }) => {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      await assertHealthyPage(page, "/dashboard");
      await expect(page.getByTestId("owner-home-ritual")).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId("liv-command-hub")).toHaveCount(0);
      await expectNoSeriousAxe(page, "medspa dashboard");
    });

    test("clinical hub compact shell", async ({ page }) => {
      await page.goto("/medspa", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("medspa-hub-page")).toBeVisible();
      await expectNoSeriousAxe(page, "medspa hub");
    });

    test("customers roster", async ({ page }) => {
      await page.goto("/customers", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("customers-page")).toBeVisible();
    });

    test("services catalog", async ({ page }) => {
      await page.goto("/services", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("services-page")).toBeVisible();
    });

    test("settings shop tab — booking link strip", async ({ page }) => {
      await page.goto("/settings?tab=shop", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("settings-page")).toBeVisible();
      await expect(page.getByTestId("settings-booking-link-strip")).toBeVisible();
      await expect(page.getByTestId("tab-appearance")).toBeVisible();
    });
  });

  test.describe("Beauty owner (Bloom)", () => {
    test.beforeEach(async ({ page, request }) => {
      if (!(await demoHasBusiness(request, BLOOM))) {
        test.skip(true, `${BLOOM} missing`);
      }
      if (!(await demoCanSignIn(request, BLOOM))) {
        test.skip(true, "Clerk sign-in unavailable");
      }
      await signInBusiness(page, BLOOM);
      await dismissPlatformTour(page);
    });

    test("dashboard ritual — beauty chrome", async ({ page }) => {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      await assertHealthyPage(page, "/dashboard");
      await expect(page.getByTestId("owner-home-ritual")).toBeVisible({ timeout: 20_000 });
      await expectNoSeriousAxe(page, "bloom dashboard");
    });

    test("customers ambient roster", async ({ page }) => {
      await page.goto("/customers", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("customers-page")).toBeVisible();
      await expect(page.locator(".beauty-operational-panel--ambient")).toBeVisible();
    });

    test("services catalog", async ({ page }) => {
      await page.goto("/services", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("services-page")).toBeVisible();
    });

    test("settings appearance — preset + public preview", async ({ page }) => {
      await page.goto("/settings?tab=appearance", { waitUntil: "domcontentloaded" });
      const panel = page.getByTestId("public-appearance-panel");
      if ((await panel.count()) === 0) {
        test.skip(true, "presentation presets not enabled in this environment");
      }
      await expect(panel).toBeVisible();
      await expect(page.getByTestId("public-b-preview-frame")).toBeVisible();
    });

    test("public book — bloom slug", async ({ page, request }) => {
      const res = await request.get(`${process.env.E2E_API_BASE ?? "http://127.0.0.1:3000"}/api/public/b/${BLOOM}`);
      if (!res.ok()) test.skip(true, `${BLOOM} public surface missing`);
      await page.goto(`/b/${BLOOM}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).not.toContainText(/something went wrong/i);
    });
  });

  test.describe("Salon owner (Luxe)", () => {
    test.beforeEach(async ({ page, request }) => {
      if (!(await demoHasBusiness(request, LUXE))) {
        test.skip(true, `${LUXE} missing`);
      }
      if (!(await demoCanSignIn(request, LUXE))) {
        test.skip(true, "Clerk sign-in unavailable");
      }
      await signInBusiness(page, LUXE);
      await dismissPlatformTour(page);
    });

    test("inbox without empty context rail", async ({ page }) => {
      await page.goto("/inbox", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("inbox-three-pane")).toBeVisible();
      await expect(page.getByTestId("inbox-context-rail")).toHaveCount(0);
    });

    test("toolkit focused Liv hub", async ({ page }) => {
      await page.goto("/toolkit", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("toolkit-page")).toBeVisible();
      await expect(page.getByTestId("liv-moments-strip")).toHaveCount(0);
    });

    test("staff roster", async ({ page }) => {
      await page.goto("/staff", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("staff-page")).toBeVisible();
    });

    test("services catalog", async ({ page }) => {
      await page.goto("/services", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("services-page")).toBeVisible();
    });

    test("public appearance preview frame", async ({ page }) => {
      await page.goto("/settings?tab=appearance", { waitUntil: "domcontentloaded" });
      const panel = page.getByTestId("public-appearance-panel");
      if ((await panel.count()) === 0) {
        test.skip(true, "presentation presets not enabled in this environment");
      }
      await expect(panel).toBeVisible();
      await expect(page.getByTestId("public-b-preview-frame")).toBeVisible();
    });

    test("commerce intelligence — deposit proposal + billing remediation", async ({ page }) => {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      await assertHealthyPage(page, "/dashboard");
      const proposals = page.getByTestId("liv-proposals-panel");
      const hub = page.getByTestId("owner-operator-intelligence-stack");
      const ownerStack = page.getByTestId("owner-intelligence-stack");
      const legacyHub = page.getByTestId("owner-intelligence-hub");
      await expect(proposals.or(hub).or(ownerStack).or(legacyHub)).toBeVisible({ timeout: 25_000 });

      await page.goto("/settings?tab=billing", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("settings-page")).toBeVisible();
      const remediation = page.getByTestId("billing-remediation-strip");
      const commercePanel = page.getByTestId("commerce-signals-panel");
      await expect(remediation.or(commercePanel)).toBeVisible({ timeout: 15_000 });
    });

    test("owner liv assist fab — opens ops sheet", async ({ page }) => {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      await assertHealthyPage(page, "/dashboard");
      const fab = page.getByTestId("owner-liv-assist-fab");
      await expect(fab).toBeVisible({ timeout: 20_000 });
      await fab.click();
      await expect(page.getByTestId("owner-liv-ops-panel")).toBeVisible({ timeout: 10_000 });
    });

    test("toolkit — liv hub with ops or activity feed", async ({ page }) => {
      await page.goto("/toolkit", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("toolkit-page")).toBeVisible();
      await expect(page.getByTestId("liv-command-hub")).toBeVisible();
      const feed = page.getByTestId("activity-feed-panel");
      const ops = page.getByTestId("owner-liv-ops-panel");
      await expect(feed.or(ops)).toBeVisible({ timeout: 15_000 });
    });

    test("twin observations — owner intelligence surfaces", async ({ page }) => {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      await assertHealthyPage(page, "/dashboard");
      const stack = page.getByTestId("owner-intelligence-stack");
      const opStack = page.getByTestId("owner-operator-intelligence-stack");
      const obsStrip = page.getByTestId("twin-observations-strip");
      const riskStrip = page.getByTestId("twin-risks-strip");
      const proposals = page.getByTestId("liv-proposals-panel");
      await expect(stack.or(opStack).or(proposals)).toBeVisible({ timeout: 25_000 });
      if ((await obsStrip.or(riskStrip).count()) > 0) {
        await expect(obsStrip.or(riskStrip).first()).toBeVisible();
      }
    });
  });
});

test.describe("Org admin (multi-shop)", () => {
  test.beforeEach(async ({ page, request }) => {
    if (!(await demoCanSignInOrgAdmin(request))) {
      test.skip(true, "Org admin demo sign-in unavailable");
    }
    await signInOrgAdmin(page);
  });

  test("chain portfolio — commerce + shop cards", async ({ page }) => {
    await page.goto("/chain", { waitUntil: "domcontentloaded" });
    await assertHealthyPage(page, "/chain");
    await expect(page.getByTestId("founder-chain-page")).toBeVisible({ timeout: 25_000 });
    const commerce = page.getByTestId("chain-commerce-panel");
    const shopCard = page.locator('[data-testid^="founder-shop-card-"]').first();
    await expect(commerce.or(shopCard)).toBeVisible({ timeout: 20_000 });
  });

  test("capability readiness on dashboard", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await assertHealthyPage(page, "/dashboard");
    const panel = page.getByTestId("capability-readiness-panel");
    const stack = page.getByTestId("owner-intelligence-stack");
    const opStack = page.getByTestId("owner-operator-intelligence-stack");
    await expect(panel.or(stack).or(opStack)).toBeVisible({ timeout: 25_000 });
  });
});
