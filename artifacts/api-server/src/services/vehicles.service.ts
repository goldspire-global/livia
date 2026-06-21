import { and, eq } from "drizzle-orm";
import { db, vehiclesTable } from "@workspace/db";
import { generateId } from "../lib/id";

export async function listVehiclesForCustomer(businessId: string, customerId: string) {
  return db
    .select()
    .from(vehiclesTable)
    .where(and(eq(vehiclesTable.businessId, businessId), eq(vehiclesTable.customerId, customerId)));
}

export async function createVehicle(
  businessId: string,
  customerId: string,
  data: {
    make?: string;
    model: string;
    registration?: string;
    colour?: string;
    notes?: string;
  },
) {
  const id = generateId();
  const [row] = await db
    .insert(vehiclesTable)
    .values({
      id,
      businessId,
      customerId,
      make: data.make?.trim() || null,
      model: data.model.trim(),
      registration: data.registration?.trim() || null,
      colour: data.colour?.trim() || null,
      notes: data.notes?.trim() || null,
    })
    .returning();
  return row;
}

export function formatVehicleLabel(v: {
  make?: string | null;
  model: string;
  registration?: string | null;
  colour?: string | null;
}): string {
  const parts = [v.make, v.model].filter(Boolean).join(" ");
  const reg = v.registration ? ` · ${v.registration}` : "";
  const colour = v.colour ? ` (${v.colour})` : "";
  return `${parts}${reg}${colour}`.trim();
}

export async function primaryVehicleHighlight(
  businessId: string,
  customerId: string,
): Promise<string | null> {
  const rows = await listVehiclesForCustomer(businessId, customerId);
  if (rows.length === 0) return null;
  return formatVehicleLabel(rows[0]!);
}
