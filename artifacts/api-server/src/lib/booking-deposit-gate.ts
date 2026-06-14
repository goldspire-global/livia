import { db, bookingsTable, businessesTable, servicesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { computeDepositDueMinor } from "../services/guest-deposit-pay.service";
import { policiesFromBusiness } from "../services/policies.service";

/** Deposit still due — staff/Liv must not confirm until paid. */
export async function depositDueMinorForBooking(
  businessId: string,
  bookingId: string,
): Promise<number> {
  const [row] = await db
    .select({
      depositPaidEurCents: bookingsTable.depositPaidEurCents,
      serviceId: bookingsTable.serviceId,
      businessId: bookingsTable.businessId,
    })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.businessId, businessId)))
    .limit(1);
  if (!row) return 0;

  const [biz] = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);
  if (!biz) return 0;

  const [service] = await db
    .select({ priceMinor: servicesTable.priceMinor })
    .from(servicesTable)
    .where(and(eq(servicesTable.id, row.serviceId), eq(servicesTable.businessId, businessId)))
    .limit(1);

  const policies = policiesFromBusiness(biz);
  return computeDepositDueMinor({
    priceMinor: service?.priceMinor ?? 0,
    depositPercent: policies.operational.depositPercent ?? 0,
    depositRequired: policies.operational.depositRequired,
    depositPaidMinor: row.depositPaidEurCents ?? 0,
  });
}

export async function assertDepositPaidBeforeConfirm(
  businessId: string,
  bookingId: string,
): Promise<void> {
  const due = await depositDueMinorForBooking(businessId, bookingId);
  if (due > 0) {
    throw new Error("DEPOSIT_REQUIRED");
  }
}
