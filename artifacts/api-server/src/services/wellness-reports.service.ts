import {
  db,
  bookingsTable,
  bookingResourcesTable,
  servicesTable,
  packageCreditLedgerTable,
  customersTable,
  livEntityMemoryTable,
} from "@workspace/db";
import { and, eq, gte, lte, lt, inArray, sql, desc } from "drizzle-orm";
import { WELLNESS_STRESS_WEIGHTS } from "@workspace/policy";
import { getPackageCreditSummary } from "./package-credits.service";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export async function getWellnessReportsBundle(businessId: string) {
  const now = new Date();
  const weekStart = startOfDay(now);
  const weekEnd = addDays(weekStart, 7);
  const tomorrowStart = addDays(startOfDay(now), 1);
  const tomorrowEnd = addDays(tomorrowStart, 1);

  const [resources, weekBookings, tomorrowBookings, packageSummary, ledgerRows] =
    await Promise.all([
      db
        .select()
        .from(bookingResourcesTable)
        .where(eq(bookingResourcesTable.businessId, businessId)),
      db
        .select({
          booking: bookingsTable,
          serviceName: servicesTable.name,
          durationMinutes: servicesTable.durationMinutes,
        })
        .from(bookingsTable)
        .innerJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
        .where(
          and(
            eq(bookingsTable.businessId, businessId),
            gte(bookingsTable.startAt, weekStart),
            lte(bookingsTable.startAt, weekEnd),
          ),
        ),
      db
        .select({ booking: bookingsTable })
        .from(bookingsTable)
        .where(
          and(
            eq(bookingsTable.businessId, businessId),
            gte(bookingsTable.startAt, tomorrowStart),
            lte(bookingsTable.startAt, tomorrowEnd),
          ),
        ),
      getPackageCreditSummary(businessId),
      listPackageCreditsExpiring(businessId, 30),
    ]);

  const roomHeatmap = buildRoomHeatmap(resources, weekBookings);
  const salesByService = buildSalesByService(weekBookings);
  const waterfall = {
    sold: packageSummary.creditsSold,
    redeemed: packageSummary.creditsRedeemed,
    remaining: packageSummary.creditsRemaining,
    expiring30d: ledgerRows.reduce((n, r) => n + r.creditsRemaining, 0),
    ledgerCount: packageSummary.ledgerCount,
  };

  const pendingTomorrow = tomorrowBookings.filter((b) => b.booking.status === "PENDING").length;
  const roomIds = resources.map((r) => r.id);
  const tomorrowWithResource = tomorrowBookings.filter((b) => b.booking.resourceId);
  const conflicts = countOverlaps(tomorrowWithResource.map((b) => b.booking));

  const stressScore = Math.min(
    WELLNESS_STRESS_WEIGHTS.cap,
    pendingTomorrow * WELLNESS_STRESS_WEIGHTS.perPending +
      conflicts * WELLNESS_STRESS_WEIGHTS.perRoomConflict +
      ledgerRows.length * WELLNESS_STRESS_WEIGHTS.perExpiringVoucher,
  );

  const livInterventions = {
    confirmed: weekBookings.filter((b) => b.booking.status === "CONFIRMED").length,
    pending: weekBookings.filter((b) => b.booking.status === "PENDING").length,
    cancelled: weekBookings.filter((b) => b.booking.status === "CANCELLED").length,
    note: "Liv tool audit depth expands in Track G — counts from schedule truth this week.",
  };

  const expiringLedgers = await listPackageCreditsExpiring(businessId, 30);
  const extended = await buildExtendedAnalytics(
    businessId,
    weekBookings,
    resources,
    expiringLedgers,
  );

  return {
    generatedAt: now.toISOString(),
    roomHeatmap,
    salesByService,
    packageWaterfall: waterfall,
    tomorrowStress: {
      score: stressScore,
      pendingBookings: pendingTomorrow,
      roomConflicts: conflicts,
      expiringVouchers: ledgerRows.length,
    },
    livInterventions,
    roomIds,
    ...extended,
  };
}

