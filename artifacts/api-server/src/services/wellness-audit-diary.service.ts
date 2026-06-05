import { searchAuditLog } from "./audit-log.service";
import { db, bookingsTable, livEntityMemoryTable } from "@workspace/db";
import { and, desc, eq, gte } from "drizzle-orm";

export async function listWellnessAuditDiary(
  businessId: string,
  opts?: { limit?: number; sinceDays?: number },
) {
  const limit = opts?.limit ?? 50;
  const since = new Date();
  since.setDate(since.getDate() - (opts?.sinceDays ?? 14));

  const { data: auditRows } = await searchAuditLog(businessId, {
    from: since.toISOString(),
    limit: Math.min(limit, 30),
  });

  const recentBookings = await db
    .select({
      id: bookingsTable.id,
      status: bookingsTable.status,
      updatedAt: bookingsTable.updatedAt,
      pendingReason: bookingsTable.pendingReason,
    })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.businessId, businessId), gte(bookingsTable.updatedAt, since)))
    .orderBy(desc(bookingsTable.updatedAt))
    .limit(20);

  const memoryAdds = await db
    .select({
      id: livEntityMemoryTable.id,
      kind: livEntityMemoryTable.kind,
      createdAt: livEntityMemoryTable.createdAt,
    })
    .from(livEntityMemoryTable)
    .where(
      and(
        eq(livEntityMemoryTable.businessId, businessId),
        gte(livEntityMemoryTable.createdAt, since),
      ),
    )
    .orderBy(desc(livEntityMemoryTable.createdAt))
    .limit(15);

  const lines = [
    ...auditRows.map((r) => ({
      at: r.occurredAt,
      kind: "audit" as const,
      line: `${r.actorKind}: ${r.actionClass} on ${r.resourceKind}`,
    })),
    ...recentBookings.map((b) => ({
      at: b.updatedAt.toISOString(),
      kind: "booking" as const,
      line: `Booking ${b.id.slice(0, 8)} → ${b.status}${b.pendingReason ? ` (${b.pendingReason})` : ""}`,
    })),
    ...memoryAdds.map((m) => ({
      at: m.createdAt.toISOString(),
      kind: "memory" as const,
      line: `Liv memory added: ${m.kind}`,
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);

  return { lines, generatedAt: new Date().toISOString() };
}
