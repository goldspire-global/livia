/**
 * Liv learning — central memory write + domain event publisher.
 * Signals materialize via liv-reactions on domain events (single path).
 */
import {
  formatLivLearningMemory,
  type LivLearningMemoryRecord,
  type LivLearningSource,
} from "@workspace/policy";
import { appendLivMemory } from "./liv-memory.service";
import { publishDomainEvent } from "../lib/domain-events";
import { invalidateOwnerIntelligenceCache } from "./owner-intelligence-cache";

const MEMORY_KIND = "procedural";
const MEMORY_TTL_DAYS = 400;

export async function recordLearningMemory(args: {
  businessId: string;
  record: LivLearningMemoryRecord;
  createdBy: "owner" | "staff" | "liv";
  supersedesMemoryId?: string;
  sourceRef?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ memoryId: string }> {
  const content = formatLivLearningMemory(args.record);
  const row = await appendLivMemory({
    businessId: args.businessId,
    entityType: args.record.entityType ?? "business",
    entityId: args.record.entityId ?? args.businessId,
    kind: MEMORY_KIND,
    content,
    createdBy: args.createdBy,
    ttlDays: MEMORY_TTL_DAYS,
    supersedesId: args.supersedesMemoryId,
    sourceRef: args.sourceRef,
    metadata: args.metadata,
  });

  invalidateOwnerIntelligenceCache(args.businessId);
  return { memoryId: row.id };
}

export async function publishLearningDomainEvent(
  source: LivLearningSource,
  payload: Record<string, unknown>,
  dedupeKey: string,
): Promise<void> {
  if (source === "correction") {
    void publishDomainEvent(
      "liv.learning.correction.recorded",
      payload as {
        businessId: string;
        ticketId: string;
        memoryId: string;
        bookingId: string | null;
        conversationId: string | null;
      },
      dedupeKey,
    );
    return;
  }
  if (source === "override_staff" || source === "override_time") {
    void publishDomainEvent(
      "liv.learning.override.recorded",
      payload as {
        businessId: string;
        bookingId: string;
        memoryId: string;
        overrideKind: "staff" | "time";
      },
      dedupeKey,
    );
    return;
  }
  if (source === "hypothesis_confirm") {
    return;
  }
  void publishDomainEvent(
    "liv.learning.hypothesis.proposed",
    payload as {
      businessId: string;
      hypothesisId: string;
      title: string;
      confidence: "high" | "medium" | "low";
    },
    dedupeKey,
  );
}
