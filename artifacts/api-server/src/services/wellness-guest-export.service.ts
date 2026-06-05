import { db, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function exportGuestListCsv(businessId: string): Promise<string> {
  const rows = await db
    .select({
      firstName: customersTable.firstName,
      lastName: customersTable.lastName,
      email: customersTable.email,
      phone: customersTable.phone,
      createdAt: customersTable.createdAt,
    })
    .from(customersTable)
    .where(eq(customersTable.businessId, businessId))
    .orderBy(customersTable.createdAt);

  const header = "first_name,last_name,email,phone,created_at";
  const body = rows
    .map((r) =>
      [
        csvEscape(r.firstName ?? ""),
        csvEscape(r.lastName ?? ""),
        csvEscape(r.email ?? ""),
        csvEscape(r.phone ?? ""),
        r.createdAt.toISOString(),
      ].join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

function csvEscape(v: string): string {
  if (v.includes(",") || v.includes('"')) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
