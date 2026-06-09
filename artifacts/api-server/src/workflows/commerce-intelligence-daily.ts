import { inngest } from "../lib/inngest";
import { db, businessesTable } from "@workspace/db";
import { runCommerceIntelligenceDaily } from "../services/commerce-weekly-digest.service";
import { logger } from "../lib/logger";

/**
 * Daily commerce intelligence — sync Liv signals + owner push for act-level commerce issues.
 * Runs 07:30 UTC (after morning briefing window).
 */
export const commerceIntelligenceDaily = inngest.createFunction(
  { id: "commerce-intelligence-daily", retries: 2 },
  { cron: "30 7 * * *" },
  async ({ step }) => {
    const businesses = await step.run("list-businesses", async () =>
      db.select({ id: businessesTable.id }).from(businessesTable),
    );

    let synced = 0;
    let proposals = 0;

    for (const biz of businesses) {
      const result = await step.run(`commerce-intel-${biz.id}`, async () =>
        runCommerceIntelligenceDaily(biz.id),
      );
      synced += result.signalsSynced;
      proposals += result.proposalsCreated;
    }

    if (proposals > 0) {
      logger.info({ proposals, total: businesses.length }, "commerce-intelligence-daily complete");
    }

    return { processed: businesses.length, signalsSynced: synced, proposalsCreated: proposals };
  },
);
