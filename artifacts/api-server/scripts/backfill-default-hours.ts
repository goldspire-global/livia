/**
 * Seed Mon–Fri 9–5 on staff with no availability rules (founder unblock / migration).
 *
 * Usage:
 *   tsx scripts/backfill-default-hours.ts imd-allied-health
 *   tsx scripts/backfill-default-hours.ts --all
 *
 * Prod:
 *   node scripts/with-db-target.mjs --prod pnpm --filter @workspace/api-server exec tsx scripts/backfill-default-hours.ts imd-allied-health
 */
import { db, businessesTable, staffTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { listAvailabilityRules } from "../src/services/availability.service.js";
import { seedDefaultStaffAvailability } from "../src/services/onboarding-availability.service.js";

const arg = process.argv[2]?.trim();
const allShops = arg === "--all";

async function backfillBusiness(businessId: string, slug: string) {
  const staff = await db
    .select({ id: staffTable.id, displayName: staffTable.displayName })
    .from(staffTable)
    .where(eq(staffTable.businessId, businessId));

  if (staff.length === 0) {
    console.log(`  ${slug}: no staff — skip`);
    return { slug, seeded: 0, skipped: 0 };
  }

  let seeded = 0;
  let skipped = 0;
  for (const member of staff) {
    const rules = await listAvailabilityRules(businessId, member.id);
    if (rules.length > 0) {
      skipped++;
      continue;
    }
    await seedDefaultStaffAvailability(businessId, member.id);
    seeded++;
    console.log(`  ${slug}: seeded hours for ${member.displayName ?? member.id}`);
  }
  return { slug, seeded, skipped };
}

async function main() {
  if (!arg) {
    console.error("Usage: tsx scripts/backfill-default-hours.ts <slug> | --all");
    process.exit(1);
  }

  const businesses = allShops
    ? await db.select({ id: businessesTable.id, slug: businessesTable.slug }).from(businessesTable)
    : await db
        .select({ id: businessesTable.id, slug: businessesTable.slug })
        .from(businessesTable)
        .where(eq(businessesTable.slug, arg));

  if (businesses.length === 0) {
    console.error(allShops ? "No businesses found." : `No business for slug: ${arg}`);
    process.exit(1);
  }

  console.log(`Backfilling default hours (${businesses.length} shop(s))…`);
  let totalSeeded = 0;
  for (const biz of businesses) {
    const result = await backfillBusiness(biz.id, biz.slug);
    totalSeeded += result.seeded;
  }
  console.log(`Done. Seeded ${totalSeeded} staff member(s).`);
}

await main();
