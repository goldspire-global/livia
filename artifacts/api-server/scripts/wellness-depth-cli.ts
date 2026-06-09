import { eq } from "drizzle-orm";
import { db, businessesTable } from "@workspace/db";
import { ensureWellnessShowcaseDepth } from "../src/services/wellness-demo-depth.ts";
import { ensureWellnessDemoPresentationPreset } from "../src/services/demo-vertical-shops.seed.ts";

const slugs = ["harbour-wellness-cork", "copenhagen-havn-wellness"];

for (const slug of slugs) {
  const [biz] = await db
    .select({ id: businessesTable.id, name: businessesTable.name })
    .from(businessesTable)
    .where(eq(businessesTable.slug, slug))
    .limit(1);
  if (!biz) {
    console.warn(`Skip ${slug} — not in DB`);
    continue;
  }
  await ensureWellnessDemoPresentationPreset(biz.id);
  await ensureWellnessShowcaseDepth(biz.id);
  console.log(`✓ ${slug} (${biz.name}) — rooms + credits`);
}
