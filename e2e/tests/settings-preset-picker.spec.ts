/**
 * E7 — presentation preset picker (staging / dev API gate).
 *
 *   pnpm --filter @workspace/e2e exec playwright test --project=settings-preset-picker
 */
import { test, expect } from "@playwright/test";
import {
  apiBase,
  demoCanSignIn,
  dismissLegalAcceptance,
  dismissPlatformTour,
  ensureDemoProvisioned,
  signInBusiness,
} from "../helpers/demo-auth";

const demoSlug = process.env.E2E_DEMO_SLUG ?? "luxe-salon-spa";
const dashboardBase = (process.env.E2E_DASHBOARD_BASE ?? "http://127.0.0.1:5173").replace(/\/+$/, "");
const isStagingHost = dashboardBase.includes("staging");

test.describe("Settings preset picker (E7)", () => {
  test.beforeAll(async ({ request }) => {
    await ensureDemoProvisioned(request);
    if (!(await demoCanSignIn(request, demoSlug))) {
      test.skip(true, "Clerk demo sign-in unavailable");
    }
  });

  test("owner can view and save appearance preset", async ({ page, request }) => {
    await signInBusiness(page, demoSlug);
    await dismissLegalAcceptance(page);
    await dismissPlatformTour(page);

    await page.goto("/settings?tab=shop", { waitUntil: "domcontentloaded", timeout: 45_000 });

    const panel = page.getByTestId("presentation-preset-panel");
    const visible = await panel.isVisible().catch(() => false);

    if (!visible) {
      if (isStagingHost) {
        throw new Error("Preset panel missing on staging — check LIVIA_DEPLOY_ENV=staging on API");
      }
      test.skip(true, "Preset picker not enabled in this environment");
    }

    await expect(panel.getByTestId("presentation-preset-select")).toBeVisible();
    const select = panel.getByTestId("presentation-preset-select");
    await select.click();
    const options = page.getByRole("option");
    const count = await options.count();
    expect(count).toBeGreaterThan(1);

    const pick = count > 1 ? options.nth(1) : options.first();
    const label = (await pick.textContent())?.trim() ?? "";
    await pick.click();

    await panel.getByTestId("presentation-save").click();
    await expect(page.getByText(/appearance updated/i)).toBeVisible({ timeout: 15_000 });

    const status = await request.get(`${apiBase}/api/demo/status`);
    expect(status.ok()).toBeTruthy();
    const biz = ((await status.json()) as { businesses?: Array<{ slug: string; id: string }> }).businesses?.find(
      (b) => b.slug === demoSlug,
    );
    if (biz?.id) {
      const pres = await page.evaluate(
        async ({ api, businessId }) => {
          const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } })
            .Clerk;
          const token = await clerk?.session?.getToken?.();
          if (!token) return null;
          const res = await fetch(`${api}/api/businesses/${businessId}/presentation`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return res.ok ? res.json() : null;
        },
        { api: apiBase, businessId: biz.id },
      );
      expect(pres?.presetsEnabled).toBe(true);
      if (label) expect(pres?.preset?.label ?? pres?.presetId).toBeTruthy();
    }
  });
});
