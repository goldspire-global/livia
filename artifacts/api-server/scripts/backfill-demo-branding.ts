import { backfillAllDemoPublicBranding } from "../src/lib/demo-public-assets.ts";
import { DEMO_WORLD_SLUGS } from "../src/lib/demo-portal-config.ts";

const n = await backfillAllDemoPublicBranding(DEMO_WORLD_SLUGS);

console.log(`Updated ${n} businesses`);
