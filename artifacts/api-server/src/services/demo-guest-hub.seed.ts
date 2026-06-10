import { and, eq, gte, inArray, like, or } from "drizzle-orm";
import {
  db,
  bookingsTable,
  businessesTable,
  customersTable,
  guestIdentitiesTable,
  packageCreditLedgerTable,
  servicesTable,
  staffTable,
} from "@workspace/db";
import {
  GUEST_HUB_DEMO_BOOKING_NOTE,
  MARY_GUEST_HUB_UPCOMING_DAYS,
  normalizePhoneE164,
} from "@workspace/policy";
import { generateId } from "../lib/id";
import { createCustomer } from "./customers.service";
import { linkGuestToShop } from "./guest-hub.service";
import { grantPackageCredits } from "./package-credits.service";

/** Demo guest Mary — OTP sign-in for `/my` (W6). */
export const DEMO_GUEST_PHONE_E164 = "+353871000001";

/** Vertical showcase shops Mary must appear in (GTM Wave 1 / guest-hub E2E). */
export const DEMO_GUEST_SHOWCASE_SLUGS = [
  "luxe-salon-spa",
  "bloom-beauty-dublin",
  "harbour-wellness-cork",
  "ink-anchor-galway",
  "clarity-medspa-dublin",
  "motion-physio-cork",
  "peak-fitness-dublin",
  "paws-parlour-dublin",
  "shine-studio-belfast",
] as const;

const MARY = {
  firstName: "Mary",
  lastName: "McNamara",
  displayName: "Mary McNamara",
  email: "mary.m@email.ie",
  phone: DEMO_GUEST_PHONE_E164,
} as const;

const UPCOMING_SLUGS = new Set<string>(Object.keys(MARY_GUEST_HUB_UPCOMING_DAYS));

async function ensureDemoGuestIdentity(): Promise<string> {
  const [existing] = await db
    .select({ id: guestIdentitiesTable.id })
    .from(guestIdentitiesTable)
    .where(eq(guestIdentitiesTable.phoneE164, DEMO_GUEST_PHONE_E164))
    .limit(1);
  if (existing) return existing.id;
  const guestId = generateId();
  await db.insert(guestIdentitiesTable).values({
    id: guestId,
    phoneE164: DEMO_GUEST_PHONE_E164,
    verifiedAt: new Date(),
  });
  return guestId;
}

async function ensureMaryCustomer(businessId: string): Promise<string> {
  const rows = await db
    .select({
      id: customersTable.id,
      phone: customersTable.phone,
      firstName: customersTable.firstName,
      lastName: customersTable.lastName,
    })
    .from(customersTable)
    .where(eq(customersTable.businessId, businessId));

  const byPhone = rows.find(
    (r) => normalizePhoneE164(r.phone) === DEMO_GUEST_PHONE_E164,
  );
  if (byPhone) {
    if (byPhone.phone !== DEMO_GUEST_PHONE_E164) {
      await db
        .update(customersTable)
        .set({ phone: DEMO_GUEST_PHONE_E164 })
        .where(eq(customersTable.id, byPhone.id));
    }
    return byPhone.id;
  }

  const byName = rows.find(
    (r) =>
      r.firstName?.toLowerCase() === "mary" && r.lastName?.toLowerCase() === "mcnamara",
  );
  if (byName) {
    await db
      .update(customersTable)
      .set({
        phone: DEMO_GUEST_PHONE_E164,
        firstName: MARY.firstName,
        lastName: MARY.lastName,
        displayName: MARY.displayName,
        email: MARY.email,
      })
      .where(eq(customersTable.id, byName.id));
    return byName.id;
  }

  const created = await createCustomer(businessId, { ...MARY });
  return created.id;
}

function bookingWindow(daysAhead: number): { startAt: Date; endAt: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + daysAhead);
  start.setHours(10 + (daysAhead % 3), 30, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 60);
  return { startAt: start, endAt: end };
}

async function cancelMaryFutureBookings(
  businessId: string,
  customerId: string,
  keepId?: string,
): Promise<number> {
  const now = new Date();
  const rows = await db
    .select({ id: bookingsTable.id })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.businessId, businessId),
        eq(bookingsTable.customerId, customerId),
        gte(bookingsTable.startAt, now),
        inArray(bookingsTable.status, ["PENDING", "CONFIRMED"]),
      ),
    );

  let cancelled = 0;
  for (const row of rows) {
    if (keepId && row.id === keepId) continue;
    await db
      .update(bookingsTable)
      .set({
        status: "CANCELLED",
        cancellationReason: "demo-guest-hub-reconcile",
      })
      .where(eq(bookingsTable.id, row.id));
    cancelled += 1;
  }
  return cancelled;
}

