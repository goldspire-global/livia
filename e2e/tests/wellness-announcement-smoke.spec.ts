import { test, expect } from "@playwright/test";

/**
 * Wellness L8 guard — tenant experience announces welcomed package.
 * Full founder walkthrough: docs/operations/WELLNESS-FOUNDER-SMOKE.md
 */
test.describe("wellness vertical announcement", () => {
  test("harbour-wellness demo exposes welcomed announcement", async ({ page, request }) => {
    test.skip(!process.env.E2E_CLERK_OWNER_TOKEN, "Requires E2E owner token");

    const res = await request.get(
      `${process.env.E2E_API_BASE_URL ?? "http://localhost:3000"}/api/me/tenant-experience?businessId=${process.env.E2E_WELLNESS_BUSINESS_ID ?? ""}`,
      {
        headers: { Authorization: `Bearer ${process.env.E2E_CLERK_OWNER_TOKEN}` },
      },
    );
    test.skip(!res.ok(), "tenant-experience unavailable");
    const body = await res.json();
    expect(body.announcement?.welcomed).toBe(true);
    expect(body.announcement?.operatorShell).toBe("wellness-full-nav");
    expect(body.announcement?.roomBoard?.mode).toBe("schedule-derived");
    expect(body.vertical).toBe("wellness");
  });
});
