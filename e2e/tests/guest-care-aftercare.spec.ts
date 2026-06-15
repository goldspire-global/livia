/**
 * Guest care — complete booking → Liv draft aftercare → send.
 *
 *   pnpm --filter @workspace/e2e run test:guest-care-aftercare
 */
import { test, expect } from "@playwright/test";
import {
  apiBase,
  assertHealthyPage,
  demoCanSignIn,
  demoHasBusiness,
  dismissPlatformTour,
  ensureDemoProvisioned,
  signInBusiness,
} from "../helpers/demo-auth";
import { bookPublicSlot } from "../helpers/public-book";
import {
  findAftercareBookingCandidate,
  pageAuthedJson,
  patchBookingStatus,
} from "../helpers/authed-api";

const BLOOM = "bloom-beauty-dublin";

test.describe("Guest care aftercare", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  test.beforeAll(async ({ request }) => {
    await ensureDemoProvisioned(request);
  });

  test("beauty owner completes visit and sends Liv draft aftercare", async ({ page, request }) => {
    if (!(await demoHasBusiness(request, BLOOM))) {
      test.skip(true, `${BLOOM} missing — run pnpm demo:provision`);
    }
    if (!(await demoCanSignIn(request, BLOOM))) {
      test.skip(true, "Clerk sign-in unavailable");
    }

    const metaRes = await request.post(`${apiBase}/api/demo/sign-in-business`, {
      data: { slug: BLOOM },
    });
    expect(metaRes.ok()).toBeTruthy();
    const { businessId } = (await metaRes.json()) as { businessId?: string };
    if (!businessId) test.skip(true, "No businessId for bloom");

    await signInBusiness(page, BLOOM);
    await dismissPlatformTour(page);

    let candidate = await findAftercareBookingCandidate(page, businessId);

    if (!candidate) {
      const suffix = Date.now().toString().slice(-6);
      const bookRes = await bookPublicSlot(
        request,
        BLOOM,
        {
          customerFirstName: "Aftercare",
          customerLastName: "E2E",
          customerPhone: `+35387${suffix}`,
          customerEmail: `e2e-aftercare-${suffix}@test.livia.local`,
        },
        { workerIndex: test.info().workerIndex },
      );
      if (!bookRes?.ok()) {
        test.skip(true, "No bookable slot for aftercare E2E");
      }
      const booked = (await bookRes.json()) as { bookingId: string; status?: string };
      const bookingId = booked.bookingId;

      if (booked.status === "PENDING") {
        const confirmed = await patchBookingStatus(page, businessId, bookingId, "CONFIRMED");
        if (!confirmed) {
          test.skip(true, "Deposit blocks confirm — seed a CONFIRMED booking or pay deposit");
        }
        candidate = { id: bookingId, status: "CONFIRMED" };
      } else if (booked.status === "CONFIRMED") {
        candidate = { id: bookingId, status: "CONFIRMED" };
      } else if (booked.status === "COMPLETED") {
        candidate = { id: bookingId, status: "COMPLETED" };
      } else {
        test.skip(true, `Unexpected booking status ${booked.status}`);
      }
    }

    await page.goto(`/bookings/${candidate.id}`, { waitUntil: "domcontentloaded" });
    await assertHealthyPage(page, `/bookings/${candidate.id}`);
    await expect(page.getByTestId("booking-detail-page")).toBeVisible({ timeout: 20_000 });

    if (candidate.status === "CONFIRMED") {
      const completeBtn = page.getByTestId("button-transition-COMPLETED");
      await expect(completeBtn).toBeVisible({ timeout: 10_000 });
      await completeBtn.click();
      await expect(page.getByText(/completed/i).first()).toBeVisible({ timeout: 15_000 });
    }

    const panel = page.getByTestId("booking-aftercare-panel");
    await expect(panel).toBeVisible({ timeout: 20_000 });

    const draft = page.getByTestId("booking-aftercare-draft");
    await expect(draft).toBeVisible();
    await expect(draft).not.toHaveValue("");

    await page.getByTestId("booking-aftercare-send").click();
    await expect(page.getByText(/Sent /i)).toBeVisible({ timeout: 20_000 });

    const aftercare = await pageAuthedJson<{
      sentAt: string | null;
      status: string | null;
    }>(page, `/api/businesses/${businessId}/bookings/${candidate.id}/aftercare`);
    expect(aftercare.ok).toBeTruthy();
    expect(aftercare.data?.sentAt).toBeTruthy();
  });
});
