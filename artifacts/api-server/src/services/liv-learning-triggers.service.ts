/**
 * Usage-based Liv learning triggers — hypothesis passes fire on milestones, not cron alone.
 */
import { db, bookingsTable, livEntityMemoryTable } from "@workspace/db";
import {
  LIV_LEARNING_MEMORY_PREFIX,
  resolveLearningPassTrigger,
  type LearningPassTriggerReason,
} from "@workspace/policy";
import { and, eq, gte, sql } from "drizzle-orm";
import { inngest, isInngestWorkflowsEnabled } from "../lib/inngest";
import { getBusinessById } from "./businesses.service";
import { logger } from "../lib/logger";

const COOLDOWN_HOURS = 6;

async function completedBookingCount(businessId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.businessId, businessId), eq(bookingsTable.status, "COMPLETED")));
  return row?.count ?? 0;
}

async function overrideCount30d(businessId: string): Promise<number> {
  const since = new Date(Date.now() - 30 * 86400000);
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(livEntityMemoryTable)
    .where(
      and(
        eq(livEntityMemoryTable.businessId, businessId),
        gte(livEntityMemoryTable.createdAt, since),
        sql`${livEntityMemoryTable.content} like 'liv.learn:override%'`,
      ),
    );
  return row?.count ?? 0;
}

function daysActive(createdAt: Date): number {
  return Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 86400000));
}

export async function scheduleLearningPass(args: {
  businessId: string;
  reason: LearningPassTriggerReason;
}): Promise<{ scheduled: boolean; detail?: string }> {
  const biz = await getBusinessById(args.businessId);
  if (!biz) return { scheduled: false };

  const [completed, overrides] = await Promise.all([
    completedBookingCount(args.businessId),
    overrideCount30d(args.businessId),
  ]);

  const decision = resolveLearningPassTrigger({
    reason: args.reason,
    completedBookings: completed,
    daysActive: daysActive(biz.createdAt),
    overrideCount30d: overrides,
    hoursSinceLastPass: null,
  });

  if (!decision.shouldRun) {
    return { scheduled: false, detail: decision.detail };
  }

  if (isInngestWorkflowsEnabled()) {
    void inngest
      .send({
        name: "liv/learning.pass.requested",
        data: {
          businessId: args.businessId,
          reason: args.reason,
          detail: decision.detail ?? args.reason,
        },
      })
      .catch((err) => {
        logger.warn({ err, businessId: args.businessId }, "learning pass schedule failed");
      });
  } else {
    void import("./liv-hypothesis.service")
      .then((m) => m.synthesizeHypothesesForBusiness(args.businessId))
      .catch(() => undefined);
  }

  logger.info(
    { businessId: args.businessId, reason: args.reason, detail: decision.detail },
    "liv learning pass scheduled",
  );
  return { scheduled: true, detail: decision.detail };
}

/** Called from domain-events after publish — usage-based learning, not calendar-only. */
export async function maybeScheduleLearningPassFromEvent(
  name: string,
  payload: unknown,
): Promise<void> {
  const p = payload as { businessId?: string };
  if (!p.businessId) return;

  if (name === "booking.completed") {
    void scheduleLearningPass({
      businessId: p.businessId,
      reason: "milestone_completed_bookings",
    }).catch(() => undefined);
    return;
  }

  if (name === "liv.learning.correction.recorded") {
    void scheduleLearningPass({
      businessId: p.businessId,
      reason: "correction_recorded",
    }).catch(() => undefined);
    return;
  }

  if (name === "liv.learning.override.recorded") {
    void scheduleLearningPass({
      businessId: p.businessId,
      reason: "override_recorded",
    }).catch(() => undefined);
  }
}