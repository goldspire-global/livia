import { db, twinObservationsTable, EventType } from "@workspace/db";
import {
  resolveTwinObservationDrafts,
  resolveTwinRisksAndOpportunities,
  shouldPromoteTwinInsight,
  type TwinObservationDraft,
} from "@workspace/policy";
import { and, desc, eq, isNull, or, gte, notInArray } from "drizzle-orm";
import { generateId } from "../lib/id";
import { publishDomainEvent } from "../lib/domain-events";
import { logEvent } from "./events.service";
import {
  loadBusinessTwinContext,
  type BusinessTwinLoadContext,
} from "./business-twin.service";
import { listAtRiskGuestPreviews } from "./relationship.service";
import { listRecentVisitFeedback } from "./visit-feedback.service";
import { loadBusinessTrustMetrics } from "./policy-evolution.service";
import { getBusinessById } from "./businesses.service";
import { policiesFromBusiness } from "./policies.service";
import { recordLearningMemory } from "./liv-learning.service";
import { twinConfirmMemorySummary } from "@workspace/policy";
import { invalidateOwnerIntelligenceCache } from "./owner-intelligence-cache";

export type TwinObservation = {
  id: string;
  businessId: string;
  domain: string;
  layer: string;
  observationKey: string;
  title: string;
  body: string;
  confidence: string;
  evidence: Array<{ type: string; id: string; label: string }>;
  href: string | null;
  createdAt: string;
  ownerStatus?: string;
};

const DEFAULT_TTL_DAYS = 14;

function resolveInputFromContext(
  ctx: BusinessTwinLoadContext,
  atRiskCount: number,
  lowFeedbackCount: number,
  emergentTrust?: Parameters<typeof resolveTwinObservationDrafts>[0]["emergentTrust"],
): Parameters<typeof resolveTwinObservationDrafts>[0] {
  const platformCaps = ctx.capabilities?.platformCapabilities ?? [];
  const blockerCount = platformCaps.reduce(
    (n, c) => n + c.readinessBlockers.length,
    0,
  );
  const suspendedCount = platformCaps.filter((c) => c.state === "suspended").length;

  return {
    pendingCount: ctx.summary.pendingCount ?? 0,
    todayBookings: ctx.summary.todayBookings ?? 0,
    weekBookings: ctx.summary.weekBookings ?? 0,
    handedOffCount: ctx.summary.handedOffCount ?? 0,
    sacredMetricMet: ctx.activation?.sacredMetricMet ?? false,
    atRiskCount,
    lowFeedbackCount,
    commerceSignals: ctx.commerceSignals.map((s) => ({
      id: s.id,
      severity: s.severity,
      title: s.title,
      body: s.body,
      href: s.href,
    })),
    paymentCount30d: ctx.commerce.paymentCount30d,
    captureRatePercent: ctx.commerce.captureRatePercent,
    capabilityBlockerCount: blockerCount,
    capabilitySuspendedCount: suspendedCount,
    capabilityScore: ctx.capabilities?.capabilityHealth?.score ?? 0,
    feedbackCount: ctx.reviews.count,
    avgFeedback: ctx.reviews.avgRating,
    emergentTrust,
  };
}

function rowToObservation(row: typeof twinObservationsTable.$inferSelect): TwinObservation {
  return {
    id: row.id,
    businessId: row.businessId,
    domain: row.domain,
    layer: row.layer,
    observationKey: row.observationKey,
    title: row.title,
    body: row.body,
    confidence: row.confidence,
    evidence: (row.evidence as TwinObservation["evidence"]) ?? [],
    href: row.href,
    createdAt: row.createdAt.toISOString(),
    ownerStatus: row.ownerStatus ?? "open",
  };
}

async function upsertObservation(
  businessId: string,
  draft: TwinObservationDraft,
): Promise<"created" | "updated" | false> {
  const expiresAt = new Date(Date.now() + DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000);
  const values = {
    id: generateId(),
    businessId,
    domain: draft.domain,
    layer: "observation" as const,
    observationKey: draft.observationKey,
    title: draft.title,
    body: draft.body,
    confidence: draft.confidence,
    evidence: draft.evidence,
    href: draft.href ?? null,
    sourceEvent: "twin.materialize",
    expiresAt,
  };

  try {
    await db.insert(twinObservationsTable).values(values);
    return "created";
  } catch (err: unknown) {
    const code =
      (err as { code?: string })?.code ??
      (err as { cause?: { code?: string } })?.cause?.code;
    if (code !== "23505") return false;

    await db
      .update(twinObservationsTable)
      .set({
        title: draft.title,
        body: draft.body,
        confidence: draft.confidence,
        evidence: draft.evidence,
        href: draft.href ?? null,
        expiresAt,
        dismissedAt: null,
      })
      .where(
        and(
          eq(twinObservationsTable.businessId, businessId),
          eq(twinObservationsTable.observationKey, draft.observationKey),
        ),
      );
    return "updated";
  }
}