async function upsertMaryGuestHubBooking(
  businessId: string,
  customerId: string,
  daysAhead: number,
): Promise<string | null> {
  const [staff] = await db
    .select({ id: staffTable.id })
    .from(staffTable)
    .where(eq(staffTable.businessId, businessId))
    .limit(1);
  const [service] = await db
    .select({ id: servicesTable.id })
    .from(servicesTable)
    .where(eq(servicesTable.businessId, businessId))
    .limit(1);
  if (!staff || !service) return null;

  const { startAt, endAt } = bookingWindow(daysAhead);
  const now = new Date();

  const [seeded] = await db
    .select({ id: bookingsTable.id })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.businessId, businessId),
        eq(bookingsTable.customerId, customerId),
        or(
          like(bookingsTable.notes, `%Demo guest hub%`),
          eq(bookingsTable.notes, GUEST_HUB_DEMO_BOOKING_NOTE),
        ),
        gte(bookingsTable.startAt, now),
        inArray(bookingsTable.status, ["PENDING", "CONFIRMED"]),
      ),
    )
    .limit(1);

  if (seeded) {
    await db
      .update(bookingsTable)
      .set({
        startAt,
        endAt,
        status: "CONFIRMED",
        notes: GUEST_HUB_DEMO_BOOKING_NOTE,
        cancellationReason: null,
      })
      .where(eq(bookingsTable.id, seeded.id));
    await cancelMaryFutureBookings(businessId, customerId, seeded.id);
    return seeded.id;
  }

  await cancelMaryFutureBookings(businessId, customerId);
  const id = generateId();
  await db.insert(bookingsTable).values({
    id,
    businessId,
    customerId,
    staffId: staff.id,
    serviceId: service.id,
    status: "CONFIRMED",
    startAt,
    endAt,
    notes: GUEST_HUB_DEMO_BOOKING_NOTE,
  });
  return id;
}

async function ensureWellnessPackageCredit(businessId: string, customerId: string): Promise<void> {
  const { listPackageCredits } = await import("./package-credits.service");
  const existing = await listPackageCredits(businessId, customerId);
  if (existing.some((r) => r.creditsRemaining > 0)) return;
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 6);
  const row = await grantPackageCredits(businessId, {
    customerId,
    packageName: "Calm Series — 6 sessions",
    creditsTotal: 6,
    expiresAt: expires.toISOString(),
    redemptionCode: "MARY-CALM6",
  });
  if (row) {
    await db
      .update(packageCreditLedgerTable)
      .set({ creditsRemaining: 4 })
      .where(eq(packageCreditLedgerTable.id, row.id));
  }
}

/**
 * Link demo guest Mary to all showcase studios + realistic upcoming visits + wellness pack.
 * Idempotent — reconciles operator live-day noise so `/my` is not 18 bookings on one day.
 */
export async function seedDemoGuestHub(): Promise<{
  guestId: string;
  shopsLinked: number;
  upcomingEnsured: number;
}> {
  const guestId = await ensureDemoGuestIdentity();
  let shopsLinked = 0;
  let upcomingEnsured = 0;
  const linkedAt = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  for (const slug of DEMO_GUEST_SHOWCASE_SLUGS) {
    const [biz] = await db
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(eq(businessesTable.slug, slug))
      .limit(1);
    if (!biz) continue;

    await linkGuestToShop(guestId, biz.id, linkedAt);
    shopsLinked += 1;

    const customerId = await ensureMaryCustomer(biz.id);

    if (slug === "harbour-wellness-cork") {
      await ensureWellnessPackageCredit(biz.id, customerId);
    }

    const daysAhead = MARY_GUEST_HUB_UPCOMING_DAYS[slug];
    if (daysAhead != null) {
      const id = await upsertMaryGuestHubBooking(biz.id, customerId, daysAhead);
      if (id) upcomingEnsured += 1;
    } else {
      await cancelMaryFutureBookings(biz.id, customerId);
    }
  }

  return { guestId, shopsLinked, upcomingEnsured };
}
