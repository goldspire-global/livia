import { db, bookingResourcesTable, servicesTable, bookingsTable } from "@workspace/db";
import { eq, and, or, gte, lte, sql, asc } from "drizzle-orm";
import { WELLNESS_ROOM_TURNOVER_MINUTES } from "@workspace/policy";
import { generateId } from "../lib/id";

export async function listBookingResources(businessId: string, activeOnly = true) {
  const conditions = [eq(bookingResourcesTable.businessId, businessId)];
  if (activeOnly) conditions.push(eq(bookingResourcesTable.isActive, true));
  return db
    .select()
    .from(bookingResourcesTable)
    .where(and(...conditions))
    .orderBy(asc(bookingResourcesTable.sortOrder));
}

export async function createBookingResource(
  businessId: string,
  input: {
    name: string;
    resourceType: "room" | "equipment" | "thermal";
    capacity?: number;
    sortOrder?: number;
  },
) {
  const [row] = await db
    .insert(bookingResourcesTable)
    .values({
      id: generateId(),
      businessId,
      name: input.name.trim(),
      resourceType: input.resourceType,
      capacity: Math.max(1, input.capacity ?? 1),
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return row ?? null;
}

export async function updateBookingResource(
  businessId: string,
  resourceId: string,
  patch: Partial<{
    name: string;
    capacity: number;
    isActive: boolean;
    sortOrder: number;
  }>,
) {
  const [row] = await db
    .update(bookingResourcesTable)
    .set({ ...patch, updatedAt: new Date() })
    .where(
      and(
        eq(bookingResourcesTable.id, resourceId),
        eq(bookingResourcesTable.businessId, businessId),
      ),
    )
    .returning();
  return row ?? null;
}

/** Count overlapping bookings against resource capacity for a time window. */
export async function resourceCapacityAvailable(opts: {
  businessId: string;
  resourceId: string;
  startAt: Date;
  endAt: Date;
  excludeBookingId?: string;
  /** Extra minutes after endAt before the room is free (wellness turnover). */
  turnoverMinutes?: number;
}): Promise<boolean> {
  const [resource] = await db
    .select()
    .from(bookingResourcesTable)
    .where(
      and(
        eq(bookingResourcesTable.id, opts.resourceId),
        eq(bookingResourcesTable.businessId, opts.businessId),
        eq(bookingResourcesTable.isActive, true),
      ),
    );
  if (!resource) return false;

  const turnoverMs = Math.max(0, opts.turnoverMinutes ?? 0) * 60_000;
  const windowStart = opts.startAt;
  const windowEnd = new Date(opts.endAt.getTime() + turnoverMs);

  const conditions = [
    eq(bookingsTable.businessId, opts.businessId),
    eq(bookingsTable.resourceId, opts.resourceId),
    or(eq(bookingsTable.status, "CONFIRMED"), eq(bookingsTable.status, "PENDING")),
    lte(bookingsTable.startAt, windowEnd),
    gte(bookingsTable.endAt, windowStart),
  ];
  if (opts.excludeBookingId) {
    conditions.push(sql`${bookingsTable.id} <> ${opts.excludeBookingId}`);
  }

  const overlapping = await db
    .select({
      id: bookingsTable.id,
      startAt: bookingsTable.startAt,
      endAt: bookingsTable.endAt,
    })
    .from(bookingsTable)
    .where(and(...conditions));

  const conflicts = overlapping.filter((row) => {
    const otherEnd = new Date(row.endAt.getTime() + turnoverMs);
    return row.startAt < windowEnd && otherEnd > windowStart;
  });

  return conflicts.length < resource.capacity;
}

export async function resolveResourceForService(
  businessId: string,
  serviceId: string,
  explicitResourceId?: string,
): Promise<string | null> {
  if (explicitResourceId) return explicitResourceId;
  const [svc] = await db
    .select({ requiredResourceId: servicesTable.requiredResourceId })
    .from(servicesTable)
    .where(and(eq(servicesTable.id, serviceId), eq(servicesTable.businessId, businessId)));
  return svc?.requiredResourceId ?? null;
}

/** Turnover buffer minutes when assigning room-type resources. */
export function resolveResourceTurnoverMinutes(
  resourceType: "room" | "equipment" | "thermal",
): number {
  if (resourceType === "room") {
    return WELLNESS_ROOM_TURNOVER_MINUTES;
  }
  return 0;
}