function twinEventPayload(businessId: string, draft: TwinObservationDraft) {
  return {
    businessId,
    observationKey: draft.observationKey,
    domain: draft.domain,
    title: draft.title,
    body: draft.body,
    confidence: draft.confidence,
    href: draft.href,
  };
}

async function publishTwinObservationEvents(
  businessId: string,
  draft: TwinObservationDraft,
): Promise<void> {
  const base = twinEventPayload(businessId, draft);
  const dedupeBase = `${businessId}:twin:${draft.observationKey}`;

  void publishDomainEvent(
    "twin.observation.generated",
    base,
    `${dedupeBase}:observation`,
  );
  void logEvent({
    type: EventType.TWIN_OBSERVATION_GENERATED,
    businessId,
    entityType: "twin_observation",
    entityId: draft.observationKey,
    context: {
      domain: draft.domain,
      confidence: draft.confidence,
      title: draft.title,
    },
  });

  if (shouldPromoteTwinInsight(draft)) {
    void publishDomainEvent("twin.insight.generated", base, `${dedupeBase}:insight`);
    void logEvent({
      type: EventType.TWIN_INSIGHT_GENERATED,
      businessId,
      entityType: "twin_insight",
      entityId: draft.observationKey,
      context: {
        domain: draft.domain,
        confidence: draft.confidence,
        title: draft.title,
      },
    });
  }

  const { risks, opportunities } = resolveTwinRisksAndOpportunities([draft]);
  for (const risk of risks) {
    void publishDomainEvent(
      "twin.risk.detected",
      {
        businessId,
        riskId: risk.id,
        domain: risk.domain,
        title: risk.title,
        body: risk.body,
        href: risk.href,
      },
      `${dedupeBase}:risk:${risk.id}`,
    );
    void logEvent({
      type: EventType.TWIN_RISK_DETECTED,
      businessId,
      entityType: "twin_risk",
      entityId: risk.id,
      context: { domain: risk.domain, observationKey: draft.observationKey },
    });
  }
  for (const opp of opportunities) {
    void publishDomainEvent(
      "twin.opportunity.detected",
      {
        businessId,
        opportunityId: opp.id,
        domain: opp.domain,
        title: opp.title,
        body: opp.body,
        href: opp.href,
      },
      `${dedupeBase}:opp:${opp.id}`,
    );
    void logEvent({
      type: EventType.TWIN_OPPORTUNITY_DETECTED,
      businessId,
      entityType: "twin_opportunity",
      entityId: opp.id,
      context: { domain: opp.domain, observationKey: draft.observationKey },
    });
  }
}

/** Materialize policy observation drafts into twin_observations (deduped by key). */
export async function syncTwinObservations(businessId: string): Promise<number> {
  const [ctx, atRisk, feedback, biz, trustMetrics] = await Promise.all([
    loadBusinessTwinContext(businessId),
    listAtRiskGuestPreviews(businessId, { limit: 5 }),
    listRecentVisitFeedback(businessId, 14),
    getBusinessById(businessId),
    loadBusinessTrustMetrics(businessId),
  ]);
  if (!ctx.capabilities) return 0;

  const policies = biz ? policiesFromBusiness(biz) : null;
  const monthsActive = biz
    ? Math.max(0, Math.floor((Date.now() - biz.createdAt.getTime()) / (30 * 86400000)))
    : 0;

  const lowFeedbackCount = feedback.filter((r) => r.score <= 3).length;
  const drafts = resolveTwinObservationDrafts(
    resolveInputFromContext(ctx, atRisk.length, lowFeedbackCount, {
      monthsActive,
      completedBookings: trustMetrics.completedBookings,
      uniqueClients: trustMetrics.uniqueClients,
      depositCaptureRatePercent: ctx.commerce.captureRatePercent,
      repeatClientSharePercent: trustMetrics.repeatClientSharePercent,
      noShowRatePercent: trustMetrics.noShowRatePercent,
      trustProgramActive: Boolean(policies?.operational.emergentTrustProgram?.enabled),
    }),
  );

  const suppressed = await db
    .select({ observationKey: twinObservationsTable.observationKey })
    .from(twinObservationsTable)
    .where(
      and(
        eq(twinObservationsTable.businessId, businessId),
        eq(twinObservationsTable.ownerStatus, "dismissed"),
      ),
    );
  const suppressedKeys = new Set(suppressed.map((r) => r.observationKey));

  let created = 0;
  const activeKeys = new Set(drafts.map((d) => d.observationKey));
  for (const draft of drafts) {
    if (suppressedKeys.has(draft.observationKey)) continue;
    const result = await upsertObservation(businessId, draft);
    if (result === "created") {
      created += 1;
      void publishTwinObservationEvents(businessId, draft);
    }
  }

  if (activeKeys.size > 0) {
    await db
      .update(twinObservationsTable)
      .set({ dismissedAt: new Date() })
      .where(
        and(
          eq(twinObservationsTable.businessId, businessId),
          isNull(twinObservationsTable.dismissedAt),
          eq(twinObservationsTable.ownerStatus, "open"),
          notInArray(twinObservationsTable.observationKey, [...activeKeys]),
        ),
      );
  }

  return created;
}

