/**
 * End-of-day (local ~17:00) digest push for far-future booking in-app alerts.
 * Immediate act/watch items still push at event time via notification-orchestrator.
 */
import { and, eq, gte, isNull, sql } from "drizzle-orm";
import { businessesTable, db, userNotificationsTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { notifyUsersPush } from "./push.service";

function localHour(timezone: string, at: Date): number {
  try {
    const parts = new Intl.DateTimeFormat("en-IE", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).formatToParts(at);
    const h = parts.find((p) => p.type === "hour")?.value;
    return h ? Number(h) : -1;
  } catch {
    return -1;
  }
}

export async function runEveningNotificationRoundup(opts?: {
  /** Override hour gate for tests (local shop hour 0–23). */
  targetHour?: number;
}): Promise<{ businesses: number; pushes: number }> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const businesses = await db
    .select({ id: businessesTable.id, name: businessesTable.name, timezone: businessesTable.timezone })
    .from(businessesTable);

  let bizProcessed = 0;
  let pushes = 0;

  for (const biz of businesses) {
    const tz = biz.timezone ?? "Europe/Dublin";
    const hour = opts?.targetHour ?? localHour(tz, now);
    if (hour !== 17) continue;
    bizProcessed += 1;

    const rows = await db
      .select({
        userId: userNotificationsTable.userId,
        count: sql<number>`count(*)::int`,
      })
      .from(userNotificationsTable)
      .where(
        and(
          eq(userNotificationsTable.businessId, biz.id),
          isNull(userNotificationsTable.readAt),
          gte(userNotificationsTable.createdAt, startOfDay),
          sql`${userNotificationsTable.metadata}->>'digestBucket' = 'evening_roundup'`,
          sql`coalesce(${userNotificationsTable.metadata}->>'roundupPushed', 'false') = 'false'`,
        ),
      )
      .groupBy(userNotificationsTable.userId);

    for (const row of rows) {
      if ((row.count ?? 0) < 1) continue;
      const n = row.count;
      const result = await notifyUsersPush({
        userIds: [row.userId],
        title: `Diary roundup · ${biz.name}`,
        body:
          n === 1
            ? "1 new booking landed in your diary — open Livia to review."
            : `${n} new bookings landed in your diary — open Livia to review.`,
        data: { type: "booking.digest", businessId: biz.id },
        priority: "default",
      });
      if (result.sent > 0) pushes += 1;

      await db
        .update(userNotificationsTable)
        .set({
          metadata: sql`coalesce(${userNotificationsTable.metadata}, '{}'::jsonb) || '{"roundupPushed":true}'::jsonb`,
        })
        .where(
          and(
            eq(userNotificationsTable.businessId, biz.id),
            eq(userNotificationsTable.userId, row.userId),
            isNull(userNotificationsTable.readAt),
            gte(userNotificationsTable.createdAt, startOfDay),
            sql`${userNotificationsTable.metadata}->>'digestBucket' = 'evening_roundup'`,
          ),
        );
    }
  }

  logger.info({ businesses: bizProcessed, pushes }, "evening-notification-roundup.done");
  return { businesses: bizProcessed, pushes };
}
