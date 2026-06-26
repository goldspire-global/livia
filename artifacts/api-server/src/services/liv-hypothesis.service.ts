/**
 * Liv hypothesis discovery — LLM proposes patterns; owner confirms into memory.
 */
import {
  aiObservationsTable,
  db,
  bookingsTable,
  businessesTable,
  knowledgeEntriesTable,
} from "@workspace/db";
import { getAnthropic, isAnthropicConfigured } from "@workspace/integrations-anthropic-ai";
import {
  LIV_HYPOTHESIS_MODULE,
  businessVocabulary,
  hypothesisConfirmMemorySummary,
  resolveHypothesisEligibility,
  validateHypothesisDrafts,
  type LivHypothesisDraft,
} from "@workspace/policy";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { generateId } from "../lib/id";
import { recordHypothesisEvalTrace } from "../lib/eval-traces";
import { listLivMemoryForEntity } from "./liv-memory.service";
import { recordLearningMemory } from "./liv-learning.service";
import { publishDomainEvent } from "../lib/domain-events";
import { invalidateOwnerIntelligenceCache } from "./owner-intelligence-cache";
import { logger } from "../lib/logger";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const LOOKBACK_DAYS = 30;

export type LivHypothesis = {
  id: string;
  businessId: string;
  title: string;
  summary: string;
  domain: string;
  confidence: string;
  evidenceKeys: string[];
  status: string;
  createdAt: string;
};

type HypothesisFacts = {
  evidenceKeys: Set<string>;
  payload: Record<string, unknown>;
};

async function gatherHypothesisFacts(businessId: string): Promise<HypothesisFacts> {
  const evidenceKeys = new Set<string>();
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86400000);

  const [biz] = await db
    .select({
      name: businessesTable.name,
      vertical: businessesTable.vertical,
      category: businessesTable.category,
      createdAt: businessesTable.createdAt,
    })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId));

  const weekdayRows = await db
    .select({
      dow: sql<number>`extract(dow from ${bookingsTable.startAt})::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.businessId, businessId),
        gte(bookingsTable.startAt, since),
        inArray(bookingsTable.status, ["COMPLETED", "CONFIRMED", "PENDING"]),
      ),
    )
    .groupBy(sql`extract(dow from ${bookingsTable.startAt})`);

  const sourceRows = await db
    .select({
      source: bookingsTable.source,
      count: sql<number>`count(*)::int`,
    })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.businessId, businessId), gte(bookingsTable.startAt, since)))
    .groupBy(bookingsTable.source);

  const hourRows = await db
    .select({
      hour: sql<number>`extract(hour from ${bookingsTable.startAt})::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.businessId, businessId), gte(bookingsTable.startAt, since)))
    .groupBy(sql`extract(hour from ${bookingsTable.startAt})`);

  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const weekdayCounts: Record<string, number> = {};
  for (const row of weekdayRows) {
    const key = weekdays[row.dow] ?? `dow-${row.dow}`;
    weekdayCounts[key] = row.count;
    evidenceKeys.add(`bookings.weekday.${key}`);
  }

  const sourceCounts: Record<string, number> = {};
  for (const row of sourceRows) {
    sourceCounts[row.source] = row.count;
    evidenceKeys.add(`bookings.source.${row.source}`);
  }

  const hourBuckets: Record<string, number> = {};
  for (const row of hourRows) {
    const bucket = row.hour < 12 ? "morning" : row.hour < 17 ? "afternoon" : "evening";
    hourBuckets[bucket] = (hourBuckets[bucket] ?? 0) + row.count;
    evidenceKeys.add(`bookings.hour.${bucket}`);
  }

  const memory = await listLivMemoryForEntity({
    businessId,
    entityType: "business",
    entityId: businessId,
    limit: 12,
  });
  for (const m of memory) {
    evidenceKeys.add(`memory.${m.id}`);
  }

  evidenceKeys.add("bookings.lookback.30d");

  return {
    evidenceKeys,
    payload: {
      businessName: biz?.name ?? "Business",
      vertical: biz?.vertical ?? null,
      lookbackDays: LOOKBACK_DAYS,
      weekdayCounts,
      sourceCounts,
      hourBuckets,
      recentMemorySnippets: memory.slice(0, 8).map((m) => ({
        key: `memory.${m.id}`,
        kind: m.kind,
        content: m.content.slice(0, 160),
      })),
    },
  };
}

