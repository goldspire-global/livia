import { inngest } from "../lib/inngest";
import { synthesizeHypothesesForBusiness } from "../services/liv-hypothesis.service";
import { invalidateOwnerIntelligenceCache } from "../services/owner-intelligence-cache";
import { logger } from "../lib/logger";

/**
 * Usage-triggered learning pass — debounced per tenant (milestones, corrections, overrides).
 */
export const livLearningOnUsage = inngest.createFunction(
  {
    id: "liv-learning-on-usage",
    retries: 2,
    debounce: {
      period: "2h",
      key: "event.data.businessId",
    },
  },
  { event: "liv/learning.pass.requested" },
  async ({ event, step }) => {
    const data = event.data as {
      businessId: string;
      reason?: string;
      detail?: string;
    };

    const result = await step.run("hypothesis-pass", async () =>
      synthesizeHypothesesForBusiness(data.businessId),
    );

    await step.run("bust-cache", async () => {
      invalidateOwnerIntelligenceCache(data.businessId);
    });

    if (result.created > 0) {
      logger.info(
        { businessId: data.businessId, reason: data.reason, created: result.created },
        "usage-triggered learning pass complete",
      );
    }

    return result;
  },
);
