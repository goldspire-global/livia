/**
 * Seed starter pack + default hours for an existing shop missing staff/menu.
 *
 * Usage:
 *   tsx scripts/repair-shop-booking-readiness.ts imd-allied-health
 *
 * Prod:
 *   node scripts/with-db-target.mjs --prod pnpm --filter @workspace/api-server exec tsx scripts/repair-shop-booking-readiness.ts imd-allied-health
 */
import { db, businessesTable, staffTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getVerticalPack, type BusinessVertical } from "@workspace/policy";
import { listServices } from "../src/services/services.service.js";
import { createStaff, setStaffServices } from "../src/services/staff.service.js";
import { seedVerticalStarterPack } from "../src/services/vertical-starter-pack.service.js";
import { seedDefaultStaffAvailability } from "../src/services/onboarding-availability.service.js";
import { listAvailabilityRules } from "../src/services/availability.service.js";

const slug = process.argv[2]?.trim();
if (!slug) {
  console.error("Usage: tsx scripts/repair-shop-booking-readiness.ts <slug>");
  process.exit(1);
}

const [biz] = await db
  .select()
  .from(businessesTable)
  .where(eq(businessesTable.slug, slug))
  .limit(1);

if (!biz) {
  console.error("No business for slug:", slug);
  process.exit(1);
}

console.log("Repairing", biz.name, `(${biz.slug})`, biz.id);

const servicesBefore = await listServices(biz.id, true);
if (servicesBefore.length === 0) {
  const seeded = await seedVerticalStarterPack(biz.id);
  console.log("starter pack:", seeded);
} else {
  console.log("services already present:", servicesBefore.length);
}

let staff = await db
  .select({ id: staffTable.id, displayName: staffTable.displayName })
  .from(staffTable)
  .where(eq(staffTable.businessId, biz.id));

if (staff.length === 0 && servicesBefore.length > 0) {
  const vertical = (biz.vertical ?? "hair") as BusinessVertical;
  const template = getVerticalPack(vertical).defaultStaff[0];
  if (!template) {
    console.error("No default staff template for vertical:", vertical);
    process.exit(1);
  }
  const created = await createStaff(biz.id, {
    firstName: template.firstName,
    lastName: template.lastName,
    displayName: template.displayName,
    color: template.color,
  });
  const serviceIds = servicesBefore.map((s) => s.id);
  if (serviceIds.length > 0) {
    await setStaffServices(created.id, serviceIds);
  }
  staff = [{ id: created.id, displayName: created.displayName }];
  console.log("created owner staff:", created.displayName, "linked", serviceIds.length, "services");
}

if (staff.length === 0) {
  console.error("Still no staff — check vertical pack or run starter pack seed.");
  process.exit(1);
}

let hoursSeeded = 0;
for (const member of staff) {
  const rules = await listAvailabilityRules(biz.id, member.id);
  if (rules.length > 0) {
    console.log("hours ok:", member.displayName ?? member.id);
    continue;
  }
  await seedDefaultStaffAvailability(biz.id, member.id);
  hoursSeeded++;
  console.log("seeded hours:", member.displayName ?? member.id);
}

console.log(`Done — ${staff.length} staff, ${hoursSeeded} hour rule(s) added.`);
