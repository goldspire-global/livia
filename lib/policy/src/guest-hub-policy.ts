/**
 * Guest hub (W6) — vault curation rules shared by API + demo seed.
 */

export const GUEST_HUB_DEMO_BOOKING_NOTE = "Demo guest hub — Mary McNamara";

/** Max upcoming visits shown on `/my` — avoids operator live-day noise. */
export const GUEST_HUB_UPCOMING_MAX_TOTAL = 8;

/** One next visit per linked studio on the guest surface. */
export const GUEST_HUB_UPCOMING_MAX_PER_SHOP = 1;

export type GuestHubUpcomingRow = {
  bookingId: string;
  businessId: string;
  startAt: string | Date;
  status?: string;
  notes?: string | null;
};

function startMs(row: GuestHubUpcomingRow): number {
  const d = row.startAt instanceof Date ? row.startAt : new Date(row.startAt);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function isGuestHubSeeded(row: GuestHubUpcomingRow): boolean {
  return (row.notes ?? "").includes("Demo guest hub");
}

/**
 * Prefer seeded guest-hub rows; otherwise earliest per shop.
 * Caps total for a realistic vault (not 18 same-day operator demos).
 */
export function curateGuestHubUpcoming<T extends GuestHubUpcomingRow>(rows: T[]): T[] {
  const byBusiness = new Map<string, T[]>();
  for (const row of rows) {
    const list = byBusiness.get(row.businessId) ?? [];
    list.push(row);
    byBusiness.set(row.businessId, list);
  }

  const picked: T[] = [];
  for (const group of byBusiness.values()) {
    const seeded = group.filter(isGuestHubSeeded);
    const pool = seeded.length > 0 ? seeded : group;
    pool.sort((a, b) => startMs(a) - startMs(b));
    if (pool[0]) picked.push(pool[0]);
  }

  picked.sort((a, b) => startMs(a) - startMs(b));
  return picked.slice(0, GUEST_HUB_UPCOMING_MAX_TOTAL);
}

/** Realistic spread for Mary hero demos (days from today). */
export const MARY_GUEST_HUB_UPCOMING_DAYS: Record<string, number> = {
  "luxe-salon-spa": 4,
  "bloom-beauty-dublin": 9,
  "harbour-wellness-cork": 14,
  "motion-physio-cork": 21,
  "ink-anchor-galway": 28,
};
