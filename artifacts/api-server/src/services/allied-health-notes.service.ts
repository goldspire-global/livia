import { db, alliedClinicalNotesTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { generateId } from "../lib/id";

export async function listAlliedClinicalNotes(
  businessId: string,
  customerId: string,
  limit = 20,
) {
  return db
    .select()
    .from(alliedClinicalNotesTable)
    .where(
      and(
        eq(alliedClinicalNotesTable.businessId, businessId),
        eq(alliedClinicalNotesTable.customerId, customerId),
      ),
    )
    .orderBy(desc(alliedClinicalNotesTable.createdAt))
    .limit(limit);
}

export async function createAlliedClinicalNote(
  businessId: string,
  input: {
    customerId: string;
    bookingId?: string;
    authorUserId?: string;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  },
) {
  const id = generateId();
  const [row] = await db
    .insert(alliedClinicalNotesTable)
    .values({
      id,
      businessId,
      customerId: input.customerId,
      bookingId: input.bookingId ?? null,
      authorUserId: input.authorUserId ?? null,
      subjective: input.subjective?.trim() || null,
      objective: input.objective?.trim() || null,
      assessment: input.assessment?.trim() || null,
      plan: input.plan?.trim() || null,
    })
    .returning();
  return row;
}
