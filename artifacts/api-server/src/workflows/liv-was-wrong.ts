import { inngest } from "../lib/inngest";
import { db, eventsTable } from "@workspace/db";
import { generateId } from "../lib/id";
import { logger } from "../lib/logger";
import { processLivErrorReport } from "../services/liv-correction.service";

/**
 * Liv error reports → correction memory, eval trace, pause conversation, incident log.
 */
export const livWasWrong = inngest.createFunction(
  { id: "liv-was-wrong-triage", retries: 3 },
  { event: "support/liv_error.reported" },
  async ({ event, step }) => {
    const data = event.data as {
      businessId: string;
      ticketId: string;
      description?: string;
      conversationId?: string;
      bookingId?: string;
      reporterUserId?: string;
    };

    const result = await step.run("learning-correction", async () =>
      processLivErrorReport({
        businessId: data.businessId,
        ticketId: data.ticketId,
        description: data.description ?? "",
        conversationId: data.conversationId,
        bookingId: data.bookingId,
        reporterUserId: data.reporterUserId,
      }),
    );

    await step.run("incident-log", async () => {
      await db.insert(eventsTable).values({
        id: generateId(),
        type: "INCIDENT_CREATED",
        source: "workflow:liv-was-wrong",
        level: "WARN",
        businessId: data.businessId,
        entityType: "support_ticket",
        entityId: data.ticketId,
        context: {
          conversationId: data.conversationId ?? null,
          bookingId: data.bookingId ?? null,
          memoryId: result.memoryId,
          pausedConversation: result.pausedConversation,
        },
      });
      logger.warn(
        { businessId: data.businessId, ticketId: data.ticketId, memoryId: result.memoryId },
        "liv-was-wrong triage complete — learning memory recorded",
      );
    });

    return { triaged: true, ticketId: data.ticketId, ...result };
  },
);
