import { db, livEntityMemoryTable } from "@workspace/db";
import {
  buildLivLearningPromptLines,
  parseLearningRowsFromMemoryContents,
  parseLivLearningMemory,
  parseOperatorDecisionMemory,
  rankMemoryRowsForPrompt,
} from "@workspace/policy";
import { and, eq, desc, isNull, or, gt } from "drizzle-orm";
import { generateId } from "../lib/id";

export type LivMemoryKind =
  | "note"
  | "preference"
  | "ritual"
  | "procedural"
  | "pressure"
  | "therapist_pref"
  | "health_light"
  | "vehicle";

export type LivMemoryRow = {
  id: string;
  kind: LivMemoryKind;
  content: string;
  createdBy: string;
  createdAt: string;
  supersedesId?: string | null;
};

async function fetchMemoryRows(args: {
  businessId: string;
  entityType: "customer" | "staff" | "business";
  entityId: string;
  limit?: number;
}): Promise<LivMemoryRow[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(livEntityMemoryTable)
    .where(
      and(
        eq(livEntityMemoryTable.businessId, args.businessId),
        eq(livEntityMemoryTable.entityType, args.entityType),
        eq(livEntityMemoryTable.entityId, args.entityId),
        or(
          isNull(livEntityMemoryTable.expiresAt),
          gt(livEntityMemoryTable.expiresAt, now),
        ),
      ),
    )
    .orderBy(desc(livEntityMemoryTable.createdAt))
    .limit(args.limit ?? 24);

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind as LivMemoryKind,
    content: r.content,
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString(),
    supersedesId: r.supersedesId,
  }));
}

export async function listLivMemoryForEntity(args: {
  businessId: string;
  entityType: "customer" | "staff" | "business";
  entityId: string;
  limit?: number;
}): Promise<LivMemoryRow[]> {
  const rows = await fetchMemoryRows(args);
  return rankMemoryRowsForPrompt(rows).slice(0, args.limit ?? 20) as LivMemoryRow[];
}

export async function appendLivMemory(args: {
  businessId: string;
  entityType: "customer" | "staff" | "business";
  entityId: string;
  kind: LivMemoryKind;
  content: string;
  createdBy: "staff" | "owner" | "liv";
  ttlDays?: number;
  supersedesId?: string;
  sourceRef?: string;
  metadata?: Record<string, unknown>;
}) {
  const content = args.content.trim();
  if (!content) throw new Error("EMPTY_CONTENT");

  const expiresAt = args.ttlDays
    ? new Date(Date.now() + args.ttlDays * 86400000)
    : null;

  const [row] = await db
    .insert(livEntityMemoryTable)
    .values({
      id: generateId(),
      businessId: args.businessId,
      entityType: args.entityType,
      entityId: args.entityId,
      kind: args.kind,
      content,
      createdBy: args.createdBy,
      supersedesId: args.supersedesId ?? null,
      sourceRef: args.sourceRef ?? null,
      metadata: args.metadata ?? {},
      expiresAt,
    })
    .returning();

  return row;
}

function formatMemoryLine(row: LivMemoryRow): string {
  const learning = parseLivLearningMemory(row.content);
  if (learning) return `- [learned:${learning.source}] ${learning.summary}`;
  return `- [${row.kind}] ${row.content}`;
}

/** Injected into Liv system prompts — bounded, factual, ranked. */
export async function buildLivMemoryBlockForCustomer(
  businessId: string,
  customerId: string,
): Promise<string> {
  const rows = await listLivMemoryForEntity({
    businessId,
    entityType: "customer",
    entityId: customerId,
    limit: 8,
  });
  if (rows.length === 0) return "";

  const lines = rows.map(formatMemoryLine);
  return `\n\nCUSTOMER MEMORY (use naturally, do not invent beyond this):\n${lines.join("\n")}\n`;
}

export async function buildLivMemoryBlockForBusiness(businessId: string): Promise<string> {
  const rows = await listLivMemoryForEntity({
    businessId,
    entityType: "business",
    entityId: businessId,
    limit: 12,
  });
  if (!rows.length) return "";
  const lines = rows.map(formatMemoryLine);
  return `\n\nBUSINESS MEMORY (owner rituals and confirmed patterns — respect, do not invent):\n${lines.join("\n")}\n`;
}

/** Recent structured learning rows for internal ops / incident bundles. */
export async function listRecentLearningMemoryForBusiness(
  businessId: string,
  limit = 8,
): Promise<Array<{ id: string; summary: string; source: string; createdAt: string }>> {
  const rows = await listLivMemoryForEntity({
    businessId,
    entityType: "business",
    entityId: businessId,
    limit: 20,
  });
  return rows
    .map((r) => {
      const parsed = parseLivLearningMemory(r.content);
      if (!parsed) return null;
      return {
        id: r.id,
        summary: parsed.summary,
        source: parsed.source,
        createdAt: r.createdAt,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r != null)
    .slice(0, limit);
}

/** Unified learning block — procedural memory + operator decision patterns. */
export async function buildLivLearningPromptBlock(businessId: string): Promise<string> {
  const rows = await listLivMemoryForEntity({
    businessId,
    entityType: "business",
    entityId: businessId,
    limit: 20,
  });
  const learningContents = rows
    .map((r) => r.content)
    .filter((c) => c.includes("liv.learn:"));
  const learningRows = parseLearningRowsFromMemoryContents(learningContents);
  const operatorPatterns = rows
    .map((r) => parseOperatorDecisionMemory(r.content))
    .filter((p): p is NonNullable<typeof p> => p != null);

  const lines = buildLivLearningPromptLines({ learningRows, operatorPatterns });
  if (!lines.length) return "";
  return `\n\nLIV LEARNING (from corrections, overrides, and confirmed patterns — suggest, do not override human):\n${lines.join("\n")}\n`;
}
