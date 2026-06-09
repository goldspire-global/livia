/**
 * Domain event → Liv signals (fast, synchronous).
 * LLM briefing regen stays in Inngest `liv-briefing-refresh`.
 */
import { db, bookingsTable, conversationsTable, businessesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import type { EventName, EventPayload } from "@workspace/event-bus";
import {
  domainEventToLivReaction,
  reactionsForEvent,
  todayInTimezone,
  type LivReactionKind,
  type LivSignalPriority,
} from "@workspace/liv-runtime";
import { upsertLivSignal } from "./liv-signals.service";
import { logger } from "../lib/logger";

async function bookingContext(businessId: string, bookingId: string) {
  const [row] = await db
    .select({
      id: bookingsTable.id,
      status: bookingsTable.status,
      startAt: bookingsTable.startAt,
      source: bookingsTable.source,
    })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.businessId, businessId)));
  return row;
}

async function conversationContext(businessId: string, conversationId: string) {
  const [row] = await db
    .select({
      id: conversationsTable.id,
      status: conversationsTable.status,
      channel: conversationsTable.channel,
      customerName: conversationsTable.customerName,
    })
    .from(conversationsTable)
    .where(
      and(eq(conversationsTable.id, conversationId), eq(conversationsTable.businessId, businessId)),
    );
  return row;
}

function priorityFor(kind: LivReactionKind, override?: LivSignalPriority): LivSignalPriority {
  if (override) return override;
  if (kind === "coach_owner") return "act";
  if (kind === "pause_liv") return "watch";
  return "info";
}

function formatSignalCopy(args: {
  templateKey: string;
  booking?: { source?: string | null; startAt?: Date };
  conversation?: { customerName?: string | null; channel?: string };
  twin?: { title?: string; body?: string };
}): { title: string; body: string } {
  const source = args.booking?.source?.replace(/-/g, " ") ?? "a channel";
  const time = args.booking?.startAt
    ? new Date(args.booking.startAt).toLocaleString("en-IE", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  switch (args.templateKey) {
    case "booking.created.count":
      return {
        title: "New booking",
        body: time
          ? `Liv logged a new appointment (${source}) for ${time}.`
          : `Liv logged a new appointment from ${source}.`,
      };
    case "booking.confirmed.count":
      return {
        title: "Booking confirmed",
        body: time ? `Appointment confirmed for ${time}.` : "Appointment confirmed.",
      };
    case "booking.cancelled.count":
      return {
        title: "Booking cancelled",
        body: time ? `A booking for ${time} was cancelled.` : "A booking was cancelled.",
      };
    case "booking.no_show.recovery":
      return {
        title: "No-show — act",
        body: "Liv flagged a no-show. Recovery workflow is running; review the client when you can.",
      };
    case "conversation.handed_off":
      return {
        title: "Thread handed to you",
        body: args.conversation?.customerName
          ? `${args.conversation.customerName} needs a human on ${args.conversation.channel ?? "inbox"}. Liv stepped back.`
          : "A conversation was handed off — Liv stepped back until you reply.",
      };
    case "morning.briefing":
      return {
        title: "Morning briefing ready",
        body: "Today's Liv briefing is ready on your home screen.",
      };
    case "payment.failed":
      return {
        title: "Payment failed",
        body: "A card payment did not go through — review billing or send a new link.",
      };
    case "commerce.signal":
      return {
        title: "Commerce signal",
        body: "Liv spotted a revenue pattern worth your attention — check Billing or ask Liv.",
      };
    case "twin.observation":
    case "twin.insight":
    case "twin.risk":
    case "twin.opportunity":
      return {
        title: args.twin?.title ?? "Business insight",
        body: args.twin?.body ?? "Liv noticed a pattern in your shop facts.",
      };
    default:
      return { title: "Liv noticed", body: "Something changed in your shop — check Today." };
  }
}

export async function processLivReactionsForEvent<K extends EventName>(
  name: K,
  payload: EventPayload<K>,
): Promise<{ signalsCreated: number }> {
  const livEvent = domainEventToLivReaction(name);
  if (!livEvent) return { signalsCreated: 0 };

  const reactions = reactionsForEvent(livEvent, "tenant");
  if (reactions.length === 0) return { signalsCreated: 0 };

  const p = payload as {
    businessId: string;
    bookingId?: string;
    conversationId?: string;
    status?: string;
    title?: string;
    body?: string;
    observationKey?: string;
    riskId?: string;
    opportunityId?: string;
    confidence?: "high" | "medium" | "low";
    href?: string;
  };

  const [biz] = await db
    .select({ timezone: businessesTable.timezone })
    .from(businessesTable)
    .where(eq(businessesTable.id, p.businessId));
  const dayKey = todayInTimezone(biz?.timezone ?? "Europe/Dublin");

  let signalsCreated = 0;

  for (const reaction of reactions) {
    if (reaction.event === "conversation.updated" && p.status !== "HANDED_OFF") {
      continue;
    }

    const bookingCtx = p.bookingId
      ? await bookingContext(p.businessId, p.bookingId)
      : undefined;
    const conversationCtx = p.conversationId
      ? await conversationContext(p.businessId, p.conversationId)
      : undefined;

    const { title, body } = formatSignalCopy({
      templateKey: reaction.templateKey,
      booking: bookingCtx,
      conversation: conversationCtx,
      twin: p.title && p.body ? { title: p.title, body: p.body } : undefined,
    });

    const entityKey =
      p.bookingId ??
      p.conversationId ??
      p.observationKey ??
      p.riskId ??
      p.opportunityId ??
      name;
    const dedupeKey = `${p.businessId}:${reaction.templateKey}:${entityKey}:${dayKey}`;

    const twinPriority =
      p.confidence === "high" ? "act" : p.confidence === "medium" ? "watch" : undefined;

    const inserted = await upsertLivSignal({
      businessId: p.businessId,
      kind: reaction.kind,
      priority: priorityFor(reaction.kind, twinPriority ?? reaction.priority),
      title,
      body,
      dedupeKey,
      eventName: name,
      entityType: p.bookingId
        ? "booking"
        : p.conversationId
          ? "conversation"
          : p.observationKey
            ? "twin_observation"
            : p.riskId
              ? "twin_risk"
              : p.opportunityId
                ? "twin_opportunity"
                : undefined,
      entityId:
        p.bookingId ??
        p.conversationId ??
        p.observationKey ??
        p.riskId ??
        p.opportunityId,
      ttlHours: reaction.kind === "coach_owner" ? 168 : 72,
    });
    if (inserted) signalsCreated += 1;
  }

  if (signalsCreated > 0) {
    logger.info({ name, businessId: p.businessId, signalsCreated }, "liv reactions materialized");
  }

  return { signalsCreated };
}
