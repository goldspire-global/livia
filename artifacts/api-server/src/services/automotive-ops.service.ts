/**
 * Automotive detailing ops — bay utilisation board (Innovation P0).
 */
import { db, bookingResourcesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateId } from "../lib/id";
import { listBookingResources } from "./booking-resources.service";

const DEFAULT_BAYS = [
  { name: "Bay 1 — detail", resourceType: "equipment" as const, capacity: 1, sortOrder: 1 },
  { name: "Bay 2 — ceramic", resourceType: "equipment" as const, capacity: 1, sortOrder: 2 },
  { name: "Pickup lane", resourceType: "equipment" as const, capacity: 2, sortOrder: 3 },
];

/** Idempotent demo/showcase bays for automotive verticals. */
export async function ensureAutomotiveBayResources(businessId: string): Promise<void> {
  const existing = await listBookingResources(businessId, true);
  if (existing.length > 0) return;

  for (const bay of DEFAULT_BAYS) {
    await db.insert(bookingResourcesTable).values({
      id: generateId(),
      businessId,
      name: bay.name,
      resourceType: bay.resourceType,
      capacity: bay.capacity,
      sortOrder: bay.sortOrder,
      isActive: true,
    });
  }
}
