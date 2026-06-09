import { inngest } from "../lib/inngest";
import { db, businessesTable } from "@workspace/db";
import { runTwinIntelligenceDaily } from "../services/twin-intelligence-daily.service";
import { logger } from "../lib/logger";

/**
 * Nightly Twin observations — materialize policy drafts + Liv reactions.
 * Runs 07:45 UTC (after commerce-intelligence-daily at 07:30).
 */
export const twinObservationsDaily = inngest.createFunction(
  { id: "twin-observations-daily", retries: 2 },
  { cron: "45 7 * * *" },
  async ({ step }) => {
    const businesses = await step.run("list-businesses", async () =>
      db.select({ id: businessesTable.id }).from(businessesTable),
    );

    let observationsCreated = 0;

    for (const biz of businesses) {
      const result = await step.run(`twin-intel-${biz.id}`, async () =>
        runTwinIntelligenceDaily(biz.id),
      );
      observationsCreated += result.observationsCreated;
    }

    if (observationsCreated > 0) {
      logger.info(
        { observationsCreated, total: businesses.length },
        "twin-observations-daily complete",
      );
    }

    return {
      processed: businesses.length,
      observationsCreated,
    };
  },
);