function parseHypothesisJson(raw: string): unknown {
  const trimmed = raw.trim();
  const block = trimmed.match(/\[[\s\S]*\]/);
  if (!block) return null;
  try {
    return JSON.parse(block[0]);
  } catch {
    return null;
  }
}

export async function synthesizeHypothesesForBusiness(
  businessId: string,
): Promise<{ created: number; skipped: boolean; reason?: string }> {
  const [biz] = await db
    .select({ createdAt: businessesTable.createdAt, vertical: businessesTable.vertical })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId));
  if (!biz) return { created: 0, skipped: true, reason: "no_business" };

  const daysActive = Math.floor(
    (Date.now() - biz.createdAt.getTime()) / (86400000),
  );

  const [completedRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.businessId, businessId), eq(bookingsTable.status, "COMPLETED")));

  const pendingHypotheses = await listPendingHypotheses(businessId, 10);
  const memoryRows = await listLivMemoryForEntity({
    businessId,
    entityType: "business",
    entityId: businessId,
    limit: 5,
  });

  const eligibility = resolveHypothesisEligibility({
    daysActive,
    completedBookings: completedRow?.count ?? 0,
    memoryRowCount: memoryRows.length,
    existingHypothesisCount: pendingHypotheses.length,
  });
  if (!eligibility.eligible) {
    return { created: 0, skipped: true, reason: eligibility.reason };
  }

  if (!isAnthropicConfigured()) {
    return { created: 0, skipped: true, reason: "anthropic_not_configured" };
  }

  const facts = await gatherHypothesisFacts(businessId);
  const vocab = businessVocabulary(biz.vertical, null);

  const system = `You are Liv's discovery layer for ${vocab.label} businesses.
Given ONLY the JSON facts, propose up to 2 operational patterns the owner might not have stated explicitly.
Return a JSON array only. Each item:
{"title":"...","summary":"...","domain":"operational|revenue|relationship|trust|growth|capability","confidence":"high|medium|low","evidenceKeys":["..."]}
Rules:
- evidenceKeys MUST be copied exactly from keys present in the facts (weekday, source, hour, memory keys).
- Do not invent numbers not in facts.
- Prefer actionable patterns (timing, channel mix, staff preference hints from memory).
- If facts are too thin, return [].`;

  let drafts: LivHypothesisDraft[] = [];
  try {
    const response = await getAnthropic().messages.create({
      model: MODEL,
      max_tokens: 900,
      system,
      messages: [
        {
          role: "user",
          content: JSON.stringify(facts.payload),
        },
      ],
    });
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n");
    drafts = validateHypothesisDrafts(parseHypothesisJson(text), facts.evidenceKeys);
  } catch (err) {
    logger.warn({ businessId, err }, "hypothesis LLM synthesis failed");
    return { created: 0, skipped: true, reason: "llm_failed" };
  }

  let created = 0;
  for (const draft of drafts) {
    const id = generateId();
    const titleKey = draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48);
    const dupe = pendingHypotheses.some(
      (h) => h.title.toLowerCase() === draft.title.toLowerCase(),
    );
    if (dupe) continue;

    await db.insert(aiObservationsTable).values({
      id,
      businessId,
      title: draft.title,
      summary: draft.summary,
      module: LIV_HYPOTHESIS_MODULE,
      status: "NEW",
      severity: draft.confidence === "high" ? "MEDIUM" : "LOW",
      context: {
        domain: draft.domain,
        confidence: draft.confidence,
        evidenceKeys: draft.evidenceKeys,
        dedupeKey: titleKey,
      },
    });

    void recordHypothesisEvalTrace({
      businessId,
      hypothesisId: id,
      outcome: "FLAG_FOR_REVIEW",
      input: facts.payload,
      output: { title: draft.title, summary: draft.summary },
    });

    void publishDomainEvent(
      "liv.learning.hypothesis.proposed",
      {
        businessId,
        hypothesisId: id,
        title: draft.title,
        body: draft.summary,
        confidence: draft.confidence,
      },
      `${businessId}:hypothesis-proposed:${id}`,
    );

    created += 1;
  }

  if (created > 0) invalidateOwnerIntelligenceCache(businessId);
  return { created, skipped: false };
}

