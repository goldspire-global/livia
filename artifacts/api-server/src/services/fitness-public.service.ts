import { db, classEnrollmentsTable, classSessionsTable } from "@workspace/db";
import { and, eq, gte, inArray } from "drizzle-orm";
import { enrollInClass, listClassSessions } from "./class-sessions.service";

export async function listPublicFitnessClasses(businessId: string) {
  const from = new Date().toISOString();
  const to = new Date(Date.now() + 14 * 86_400_000).toISOString();
  const sessions = await listClassSessions(businessId, { from, to });
  if (sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id);
  const counts = await db
    .select({
      sessionId: classEnrollmentsTable.sessionId,
      enrolled: classEnrollmentsTable.id,
    })
    .from(classEnrollmentsTable)
    .where(
      and(
        inArray(classEnrollmentsTable.sessionId, sessionIds),
        eq(classEnrollmentsTable.status, "enrolled"),
      ),
    );

  const enrolledBySession = new Map<string, number>();
  for (const row of counts) {
    enrolledBySession.set(row.sessionId, (enrolledBySession.get(row.sessionId) ?? 0) + 1);
  }

  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
    capacity: s.capacity,
    enrolled: enrolledBySession.get(s.id) ?? 0,
    spotsLeft: Math.max(0, s.capacity - (enrolledBySession.get(s.id) ?? 0)),
    status: s.status,
  }));
}

export async function publicEnrollInClass(
  businessId: string,
  sessionId: string,
  customerId: string,
) {
  return enrollInClass(businessId, sessionId, customerId);
}

export async function listGuestFitnessEnrollments(
  businessId: string,
  customerId: string,
  limit = 4,
) {
  const now = new Date();
  const rows = await db
    .select({
      title: classSessionsTable.title,
      startsAt: classSessionsTable.startsAt,
      status: classEnrollmentsTable.status,
      waitlistPosition: classEnrollmentsTable.waitlistPosition,
    })
    .from(classEnrollmentsTable)
    .innerJoin(classSessionsTable, eq(classEnrollmentsTable.sessionId, classSessionsTable.id))
    .where(
      and(
        eq(classSessionsTable.businessId, businessId),
        eq(classEnrollmentsTable.customerId, customerId),
        gte(classSessionsTable.startsAt, now),
        inArray(classEnrollmentsTable.status, ["enrolled", "waitlisted"]),
      ),
    )
    .orderBy(classSessionsTable.startsAt)
    .limit(limit);

  return rows.map((r) => ({
    title: r.title,
    startsAt: r.startsAt.toISOString(),
    status: r.status,
    waitlistPosition: r.waitlistPosition,
  }));
}
