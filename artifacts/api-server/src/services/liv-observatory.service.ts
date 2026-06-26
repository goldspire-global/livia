/**
 * Liv observatory — automatic usage capture on every domain event.
 */
import {
  formatObservatorySignalBody,
  formatObservatorySignalTitle,
  inferObservatoryEntity,
  resolveObservatoryAction,
} from "@workspace/policy";
import type { LivSignalPriority } from "@workspace/liv-runtime";
import { upsertLivSignal } from "./liv-signals.service";
import { scheduleLearningPass } from "./liv-learning-triggers.service";
import { logger } from "../lib/logger";

function toLivPriority(p: "info" | "watch" | "act"): LivSignalPriority {
  if (p === "act") return "act";
  if (p === "watch") return "watch";
  return "info";
}

function dayBucket(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function processLivObservatoryForEvent(
  name: string,
  payload: unknown,
): Promise<void> {
  const action = resolveObservatoryAction(name);
  if (!action) return;

  const p = payload as Record<string, unknown> & { businessId?: string };
  if (!p.businessId || p.businessId === "system") return;

  if (action.learningReason) {
    void scheduleLearningPass({
      businessId: p.businessId,
      reason: action.learningReason,
    }).catch((err) => {
      logger.warn({ err, name, businessId: p.businessId }, "observatory learning pass failed");
    });
  }

  if (!action.recordSignal) return;

  const { entityType, entityId } = inferObservatoryEntity(name, p);
  const dedupeKey = `obs:${name}:${entityId ?? p.businessId}:${dayBucket()}`;

  void upsertLivSignal({
    businessId: p.businessId,
    kind: "observatory",
    priority: toLivPriority(action.signalPriority),
    title: formatObservatorySignalTitle(name, p),
    body: formatObservatorySignalBody(name, p),
    dedupeKey,
    eventName: name,
    entityType: entityType ?? undefined,
    entityId: entityId ?? undefined,
    ttlHours: 72,
  }).catch((err) => {
    logger.warn({ err, name, businessId: p.businessId }, "observatory signal failed");
  });
}

export async function buildLivObservatoryPromptBlock(businessId: string): Promise<string> {
  const { db, livSignalsTable } = await import("@workspace/db");
  const { and, eq, gte, isNull, desc } = await import("drizzle-orm");
  const { buildObservatoryPromptBlock } = await import("@workspace/policy");

  const since = new Date(Date.now() - 72 * 60 * 60 * 1000);
  const rows = await db
    .select({
      title: livSignalsTable.title,
      body: livSignalsTable.body,
      eventName: livSignalsTable.eventName,
      createdAt: livSignalsTable.createdAt,
    })
    .from(livSignalsTable)
    .where(
      and(
        eq(livSignalsTable.businessId, businessId),
        eq(livSignalsTable.kind, "observatory"),
        isNull(livSignalsTable.dismissedAt),
        gte(livSignalsTable.createdAt, since),
      ),
    )
    .orderBy(desc(livSignalsTable.createdAt))
    .limit(8);

  return buildObservatoryPromptBlock(
    rows.map((r) => ({
      title: r.title,
      body: r.body,
      eventName: r.eventName,
      createdAt: r.createdAt.toISOString(),
    })),
  );
}
