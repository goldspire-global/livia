import { inngest } from "../lib/inngest";
import { tenantContextStore, type TenantContext } from "@workspace/tenant-context";
import { getBookingById } from "../services/bookings.service";
import {
  prepareAftercareOnComplete,
  sendAftercareForBooking,
  aftercareWorkflowDelayMs,
} from "../services/guest-care-aftercare.service";
import { resolveGuestCareAutomation, type BusinessVertical } from "@workspace/policy";
import { db, businessesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function runWithTenant<T>(ctx: TenantContext, fn: () => Promise<T>): Promise<T> {
  return tenantContextStore.run(ctx, fn);
}

export const aftercareFollowup = inngest.createFunction(
  { id: "aftercare-followup", retries: 2 },
  { event: "booking.completed" },
  async ({ event, step }) => {
    const { businessId, bookingId } = event.data as {
      businessId: string;
      bookingId: string;
    };

    const tenantCtx: TenantContext = {
      businessId,
      membershipId: "workflow:aftercare-followup",
      capabilityToken: "workflow:aftercare-followup",
      region: "fra",
      locale: "en-IE",
    };

    const booking = await step.run("load-booking", () =>
      runWithTenant(tenantCtx, () => getBookingById(businessId, bookingId)),
    );
    if (!booking || booking.status !== "COMPLETED") {
      return { skipped: "not_completed" };
    }

    const [biz] = await db
      .select({ vertical: businessesTable.vertical, operationalPolicy: businessesTable.operationalPolicy })
      .from(businessesTable)
      .where(eq(businessesTable.id, businessId))
      .limit(1);

    const care = resolveGuestCareAutomation({
      vertical: (biz?.vertical ?? "hair") as BusinessVertical,
      operationalPolicy: biz?.operationalPolicy,
    });

    if (!care.aftercareEnabled) return { skipped: "disabled" };

    const prep = await step.run("prepare", () =>
      runWithTenant(tenantCtx, () => prepareAftercareOnComplete(businessId, bookingId)),
    );

    if ("draft" in prep && prep.draft) {
      return { draft: true };
    }

    if (care.aftercareMode === "manual_only") {
      return { skipped: "manual_only" };
    }

    const delayMs = await step.run("resolve-delay", () => aftercareWorkflowDelayMs(businessId));
    await step.sleep("wait-aftercare", delayMs);

    const result = await step.run("send-aftercare", () =>
      runWithTenant(tenantCtx, () => sendAftercareForBooking(businessId, bookingId)),
    );

    return result;
  },
);
