/**
 * Liv was wrong → structured correction memory + eval trace + domain events.
 */
import { db, bookingsTable, conversationsTable, supportTicketsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { appendHumanAudit } from "../lib/audit";
import { recordLivWasWrongEvalTrace } from "../lib/eval-traces";
import { publishDomainEvent } from "../lib/domain-events";
import { recordLearningMemory, publishLearningDomainEvent } from "./liv-learning.service";
import { logger } from "../lib/logger";

export type LivErrorReportInput = {
  businessId: string;
  ticketId: string;
  description: string;
  conversationId?: string;
  bookingId?: string;
  reporterUserId?: string;
};

export async function processLivErrorReport(input: LivErrorReportInput): Promise<{
  memoryId: string;
  pausedConversation: boolean;
}> {
  const [ticket] = await db
    .select()
    .from(supportTicketsTable)
    .where(
      and(
        eq(supportTicketsTable.id, input.ticketId),
        eq(supportTicketsTable.businessId, input.businessId),
      ),
    );
  const description = (input.description || ticket?.description || "").trim();
  if (!description) {
    throw new Error("EMPTY_DESCRIPTION");
  }

  let customerId: string | undefined;
  let entityType: "customer" | "business" = "business";
  let entityId = input.businessId;

  if (input.bookingId) {
    const [booking] = await db
      .select({ customerId: bookingsTable.customerId })
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.id, input.bookingId),
          eq(bookingsTable.businessId, input.businessId),
        ),
      );
    if (booking?.customerId) {
      customerId = booking.customerId;
      entityType = "customer";
      entityId = booking.customerId;
    }
  } else if (input.conversationId) {
    const [conv] = await db
      .select({ customerId: conversationsTable.customerId })
      .from(conversationsTable)
      .where(
        and(
          eq(conversationsTable.id, input.conversationId),
          eq(conversationsTable.businessId, input.businessId),
        ),
      );
    if (conv?.customerId) {
      customerId = conv.customerId;
      entityType = "customer";
      entityId = conv.customerId;
    }
  }

  const summary = description.slice(0, 380);
  const { memoryId } = await recordLearningMemory({
    businessId: input.businessId,
    createdBy: "owner",
    sourceRef: input.ticketId,
    metadata: {
      conversationId: input.conversationId ?? null,
      bookingId: input.bookingId ?? null,
      reporterUserId: input.reporterUserId ?? null,
    },
    record: {
      source: "correction",
      summary,
      entityType,
      entityId,
      ticketId: input.ticketId,
      bookingId: input.bookingId,
      evidenceRef: input.bookingId ?? input.conversationId,
    },
  });

  await recordLivWasWrongEvalTrace({
    businessId: input.businessId,
    ticketId: input.ticketId,
    description: summary,
    bookingId: input.bookingId,
    conversationId: input.conversationId,
    memoryId,
  });

  void publishDomainEvent(
    "eval.rollback.triggered",
    {
      businessId: input.businessId,
      suite: "liv.was_wrong",
      rollbackClass: "POLICY_VIOLATION",
      requiresHumanApproval: true,
    },
    `${input.businessId}:eval-rollback:${input.ticketId}`,
  );

  void publishLearningDomainEvent(
    "correction",
    {
      businessId: input.businessId,
      ticketId: input.ticketId,
      memoryId,
      bookingId: input.bookingId ?? null,
      conversationId: input.conversationId ?? null,
      summary,
    },
    `${input.businessId}:learning-correction:${input.ticketId}`,
  );

  let pausedConversation = false;
  if (input.conversationId) {
    const [conv] = await db
      .select({ status: conversationsTable.status, aiHandled: conversationsTable.aiHandled })
      .from(conversationsTable)
      .where(eq(conversationsTable.id, input.conversationId));
    if (conv?.aiHandled) {
      await db
        .update(conversationsTable)
        .set({ aiHandled: false, status: "HANDED_OFF", updatedAt: new Date() })
        .where(eq(conversationsTable.id, input.conversationId));
      pausedConversation = true;
    }
  }

  if (input.reporterUserId) {
    await appendHumanAudit(
      input.businessId,
      input.reporterUserId,
      "human.liv.correction.reported",
      "support_ticket",
      input.ticketId,
      {
        memoryId,
        bookingId: input.bookingId ?? null,
        conversationId: input.conversationId ?? null,
      },
    );
  }

  logger.info(
    {
      businessId: input.businessId,
      ticketId: input.ticketId,
      memoryId,
      pausedConversation,
    },
    "liv-error-report processed into learning memory",
  );

  return { memoryId, pausedConversation };
}
