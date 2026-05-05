import { db, availabilityRulesTable, timeOffTable, bookingsTable, servicesTable } from "@workspace/db";
import { eq, and, gte, lte, or } from "drizzle-orm";
type Slot = {
  startAt: string;
  endAt: string;
  staffId: string | null;
  staffDisplayName: string | null;
  available: boolean;
};

const DAY_MS = 86_400_000;

export async function getAvailableSlots(opts: {
  businessId: string;
  serviceId: string;
  date: string; // "YYYY-MM-DD"
  staffId?: string;
  timezone: string;
}): Promise<Slot[]> {
  const { businessId, serviceId, date, staffId, timezone } = opts;

  // Load service for duration
  const [service] = await db
    .select()
    .from(servicesTable)
    .where(and(eq(servicesTable.id, serviceId), eq(servicesTable.businessId, businessId)));

  if (!service) return [];

  const durationMs = (service.durationMinutes + service.bufferAfterMinutes) * 60_000;
  const bufferBeforeMs = service.bufferBeforeMinutes * 60_000;

  // Parse the date into start/end of day in the given timezone
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  // Load availability rules for business or staff
  const rulesQuery = db
    .select()
    .from(availabilityRulesTable)
    .where(
      and(
        staffId
          ? eq(availabilityRulesTable.staffId, staffId)
          : eq(availabilityRulesTable.businessId, businessId),
        eq(availabilityRulesTable.isActive, true),
      ),
    );
  const rules = await rulesQuery;

  // Day of week in local time (simplified — using UTC here as proxy)
  const dayOfWeek = dayStart.getDay();
  const dayRules = rules.filter((r) => r.dayOfWeek === dayOfWeek);

  if (dayRules.length === 0) return [];

  // Load time-off blocking this day
  const timeOffs = await db
    .select()
    .from(timeOffTable)
    .where(
      and(
        staffId
          ? eq(timeOffTable.staffId, staffId)
          : eq(timeOffTable.businessId, businessId),
        lte(timeOffTable.startsAt, dayEnd),
        gte(timeOffTable.endsAt, dayStart),
      ),
    );

  // Load existing bookings for this day
  const existingBookings = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.businessId, businessId),
        staffId ? eq(bookingsTable.staffId, staffId) : undefined,
        gte(bookingsTable.startAt, dayStart),
        lte(bookingsTable.startAt, dayEnd),
        or(
          eq(bookingsTable.status, "CONFIRMED"),
          eq(bookingsTable.status, "PENDING"),
        ),
      ),
    );

  const slots: Slot[] = [];

  for (const rule of dayRules) {
    const [startH, startM] = rule.startTime.split(":").map(Number);
    const [endH, endM] = rule.endTime.split(":").map(Number);

    let cursor = new Date(dayStart);
    cursor.setHours(startH, startM, 0, 0);
    const ruleEnd = new Date(dayStart);
    ruleEnd.setHours(endH, endM, 0, 0);

    while (cursor.getTime() + durationMs <= ruleEnd.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + durationMs);
      const slotStartWithBuffer = new Date(cursor.getTime() - bufferBeforeMs);

      // Check time off conflict
      const blockedByTimeOff = timeOffs.some(
        (to) => slotEnd > to.startsAt && slotStartWithBuffer < to.endsAt,
      );

      // Check booking conflict
      const blockedByBooking = existingBookings.some((b) => {
        const bEnd = b.endAt;
        const bStart = b.startAt;
        return slotEnd > bStart && slotStartWithBuffer < bEnd;
      });

      const available = !blockedByTimeOff && !blockedByBooking;

      // Only add future slots
      if (slotStart > new Date()) {
        slots.push({
          startAt: slotStart.toISOString(),
          endAt: slotEnd.toISOString(),
          staffId: staffId ?? null,
          staffDisplayName: null,
          available,
        });
      }

      // Advance by 30-minute increments
      cursor = new Date(cursor.getTime() + 30 * 60_000);
    }
  }

  return slots;
}
