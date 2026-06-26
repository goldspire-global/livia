import { inngest } from "../lib/inngest";
import { db, businessesTable } from "@workspace/db";
import { runHypothesisDiscoveryDaily } from "../services/liv-hypothesis.service";
import { logger } from "../lib/logger";

/**
 * Nightly Liv hypothesis discovery — LLM proposes patterns from facts; owner confirms.
 * Runs 08:00 UTC (after twin-observations-daily at 07:45).
 */
export const livHypothesisDaily = inngest.createFunction(
  { id: "liv-hypothesis-daily", retries: 2 },
  { cron: "0 8 * * *" },
  async ({ step }) => {
    const businesses = await step.run("list-businesses", async () =>
      db.select({ id: businessesTable.id }).from(businessesTable),
    );

    let hypothesesCreated = 0;
    let skipped = 0;

    for (const biz of businesses) {
      const result = await step.run(`hypothesis-${biz.id}`, async () =>
        runHypothesisDiscoveryDaily(biz.id),
      );
      hypothesesCreated += result.created;
      if (result.skipped) skipped += 1;
    }

    if (hypothesesCreated > 0) {
      logger.info(
        { hypothesesCreated, skipped, total: businesses.length },
        "liv-hypothesis-daily complete",
      );
    }

    return {
      processed: businesses.length,
      hypothesesCreated,
      skipped,
    };
  },
);