export async function listActiveTwinObservations(
  businessId: string,
  limit = 8,
): Promise<TwinObservation[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(twinObservationsTable)
    .where(
      and(
        eq(twinObservationsTable.businessId, businessId),
        isNull(twinObservationsTable.dismissedAt),
        or(
          eq(twinObservationsTable.ownerStatus, "open"),
          eq(twinObservationsTable.ownerStatus, "confirmed"),
        ),
        or(
          isNull(twinObservationsTable.expiresAt),
          gte(twinObservationsTable.expiresAt, now),
        ),
      ),
    )
    .orderBy(desc(twinObservationsTable.createdAt))
    .limit(limit);

  return rows.map(rowToObservation);
}

export async function getTwinObservationsBundle(businessId: string): Promise<{
  businessId: string;
  generatedAt: string;
  observations: TwinObservation[];
}> {
  return {
    businessId,
    generatedAt: new Date().toISOString(),
    observations: await listActiveTwinObservations(businessId),
  };
}

/** Risks + opportunities derived from active persisted observations. */
export function twinRisksAndOpportunitiesFromObservations(observations: TwinObservation[]): {
  twinRisks: ReturnType<typeof resolveTwinRisksAndOpportunities>["risks"];
  twinOpportunities: ReturnType<typeof resolveTwinRisksAndOpportunities>["opportunities"];
} {
  const mapped = observations.map((o) => ({
    observationKey: o.observationKey,
    domain: o.domain as TwinObservationDraft["domain"],
    title: o.title,
    body: o.body,
    href: o.href,
    confidence: o.confidence as "high" | "medium" | "low",
  }));
  const { risks, opportunities } = resolveTwinRisksAndOpportunities(mapped);
  return { twinRisks: risks, twinOpportunities: opportunities };
}

export async function confirmTwinObservation(args: {
  businessId: string;
  observationKey: string;
  userId: string;
}): Promise<{ memoryId: string }> {
  const [row] = await db
    .select()
    .from(twinObservationsTable)
    .where(
      and(
        eq(twinObservationsTable.businessId, args.businessId),
        eq(twinObservationsTable.observationKey, args.observationKey),
      ),
    );
  if (!row) throw new Error("OBSERVATION_NOT_FOUND");

  const summary = twinConfirmMemorySummary(row.title, row.body);
  const { memoryId } = await recordLearningMemory({
    businessId: args.businessId,
    createdBy: "owner",
    sourceRef: args.observationKey,
    record: {
      source: "twin_confirm",
      summary,
      entityType: "business",
      entityId: args.businessId,
      observationKey: args.observationKey,
      evidenceRef: row.id,
    },
  });

  await db
    .update(twinObservationsTable)
    .set({
      ownerStatus: "confirmed",
      ownerActedAt: new Date(),
      ownerUserId: args.userId,
    })
    .where(eq(twinObservationsTable.id, row.id));

  invalidateOwnerIntelligenceCache(args.businessId);
  return { memoryId };
}

export async function dismissTwinObservation(args: {
  businessId: string;
  observationKey: string;
  userId: string;
}): Promise<void> {
  const [row] = await db
    .select({ id: twinObservationsTable.id })
    .from(twinObservationsTable)
    .where(
      and(
        eq(twinObservationsTable.businessId, args.businessId),
        eq(twinObservationsTable.observationKey, args.observationKey),
      ),
    );
  if (!row) throw new Error("OBSERVATION_NOT_FOUND");

  await db
    .update(twinObservationsTable)
    .set({
      ownerStatus: "dismissed",
      ownerActedAt: new Date(),
      ownerUserId: args.userId,
      dismissedAt: new Date(),
    })
    .where(eq(twinObservationsTable.id, row.id));

  invalidateOwnerIntelligenceCache(args.businessId);
}
