import { and, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import {
  db,
  bookingsTable,
  businessesTable,
  customersTable,
} from "@workspace/db";
import {
  createBookingResource,
  listBookingResources,
} from "./booking-resources.service";
import { grantPackageCredits, listPackageCredits } from "./package-credits.service";

const WELLNESS_DEMO_ROOMS = [
  { name: "Serenity", sortOrder: 0 },
  { name: "Stillness", sortOrder: 1 },
  { name: "Garden", sortOrder: 2 },
] as const;

/** Idempotent Harbour-style room board + package credits for wellness showcase shops. */
export async function ensureWellnessShowcaseDepth(businessId: string): Promise<void> {
  const [biz] = await db
    .select({ vertical: businessesTable.vertical })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);
  if (biz?.vertical !== "wellness") return;

  const existing = await listBookingResources(businessId, false);
  const roomByName = new Map(existing.map((r) => [r.name, r]));

  for (const def of WELLNESS_DEMO_ROOMS) {
    if (!roomByName.has(def.name)) {
      const row = await createBookingResource(businessId, {
        name: def.name,
        resourceType: "room",
        capacity: 1,
        sortOrder: def.sortOrder,
      });
      if (row) roomByName.set(def.name, row);
    }
  }

  const rooms = [...roomByName.values()].filter((r) => r.resourceType === "room" && r.isActive);
  if (!rooms.length) return;

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const todayBookings = await db
    .select({ id: bookingsTable.id, resourceId: bookingsTable.resourceId })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.businessId, businessId),
        gte(bookingsTable.startAt, todayStart),
        lte(bookingsTable.startAt, todayEnd),
        inArray(bookingsTable.status, ["PENDING", "CONFIRMED"]),
        or(isNull(bookingsTable.resourceId)),
      ),
    )
    .orderBy(bookingsTable.startAt);

  let lane = 0;
  for (const booking of todayBookings) {
    const room = rooms[lane % rooms.length]!;
    lane += 1;
    await db
      .update(bookingsTable)
      .set({ resourceId: room.id, updatedAt: new Date() })
      .where(eq(bookingsTable.id, booking.id));
  }

  const credits = await listPackageCredits(businessId);
  if (credits.length >= 3) return;

  const customers = await db
    .select({ id: customersTable.id })
    .from(customersTable)
    .where(eq(customersTable.businessId, businessId))
    .limit(5);

  const packages = [
    { packageName: "Six-session massage series", creditsTotal: 6 },
    { packageName: "Gift voucher — 90 min", creditsTotal: 1 },
    { packageName: "Couples retreat bundle", creditsTotal: 2 },
  ];

  for (let i = 0; i < Math.min(customers.length, packages.length); i++) {
    const pkg = packages[i]!;
    if (credits.some((c) => c.packageName === pkg.packageName && c.customerId === customers[i]!.id)) {
      continue;
    }
    await grantPackageCredits(businessId, {
      customerId: customers[i]!.id,
      packageName: pkg.packageName,
      creditsTotal: pkg.creditsTotal,
      expiresAt: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString(),
    });
  }
}
