import { and, eq } from "drizzle-orm";
import { db, petsTable, bookingPetsTable } from "@workspace/db";
import { generateId } from "../lib/id";

export async function listPetsForCustomer(businessId: string, customerId: string) {
  return db
    .select()
    .from(petsTable)
    .where(and(eq(petsTable.businessId, businessId), eq(petsTable.customerId, customerId)));
}

export async function createPet(
  businessId: string,
  customerId: string,
  data: {
    name: string;
    species?: string;
    breed?: string;
    behaviourNotes?: string;
    allergyNotes?: string;
    vaccinationNotes?: string;
  },
) {
  const id = generateId();
  const [row] = await db
    .insert(petsTable)
    .values({
      id,
      businessId,
      customerId,
      name: data.name,
      species: data.species ?? "dog",
      breed: data.breed ?? null,
      behaviourNotes: data.behaviourNotes ?? null,
      allergyNotes: data.allergyNotes ?? null,
      vaccinationNotes: data.vaccinationNotes ?? null,
    })
    .returning();
  return row;
}

export async function findOrCreatePetByName(
  businessId: string,
  customerId: string,
  data: {
    name: string;
    species?: string;
    breed?: string;
    behaviourNotes?: string;
  },
) {
  const name = data.name.trim();
  const existing = await db
    .select()
    .from(petsTable)
    .where(
      and(
        eq(petsTable.businessId, businessId),
        eq(petsTable.customerId, customerId),
        eq(petsTable.name, name),
      ),
    )
    .limit(1);
  if (existing[0]) return existing[0];
  return createPet(businessId, customerId, data);
}

export async function attachPetsToBooking(bookingId: string, petIds: string[]) {
  const unique = [...new Set(petIds.filter(Boolean))];
  if (unique.length === 0) return;
  await db
    .insert(bookingPetsTable)
    .values(unique.map((petId) => ({ bookingId, petId })))
    .onConflictDoNothing();
}
