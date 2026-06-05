import { db, bookingsTable } from "@workspace/db";
import { and, eq, gte } from "drizzle-orm";

/** Mindbody/Fresha parallel run — Livia truth vs external import placeholder. */
export async function getParallelRunDiff(businessId: string, external: "mindbody" | "fresha") {
  const since = new Date();
  since.setDate(since.getDate() - 1);
  const livia = await db
    .select({ id: bookingsTable.id, startAt: bookingsTable.startAt, status: bookingsTable.status })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.businessId, businessId), gte(bookingsTable.startAt, since)));

  return {
    external,
    liviaCount: livia.length,
    externalCount: 0,
    onlyInLivia: livia.map((b) => b.id),
    onlyInExternal: [] as string[],
    note:
      external === "mindbody"
        ? "Set MINDBODY_API_KEY and run sync to populate external side of diff."
        : "Set FRESHA_CLIENT_ID and run OAuth import for live diff.",
  };
}