export async function listPendingHypotheses(
  businessId: string,
  limit = 5,
): Promise<LivHypothesis[]> {
  const rows = await db
    .select()
    .from(aiObservationsTable)
    .where(
      and(
        eq(aiObservationsTable.businessId, businessId),
        eq(aiObservationsTable.module, LIV_HYPOTHESIS_MODULE),
        eq(aiObservationsTable.status, "NEW"),
      ),
    )
    .orderBy(desc(aiObservationsTable.createdAt))
    .limit(limit);

  return rows.map((r) => {
    const ctx = (r.context ?? {}) as {
      domain?: string;
      confidence?: string;
      evidenceKeys?: string[];
    };
    return {
      id: r.id,
      businessId: r.businessId!,
      title: r.title,
      summary: r.summary,
      domain: ctx.domain ?? "operational",
      confidence: ctx.confidence ?? "medium",
      evidenceKeys: ctx.evidenceKeys ?? [],
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    };
  });
}

export async function confirmHypothesis(args: {
  businessId: string;
  hypothesisId: string;
  userId: string;
}): Promise<{ memoryId: string }> {
  const [row] = await db
    .select()
    .from(aiObservationsTable)
    .where(
      and(
        eq(aiObservationsTable.id, args.hypothesisId),
        eq(aiObservationsTable.businessId, args.businessId),
        eq(aiObservationsTable.module, LIV_HYPOTHESIS_MODULE),
      ),
    );
  if (!row) throw new Error("HYPOTHESIS_NOT_FOUND");

  const summary = hypothesisConfirmMemorySummary(row.title, row.summary);
  const { memoryId } = await recordLearningMemory({
    businessId: args.businessId,
    createdBy: "owner",
    sourceRef: args.hypothesisId,
    record: {
      source: "hypothesis_confirm",
      summary,
      entityType: "business",
      entityId: args.businessId,
      hypothesisId: args.hypothesisId,
      evidenceRef: row.id,
    },
  });

  await db
    .update(aiObservationsTable)
    .set({ status: "REVIEWED", reviewedAt: new Date(), updatedAt: new Date() })
    .where(eq(aiObservationsTable.id, args.hypothesisId));

  await db.insert(knowledgeEntriesTable).values({
    id: generateId(),
    businessId: args.businessId,
    scope: "OPERATIONS",
    title: row.title,
    content: row.summary,
    sourceType: "liv_hypothesis",
    sourceRef: args.hypothesisId,
    tags: ["liv-learning", "confirmed"],
  });

  await recordHypothesisEvalTrace({
    businessId: args.businessId,
    hypothesisId: args.hypothesisId,
    outcome: "PASS",
    input: { action: "confirm", userId: args.userId },
    output: { memoryId },
  });

  return { memoryId };
}

export async function dismissHypothesis(args: {
  businessId: string;
  hypothesisId: string;
  userId: string;
}): Promise<void> {
  const [row] = await db
    .select({ id: aiObservationsTable.id })
    .from(aiObservationsTable)
    .where(
      and(
        eq(aiObservationsTable.id, args.hypothesisId),
        eq(aiObservationsTable.businessId, args.businessId),
        eq(aiObservationsTable.module, LIV_HYPOTHESIS_MODULE),
      ),
    );
  if (!row) throw new Error("HYPOTHESIS_NOT_FOUND");

  await db
    .update(aiObservationsTable)
    .set({ status: "DISMISSED", reviewedAt: new Date(), updatedAt: new Date() })
    .where(eq(aiObservationsTable.id, args.hypothesisId));

  await recordHypothesisEvalTrace({
    businessId: args.businessId,
    hypothesisId: args.hypothesisId,
    outcome: "FAIL",
    input: { action: "dismiss", userId: args.userId },
    output: { dismissed: true },
  });

  invalidateOwnerIntelligenceCache(args.businessId);
}

export async function runHypothesisDiscoveryDaily(businessId: string) {
  return synthesizeHypothesesForBusiness(businessId);
}
