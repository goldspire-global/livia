import { db, businessesTable } from "@workspace/db";
import { inArray } from "drizzle-orm";
import { runTwinIntelligenceDaily } from "./twin-intelligence-daily.service";
import { logger } from "../lib/logger";

export type InternalTwinSyncBatchResult = {
  processed: number;
  observationsCreated: number;
  businessIds: string[];
};

/** Internal ops — materialize Twin observations for a tenant batch. */
export async function runInternalTwinSyncBatch(opts?: {
  businessIds?: string[];
  limit?: number;
}): Promise<InternalTwinSyncBatchResult> {
  const limit = Math.min(Math.max(opts?.limit ?? 25, 1), 100);
  let ids = opts?.businessIds?.filter(Boolean) ?? [];

  if (ids.length === 0) {
    const rows = await db
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .limit(limit);
    ids = rows.map((r) => r.id);
  } else {
    ids = ids.slice(0, limit);
  }

  let observationsCreated = 0;
  for (const businessId of ids) {
    const result = await runTwinIntelligenceDaily(businessId);
    observationsCreated += result.observationsCreated;
  }

  logger.info(
    { processed: ids.length, observationsCreated },
    "internal twin sync batch complete",
  );

  return { processed: ids.length, observationsCreated, businessIds: ids };
}

/** Resolve business ids from slugs for ops tooling. */
export async function resolveBusinessIdsBySlug(slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return [];
  const rows = await db
    .select({ id: businessesTable.id })
    .from(businessesTable)
    .where(inArray(businessesTable.slug, slugs));
  return rows.map((r) => r.id);
}