async function buildExtendedAnalytics(
  businessId: string,
  weekBookings: Array<{
    booking: typeof bookingsTable.$inferSelect;
    serviceName: string;
  }>,
  resources: Array<{ id: string; name: string }>,
  expiringLedgers: Awaited<ReturnType<typeof listPackageCreditsExpiring>>,
) {
  const now = new Date();
  const d30 = addDays(now, -30);
  const d60 = addDays(now, -60);
  const d90 = addDays(now, -90);

  const allBookings = await db
    .select({
      customerId: bookingsTable.customerId,
      startAt: bookingsTable.startAt,
      status: bookingsTable.status,
      source: bookingsTable.source,
      staffId: bookingsTable.staffId,
    })
    .from(bookingsTable)
    .where(
      and(eq(bookingsTable.businessId, businessId), gte(bookingsTable.startAt, d90)),
    );

  const completed = allBookings.filter((b) => b.status === "COMPLETED");
  const customerLast = new Map<string, Date>();
  for (const b of completed) {
    const prev = customerLast.get(b.customerId);
    if (!prev || b.startAt > prev) customerLast.set(b.customerId, b.startAt);
  }
  const uniqueCustomers = new Set(completed.map((b) => b.customerId));
  const rebook30 = [...uniqueCustomers].filter((cid) => {
    const last = customerLast.get(cid);
    return last && last >= d30;
  }).length;

  const retention = {
    uniqueGuests90d: uniqueCustomers.size,
    active30d: rebook30,
    active60d: [...uniqueCustomers].filter((cid) => {
      const last = customerLast.get(cid);
      return last && last >= d60;
    }).length,
  };

  const noShows = allBookings.filter((b) => b.status === "NO_SHOW").length;
  const late = allBookings.filter((b) => b.status === "PENDING").length;

  const sourceMap = new Map<string, number>();
  for (const b of weekBookings) {
    if (b.booking.status === "CANCELLED") continue;
    const src = b.booking.source ?? "direct";
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1);
  }

  const guestJourney = {
    booked: weekBookings.length,
    confirmed: weekBookings.filter((b) => b.booking.status === "CONFIRMED").length,
    completed: weekBookings.filter((b) => b.booking.status === "COMPLETED").length,
    cancelled: weekBookings.filter((b) => b.booking.status === "CANCELLED").length,
    pending: weekBookings.filter((b) => b.booking.status === "PENDING").length,
  };

  const weekSwimlane = buildWeekSwimlane(resources, weekBookings);

  const memoryRows = await db
    .select({ kind: livEntityMemoryTable.kind, content: livEntityMemoryTable.content })
    .from(livEntityMemoryTable)
    .where(
      and(
        eq(livEntityMemoryTable.businessId, businessId),
        eq(livEntityMemoryTable.entityType, "customer"),
      ),
    )
    .limit(200);

  const prefCounts = new Map<string, number>();
  for (const m of memoryRows) {
    if (m.kind === "pressure" || m.kind === "therapist_pref" || m.kind === "preference") {
      const key = m.kind;
      prefCounts.set(key, (prefCounts.get(key) ?? 0) + 1);
    }
  }
  const preferenceCloud = [...prefCounts.entries()].map(([kind, count]) => ({ kind, count }));

  const depositRows = await db
    .select({
      depositPaidEurCents: bookingsTable.depositPaidEurCents,
      status: bookingsTable.status,
    })
    .from(bookingsTable)
    .where(eq(bookingsTable.businessId, businessId));

  const depositEscrow = {
    heldMinor: depositRows
      .filter((b) => b.status === "PENDING" && (b.depositPaidEurCents ?? 0) > 0)
      .reduce((s, b) => s + (b.depositPaidEurCents ?? 0), 0),
    capturedMinor: depositRows
      .filter(
        (b) =>
          (b.status === "CONFIRMED" || b.status === "COMPLETED") &&
          (b.depositPaidEurCents ?? 0) > 0,
      )
      .reduce((s, b) => s + (b.depositPaidEurCents ?? 0), 0),
  };

  const marketplaceBookings = weekBookings.filter((b) =>
    (b.booking.source ?? "").toLowerCase().includes("treatwell"),
  ).length;

  return {
    retention,
    noShowLate: { noShows, latePending: late },
    marketingBySource: [...sourceMap.entries()].map(([source, count]) => ({ source, count })),
    guestJourney,
    weekSwimlane,
    preferenceCloud,
    depositEscrow,
    marketplaceMargin: {
      marketplaceBookings,
      note: "Net margin after marketplace fee — configure fee % in Track O.",
    },
    breakageTasks: expiringLedgers.map((r) => ({
      ledgerId: r.id,
      packageName: r.packageName,
      creditsRemaining: r.creditsRemaining,
      expiresAt: r.expiresAt?.toISOString() ?? null,
      task: "Liv nudge: package expiring — offer rebook",
    })),
  };
}

function buildWeekSwimlane(
  resources: Array<{ id: string; name: string }>,
  rows: Array<{ booking: { startAt: Date; endAt: Date; resourceId: string | null; status: string } }>,
) {
  const days = 7;
  const lanes = resources.map((room) => {
    const segments: Array<{ dayOffset: number; state: "booked" | "idle" | "turnover" }> = [];
    for (let d = 0; d < days; d++) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() + d);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const hits = rows.filter(
        (r) =>
          r.booking.resourceId === room.id &&
          r.booking.status !== "CANCELLED" &&
          r.booking.startAt >= dayStart &&
          r.booking.startAt <= dayEnd,
      );
      segments.push({ dayOffset: d, state: hits.length > 0 ? "booked" : "idle" });
    }
    return { roomId: room.id, roomName: room.name, segments };
  });
  return lanes;
}

