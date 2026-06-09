/**
 * After proof approval — bind deposit to session slot (Innovation P0).
 */
import {
  db,
  bookingsTable,
  businessesTable,
  designProofAssetsTable,
  servicesTable,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { ensureBookingGuestAccess } from "./booking-guest-access.service";
import { resolveGuestBookUrl, resolveGuestTokenUrl } from "../lib/guest-public-urls";
import { policiesFromBusiness } from "./policies.service";
import { computeDepositDueMinor } from "./guest-deposit-pay.service";

export type ProofApprovedDepositBind = {
  proofId: string;
  bookingId: string | null;
  depositDueMinor: number;
  depositPayUrl: string | null;
  sessionBookUrl: string;
  message: string;
};

export async function bindDepositAfterProofApproval(
  businessId: string,
  proofId: string,
): Promise<ProofApprovedDepositBind | null> {
  const [proof] = await db
    .select({
      id: designProofAssetsTable.id,
      bookingId: designProofAssetsTable.bookingId,
      status: designProofAssetsTable.status,
    })
    .from(designProofAssetsTable)
    .where(
      and(eq(designProofAssetsTable.id, proofId), eq(designProofAssetsTable.businessId, businessId)),
    )
    .limit(1);
  if (!proof || proof.status !== "approved") return null;

  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);
  if (!biz?.slug) return null;

  const bookingId = proof.bookingId;
  let depositDueMinor = 0;
  let depositPayUrl: string | null = null;

  if (bookingId) {
    const [booking] = await db
      .select({
        id: bookingsTable.id,
        status: bookingsTable.status,
        depositPaidEurCents: bookingsTable.depositPaidEurCents,
        serviceId: bookingsTable.serviceId,
      })
      .from(bookingsTable)
      .where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.businessId, businessId)))
      .limit(1);

    if (booking) {
      const policies = policiesFromBusiness(biz);
      const [svc] = await db
        .select({ priceMinor: servicesTable.priceMinor })
        .from(servicesTable)
        .where(eq(servicesTable.id, booking.serviceId))
        .limit(1);

      depositDueMinor = computeDepositDueMinor({
        priceMinor: svc?.priceMinor ?? 0,
        depositPercent: policies.operational.depositPercent ?? 0,
        depositRequired: policies.operational.depositRequired,
        depositPaidMinor: booking.depositPaidEurCents ?? 0,
      });

      if (depositDueMinor > 0 && booking.status === "PENDING") {
        await db
          .update(bookingsTable)
          .set({
            pendingReason: "awaiting_deposit",
            updatedAt: new Date(),
          })
          .where(eq(bookingsTable.id, bookingId));

        const payToken = await ensureBookingGuestAccess(businessId, bookingId);
        depositPayUrl = resolveGuestTokenUrl(biz.slug, "pay", payToken);
      }
    }
  }

  return {
    proofId,
    bookingId,
    depositDueMinor,
    depositPayUrl,
    sessionBookUrl: resolveGuestBookUrl(biz.slug),
    message:
      depositDueMinor > 0
        ? "Design approved — pay your deposit to lock the session slot."
        : "Design approved — book your session when you are ready.",
  };
}
