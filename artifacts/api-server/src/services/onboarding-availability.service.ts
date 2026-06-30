import { DEFAULT_WEEKDAY_AVAILABILITY } from "@workspace/policy";
import { listAvailabilityRules, setAvailabilityRules } from "./availability.service";

/** Seed Mon–Fri 9–5 on the owner/staff member so public book has slots after create. */
export async function seedDefaultStaffAvailability(
  businessId: string,
  staffId: string,
): Promise<{ seeded: boolean }> {
  const existing = await listAvailabilityRules(businessId, staffId);
  if (existing.length > 0) return { seeded: false };
  await setAvailabilityRules(businessId, [...DEFAULT_WEEKDAY_AVAILABILITY], staffId);
  return { seeded: true };
}
