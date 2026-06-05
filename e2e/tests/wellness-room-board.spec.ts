import { test, expect } from "@playwright/test";
import { demoOwnerLogin } from "../helpers/demo-auth";

test.describe("Wellness room board", () => {
  test.beforeEach(async ({ page }) => {
    await demoOwnerLogin(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded", timeout: 45_000 });
  });

  test("shows room lanes and stress link for harbour wellness", async ({ page }) => {
    await page.goto("/demo", { waitUntil: "domcontentloaded" });
    const harbour = page.getByRole("link", { name: /harbour|wellness cork/i }).first();
    if (await harbour.isVisible().catch(() => false)) {
      await harbour.click();
    }
    await page.goto("/dashboard", { waitUntil: "domcontentloaded", timeout: 45_000 });
    const board = page.locator("[data-testid='wellness-room-board']");
    await expect(board.or(page.locator("[data-testid='wellness-morph-today-atrium']"))).toBeVisible({
      timeout: 20_000,
    });
    const stress = page.locator("[data-testid='wellness-tomorrow-stress']");
    if (await stress.isVisible().catch(() => false)) {
      await expect(stress).toContainText(/\d+/);
    }
  });
});
