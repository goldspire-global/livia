import { db, bookingsTable, businessesTable, servicesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { computeDepositDueMinor, resolveBookingDepositPercent } from "../services/guest-deposit-pay.service";
import { policiesFromBusiness } from "../services/policies.service";
import { depositAppliesForBookingContext } from "@workspace/policy";

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
    .select({
      priceMinor: servicesTable.priceMinor,
      serviceKind: servicesTable.serviceKind,
      category: servicesTable.category,
      name: servicesTable.name,
      durationMinutes: servicesTable.durationMinutes,
      depositPercent: servicesTable.depositPercent,
    })
    .from(servicesTable)
    .where(and(eq(servicesTable.id, row.serviceId), eq(servicesTable.businessId, businessId)))
    .limit(1);

  const policies = policiesFromBusiness(biz);
  const depositRequired = depositAppliesForBookingContext({
    operational: policies.operational,
    service: service ?? null,
  });
  if (!depositRequired) return 0;

  return computeDepositDueMinor({
    priceMinor: service?.priceMinor ?? 0,
    depositPercent: resolveBookingDepositPercent({
      operational: policies.operational,
      service: service ?? null,
    }),
    depositRequired: true,
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
