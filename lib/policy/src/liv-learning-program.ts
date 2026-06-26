/**
 * Liv learning program — policy hub for institutional memory loops.
 * Corrections, overrides, hypotheses, and twin confirms all format through here
 * so API, workflows, prompts, and surfaces stay aligned.
 */
import { parseOperatorDecisionMemory, type OperatorDecisionRecord } from "./liv-operator-learning-policy";

/** Structured memory rows written by the learning loop. */
export const LIV_LEARNING_MEMORY_PREFIX = "liv.learn:";

export const LIV_LEARNING_MODULE = "liv_learning";
export const LIV_HYPOTHESIS_MODULE = "liv_learning_hypothesis";

export type LivLearningSource =
  | "correction"
  | "override_staff"
  | "override_time"
  | "hypothesis_confirm"
  | "twin_confirm";

export type LivLearningMemoryRecord = {
  source: LivLearningSource;
  summary: string;
  entityType?: "customer" | "staff" | "business";
  entityId?: string;
  evidenceRef?: string;
  ticketId?: string;
  bookingId?: string;
  observationKey?: string;
  hypothesisId?: string;
};

export type LivMemoryRowForRanking = {
  id: string;
  kind: string;
  content: string;
  createdBy: string;
  createdAt?: string;
  supersedesId?: string | null;
};

export type LivHypothesisDraft = {
  title: string;
  summary: string;
  domain: "operational" | "revenue" | "relationship" | "trust" | "growth" | "capability";
  confidence: "high" | "medium" | "low";
  evidenceKeys: string[];
};

export type LivHypothesisEligibilityInput = {
  daysActive: number;
  completedBookings: number;
  memoryRowCount: number;
  existingHypothesisCount: number;
};

const LEARNING_SOURCES: LivLearningSource[] = [
  "correction",
  "override_staff",
  "override_time",
  "hypothesis_confirm",
  "twin_confirm",
];

function encodeField(value: string): string {
  return value.replace(/\|/g, "/").slice(0, 240);
}

/** Compact episodic row stored in liv_entity_memory. */
export function formatLivLearningMemory(
  record: LivLearningMemoryRecord,
): string {
  const parts = [
    `${LIV_LEARNING_MEMORY_PREFIX}${record.source}`,
    `summary:${encodeField(record.summary)}`,
  ];
  if (record.entityType) parts.push(`entity:${record.entityType}`);
  if (record.entityId) parts.push(`entityId:${encodeField(record.entityId)}`);
  if (record.evidenceRef) parts.push(`evidence:${encodeField(record.evidenceRef)}`);
  if (record.ticketId) parts.push(`ticket:${record.ticketId}`);
  if (record.bookingId) parts.push(`booking:${record.bookingId}`);
  if (record.observationKey) parts.push(`obs:${encodeField(record.observationKey)}`);
  if (record.hypothesisId) parts.push(`hypothesis:${record.hypothesisId}`);
  return parts.join("|");
}

