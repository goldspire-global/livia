import type { Page } from "@playwright/test";

/** Seed UX-only onboarding session flags (mirrors dashboard sessionStorage keys). */
export async function seedOnboardingFreshSession(
  page: Page,
  options?: { migrationIntent?: "fresh" | "switching" },
): Promise<void> {
  await page.addInitScript((migrationIntent: "fresh" | "switching" | null) => {
    sessionStorage.setItem("livia.onboarding.freshSession", "1");
    if (migrationIntent) {
      sessionStorage.setItem("livia.onboarding.migrationIntent", migrationIntent);
    }
  }, options?.migrationIntent ?? null);
}
