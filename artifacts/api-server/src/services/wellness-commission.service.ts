import { db, bookingsTable, staffTable, servicesTable } from "@workspace/db";
import { and, eq, gte } from "drizzle-orm";

export async function buildWellnessCommissionCsv(businessId: string): Promise<string> {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const rows = await db
    .select({
      staffName: staffTable.displayName,
      serviceName: servicesTable.name,
      durationMinutes: servicesTable.durationMinutes,
      startAt: bookingsTable.startAt,
      status: bookingsTable.status,
    })
    .from(bookingsTable)
    .innerJoin(staffTable, eq(bookingsTable.staffId, staffTable.id))
    .innerJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
    .where(
      and(
        eq(bookingsTable.businessId, businessId),
        gte(bookingsTable.startAt, since),
        eq(bookingsTable.status, "COMPLETED"),
      ),
    );

  const header = "therapist,service,duration_minutes,start_at";
  const body = rows
    .map((r) =>
      [
        r.staffName,
        r.serviceName,
        String(r.durationMinutes ?? 60),
        r.startAt.toISOString(),
      ].join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}