export function parseLivLearningMemory(content: string): LivLearningMemoryRecord | null {
  if (!content.startsWith(LIV_LEARNING_MEMORY_PREFIX)) return null;
  const source = content.match(/liv\.learn:(\w+)/)?.[1] as LivLearningSource | undefined;
  if (!source || !LEARNING_SOURCES.includes(source)) return null;
  const summary = content.match(/summary:([^|]+)/)?.[1]?.replace(/\//g, "|") ?? "";
  if (!summary) return null;
  const entityType = content.match(/entity:(\w+)/)?.[1] as LivLearningMemoryRecord["entityType"];
  const entityId = content.match(/entityId:([^|]+)/)?.[1]?.replace(/\//g, "|");
  const evidenceRef = content.match(/evidence:([^|]+)/)?.[1]?.replace(/\//g, "|");
  const ticketId = content.match(/ticket:([^|]+)/)?.[1];
  const bookingId = content.match(/booking:([^|]+)/)?.[1];
  const observationKey = content.match(/obs:([^|]+)/)?.[1]?.replace(/\//g, "|");
  const hypothesisId = content.match(/hypothesis:([^|]+)/)?.[1];
  return {
    source,
    summary,
    entityType,
    entityId,
    evidenceRef,
    ticketId,
    bookingId,
    observationKey,
    hypothesisId,
  };
}

/** Owner/staff corrections outrank Liv auto-notes; superseded rows drop out. */
export function rankMemoryRowsForPrompt(rows: LivMemoryRowForRanking[]): LivMemoryRowForRanking[] {
  const superseded = new Set(
    rows.map((r) => r.supersedesId).filter((id): id is string => Boolean(id)),
  );
  const visible = rows.filter((r) => !superseded.has(r.id));

  const score = (row: LivMemoryRowForRanking): number => {
    if (row.content.startsWith(LIV_LEARNING_MEMORY_PREFIX)) {
      const parsed = parseLivLearningMemory(row.content);
      if (parsed?.source === "correction") return 100;
      if (parsed?.source === "hypothesis_confirm" || parsed?.source === "twin_confirm") return 90;
      if (parsed?.source === "override_staff" || parsed?.source === "override_time") return 85;
    }
    if (row.createdBy === "owner") return 80;
    if (row.createdBy === "staff") return 75;
    if (row.kind === "procedural") return 70;
    if (row.createdBy === "liv") return 40;
    return 50;
  };

  return [...visible].sort((a, b) => score(b) - score(a));
}

export function buildLivLearningPromptLines(args: {
  learningRows: LivLearningMemoryRecord[];
  operatorPatterns: OperatorDecisionRecord[];
}): string[] {
  const lines: string[] = [];
  for (const row of args.learningRows.slice(0, 8)) {
    const label =
      row.source === "correction"
        ? "Correction (trust this)"
        : row.source === "override_staff"
          ? "Staff override"
          : row.source === "override_time"
            ? "Time override"
            : row.source === "hypothesis_confirm"
              ? "Confirmed pattern"
              : row.source === "twin_confirm"
                ? "Confirmed insight"
                : "Learned";
    lines.push(`- [${label}] ${row.summary}`);
  }
  if (args.operatorPatterns.length > 0) {
    const recent = args.operatorPatterns.slice(0, 4);
    for (const p of recent) {
      lines.push(
        `- [Operator decision] ${p.kind}: ${p.eventType ?? "event"} · ${p.guestCount ?? "?"} guests`,
      );
    }
  }
  return lines;
}

export function resolveHypothesisEligibility(
  input: LivHypothesisEligibilityInput,
): { eligible: boolean; reason?: string } {
  if (input.daysActive < 7) {
    return { eligible: false, reason: "Business too new for hypothesis pass" };
  }
  if (input.completedBookings < 5) {
    return { eligible: false, reason: "Not enough completed visits" };
  }
  if (input.existingHypothesisCount >= 5) {
    return { eligible: false, reason: "Hypothesis backlog full" };
  }
  return { eligible: true };
}

const VALID_DOMAINS = new Set<LivHypothesisDraft["domain"]>([
  "operational",
  "revenue",
  "relationship",
  "trust",
  "growth",
  "capability",
]);

const VALID_CONFIDENCE = new Set<LivHypothesisDraft["confidence"]>(["high", "medium", "low"]);

/** Validate LLM hypothesis output — reject hallucinated structure. */
export function validateHypothesisDrafts(
  raw: unknown,
  allowedEvidenceKeys: Set<string>,
): LivHypothesisDraft[] {
  if (!Array.isArray(raw)) return [];
  const out: LivHypothesisDraft[] = [];
  for (const item of raw.slice(0, 3)) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const summary = typeof o.summary === "string" ? o.summary.trim() : "";
    const domain = o.domain as LivHypothesisDraft["domain"];
    const confidence = o.confidence as LivHypothesisDraft["confidence"];
    const evidenceKeys = Array.isArray(o.evidenceKeys)
      ? o.evidenceKeys.filter((k): k is string => typeof k === "string")
      : [];
    if (!title || !summary || !VALID_DOMAINS.has(domain) || !VALID_CONFIDENCE.has(confidence)) {
      continue;
    }
    const grounded = evidenceKeys.filter((k) => allowedEvidenceKeys.has(k));
    if (grounded.length === 0) continue;
    out.push({ title, summary, domain, confidence, evidenceKeys: grounded });
  }
  return out;
}

export function livLearningSignalCopy(args: {
  source: LivLearningSource;
  summary: string;
}): { title: string; body: string } {
  switch (args.source) {
    case "correction":
      return {
        title: "Liv learned from your correction",
        body: args.summary,
      };
    case "override_staff":
      return {
        title: "Liv noticed a staff preference",
        body: args.summary,
      };
    case "override_time":
      return {
        title: "Liv noticed a scheduling pattern",
        body: args.summary,
      };
    case "hypothesis_confirm":
      return {
        title: "Pattern confirmed",
        body: args.summary,
      };
    case "twin_confirm":
      return {
        title: "Insight saved to memory",
        body: args.summary,
      };
    default:
      return { title: "Liv updated her memory", body: args.summary };
  }
}

export function twinConfirmMemorySummary(title: string, body: string): string {
  return `${title} — ${body}`.slice(0, 400);
}

export function hypothesisConfirmMemorySummary(title: string, summary: string): string {
  return `${title}: ${summary}`.slice(0, 400);
}

export function parseLearningRowsFromMemoryContents(
  contents: string[],
): LivLearningMemoryRecord[] {
  return contents
    .map((c) => parseLivLearningMemory(c))
    .filter((r): r is LivLearningMemoryRecord => r != null);
}

export type LearningPassTriggerReason =
  | "milestone_completed_bookings"
  | "correction_recorded"
  | "override_recorded"
  | "nightly_cron";

/** Usage-based gates — hypothesis pass runs when business earns enough signal. */
export const LEARNING_PASS_MILESTONES = [5, 10, 25, 50] as const;

export function resolveLearningPassTrigger(input: {
  reason: LearningPassTriggerReason;
  completedBookings: number;
  daysActive: number;
  overrideCount30d: number;
  hoursSinceLastPass?: number | null;
}): { shouldRun: boolean; detail?: string } {
  if (input.reason === "correction_recorded") {
    return {
      shouldRun: input.completedBookings >= 3,
      detail: "Owner correction — fast learning pass",
    };
  }
  if (input.reason === "override_recorded") {
    return {
      shouldRun: input.overrideCount30d >= 2 && input.completedBookings >= 3,
      detail: "Repeated staff overrides after Liv bookings",
    };
  }
  if (input.reason === "milestone_completed_bookings") {
    const hit = LEARNING_PASS_MILESTONES.includes(
      input.completedBookings as (typeof LEARNING_PASS_MILESTONES)[number],
    );
    return hit
      ? { shouldRun: true, detail: `${input.completedBookings} completed visits` }
      : { shouldRun: false };
  }
  if (input.reason === "nightly_cron") {
    return { shouldRun: true, detail: "Scheduled nightly pass" };
  }
  if (input.hoursSinceLastPass != null && input.hoursSinceLastPass < 6) {
    return { shouldRun: false, detail: "Cooldown active" };
  }
  return { shouldRun: false };
}

/** Surfaces that must consume liv-learning-program when it changes. */
export const LIV_LEARNING_SURFACE_IDS = [
  "tenant.owner.dashboard",
  "tenant.staff.my-day",
  "tenant.inbox",
  "guest.public.book",
  "internal.ops.support",
] as const;

export const LIV_LEARNING_POLICY_MODULES = [
  "liv-learning-program.ts",
  "liv-operator-learning-policy.ts",
  "liv-memory-copy.ts",
] as const;
