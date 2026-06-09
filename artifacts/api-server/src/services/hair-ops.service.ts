/**
 * Hair salon ops — colour-day flight plan (Innovation P0).
 */
import {
  db,
  bookingsTable,
  customersTable,
  servicesTable,
  staffTable,
} from "@workspace/db";
import { and, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
import { normalizePhoneE164 } from "@workspace/policy";

export type HairColourDayRow = {
  bookingId: string;
  startAt: string;
  endAt: string;
  status: string;
  pendingReason: string | null;
  depositPaidEurCents: number;
  serviceName: string;
  durationMinutes: number;
  customerName: string;
  staffDisplayName: string | null;
  needsDeposit: boolean;
};

export async function getHairColourDayFlightPlan(businessId: string): Promise<{
  blockCount: number;
  pendingDepositCount: number;
  rows: HairColourDayRow[];
}> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const raw = await db
    .select({
      bookingId: bookingsTable.id,
      startAt: bookingsTable.startAt,
      endAt: bookingsTable.endAt,
      status: bookingsTable.status,
      pendingReason: bookingsTable.pendingReason,
      depositPaidEurCents: bookingsTable.depositPaidEurCents,
      serviceName: servicesTable.name,
      durationMinutes: servicesTable.durationMinutes,
      category: servicesTable.category,
      customerName: customersTable.displayName,
      customerFirst: customersTable.firstName,
      customerLast: customersTable.lastName,
      staffDisplayName: staffTable.displayName,
    })
    .from(bookingsTable)
    .innerJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
    .innerJoin(customersTable, eq(bookingsTable.customerId, customersTable.id))
    .leftJoin(staffTable, eq(bookingsTable.staffId, staffTable.id))
    .where(
      and(
        eq(bookingsTable.businessId, businessId),
        gte(bookingsTable.startAt, start),
        lte(bookingsTable.startAt, end),
        inArray(bookingsTable.status, ["PENDING", "CONFIRMED"]),
        or(
          sql`lower(${servicesTable.category}) like '%colour%'`,
          sql`lower(${servicesTable.category}) like '%color%'`,
          gte(servicesTable.durationMinutes, 90),
        ),
      ),
    )
    .orderBy(bookingsTable.startAt);

  const rows: HairColourDayRow[] = raw.map((r) => {
    const needsDeposit =
      r.status === "PENDING" &&
      (r.pendingReason === "awaiting_deposit" || (r.depositPaidEurCents ?? 0) <= 0);
    return {
      bookingId: r.bookingId,
      startAt: r.startAt.toISOString(),
      endAt: r.endAt.toISOString(),
      status: r.status,
      pendingReason: r.pendingReason,
      depositPaidEurCents: r.depositPaidEurCents ?? 0,
      serviceName: r.serviceName,
      durationMinutes: r.durationMinutes,
      customerName:
        r.customerName?.trim() ||
        [r.customerFirst, r.customerLast].filter(Boolean).join(" ").trim() ||
        "Guest",
      staffDisplayName: r.staffDisplayName,
      needsDeposit,
    };
  });

  return {
    blockCount: rows.length,
    pendingDepositCount: rows.filter((r) => r.needsDeposit).length,
    rows,
  };
}

export async function resolvePublicHairGuestContext(businessId: string, phoneRaw: string) {
  const phone = normalizePhoneE164(phoneRaw.trim()) ?? phoneRaw.trim();
  if (!phone) return { recognized: false as const };

  const [customer] = await db
    .select({
      id: customersTable.id,
      preferredStaffId: customersTable.preferredStaffId,
    })
    .from(customersTable)
    .where(and(eq(customersTable.businessId, businessId), eq(customersTable.phone, phone)))
    .limit(1);

  if (!customer) return { recognized: false as const };

  let preferredStaff: { id: string; displayName: string } | null = null;
  if (customer.preferredStaffId) {
    const [staff] = await db
      .select({ id: staffTable.id, displayName: staffTable.displayName })
      .from(staffTable)
      .where(eq(staffTable.id, customer.preferredStaffId))
      .limit(1);
    if (staff?.displayName) {
      preferredStaff = { id: staff.id, displayName: staff.displayName };
    }
  }

  return {
    recognized: true as const,
    preferredStaff,
  };
}
