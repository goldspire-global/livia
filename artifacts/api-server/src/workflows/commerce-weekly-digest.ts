import { inngest } from "../lib/inngest";
import { db, businessesTable } from "@workspace/db";
import { sendCommerceWeeklyDigestEmail } from "../services/commerce-weekly-digest.service";
import { logger } from "../lib/logger";

/**
 * Commerce weekly digest — Monday 09:00 UTC.
 */
export const commerceWeeklyDigest = inngest.createFunction(
  { id: "commerce-weekly-digest", retries: 3 },
  { cron: "0 9 * * 1" },
  async ({ step }) => {
    const businesses = await step.run("list-businesses", async () =>
      db.select({ id: businessesTable.id }).from(businessesTable),
    );

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const biz of businesses) {
      const result = await step.run(`commerce-digest-${biz.id}`, async () => {
        const status = await sendCommerceWeeklyDigestEmail(biz.id);
        return { businessId: biz.id, status };
      });
      if (result.status === "sent") sent += 1;
      else if (result.status === "failed") failed += 1;
      else skipped += 1;
    }

    if (failed > 0) {
      logger.warn({ failed }, "commerce-weekly-digest: some emails failed");
    }

    return { processed: businesses.length, sent, skipped, failed };
  },
);