export async function listPackageCreditsExpiring(businessId: string, withinDays: number) {
  const until = addDays(new Date(), withinDays);
  return db
    .select()
    .from(packageCreditLedgerTable)
    .where(
      and(
        eq(packageCreditLedgerTable.businessId, businessId),
        sql`${packageCreditLedgerTable.expiresAt} IS NOT NULL`,
        lte(packageCreditLedgerTable.expiresAt, until),
        sql`${packageCreditLedgerTable.creditsRemaining} > 0`,
      ),
    );
}

function buildRoomHeatmap(
  resources: Array<{ id: string; name: string }>,
  rows: Array<{
    booking: { startAt: Date; endAt: Date; resourceId: string | null; status: string };
  }>,
) {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  return resources.map((room) => ({
    roomId: room.id,
    roomName: room.name,
    hours: hours.map((hour) => {
      const slotStart = hour;
      const booked = rows.filter(
        (r) =>
          r.booking.resourceId === room.id &&
          r.booking.status !== "CANCELLED" &&
          r.booking.startAt.getHours() <= slotStart &&
          r.booking.endAt.getHours() > slotStart,
      ).length;
      return { hour, state: booked > 0 ? ("booked" as const) : ("idle" as const), count: booked };
    }),
  }));
}

function buildSalesByService(
  rows: Array<{ serviceName: string; durationMinutes: number | null; booking: { status: string } }>,
) {
  const map = new Map<string, { count: number; minutes: number }>();
  for (const r of rows) {
    if (r.booking.status === "CANCELLED") continue;
    const cur = map.get(r.serviceName) ?? { count: 0, minutes: 0 };
    cur.count += 1;
    cur.minutes += r.durationMinutes ?? 60;
    map.set(r.serviceName, cur);
  }
  return [...map.entries()]
    .map(([name, v]) => ({ serviceName: name, bookings: v.count, totalMinutes: v.minutes }))
    .sort((a, b) => b.bookings - a.bookings);
}

function countOverlaps(
  bookings: Array<{ startAt: Date; endAt: Date; resourceId: string | null }>,
): number {
  let conflicts = 0;
  const byRoom = new Map<string, typeof bookings>();
  for (const b of bookings) {
    if (!b.resourceId) continue;
    const list = byRoom.get(b.resourceId) ?? [];
    list.push(b);
    byRoom.set(b.resourceId, list);
  }
  for (const list of byRoom.values()) {
    const sorted = [...list].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i]!.startAt < sorted[i - 1]!.endAt) conflicts += 1;
    }
  }
  return conflicts;
}

export async function getPersonaDigestPreview(businessId: string, slug: string) {
  const bundle = await getWellnessReportsBundle(businessId);
  const summary = await getPackageCreditSummary(businessId);
  if (slug === "staff_day_sheet") {
    return {
      slug,
      title: "My day sheet",
      lines: [
        `${bundle.salesByService[0]?.serviceName ?? "Sessions"} on your roster today`,
        "Open mobile My Day for swipe-complete and turnover timer.",
      ],
    };
  }
  if (slug === "reception_handoffs") {
    return {
      slug,
      title: "Reception handoffs",
      lines: [
        `${bundle.tomorrowStress.pendingBookings} pending arrivals tomorrow`,
        "Check Inbox for threads waiting for a human reply.",
      ],
    };
  }
  if (slug === "host_rent_roll") {
    return {
      slug,
      title: "Host rent roll",
      lines: ["Room rental POV uses chair-rental host when enabled.", "Wellness multi-site: see Chain glance."],
    };
  }
  if (slug === "accountant_preview") {
    return {
      slug,
      title: "Accountant preview",
      lines: [
        `Package liability: ${summary.creditsRemaining} sessions remaining on ledger`,
        `Sold ${summary.creditsSold} · redeemed ${summary.creditsRedeemed}`,
        "Export settlement CSV from Integrations when Xero broker is connected.",
      ],
    };
  }
  if (slug === "manager_ops") {
    return {
      slug,
      title: "Manager ops",
      lines: [
        `Tomorrow stress score: ${bundle.tomorrowStress.score}/100`,
        `${bundle.tomorrowStress.pendingBookings} pending bookings tomorrow`,
        `${bundle.tomorrowStress.roomConflicts} room overlap risks`,
      ],
    };
  }
  if (slug === "owner_weekly") {
    return {
      slug,
      title: "Weekly digest",
      lines: [
        `${bundle.salesByService[0]?.serviceName ?? "—"} led session volume this week`,
        `Package waterfall: ${bundle.packageWaterfall.remaining} sessions unearned`,
        `Liv: ${bundle.livInterventions.confirmed} confirmed · ${bundle.livInterventions.pending} pending`,
      ],
    };
  }
  return {
    slug: "owner_morning",
    title: "Morning briefing",
    lines: [
      `Stress today+tomorrow: ${bundle.tomorrowStress.score}/100`,
      `${summary.activePackages} active packages on the books`,
      "Open Today for room board and pending reasons.",
    ],
  };
}
