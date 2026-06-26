/**
 * Detect when staff corrects a Liv-sourced booking → procedural memory.
 */
import { db, bookingsTable, customersTable, staffTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { recordLearningMemory, publishLearningDomainEvent } from "./liv-learning.service";

const LIV_SOURCES = new Set([
  "voice",
  "whatsapp",
  "sms",
  "instagram",
  "messenger",
  "email",
]);

function isLivSourcedBooking(booking: {
  source: string;
  sourceConversationId: string | null;
}): boolean {
  return (
    LIV_SOURCES.has(booking.source) &&
    booking.sourceConversationId != null &&
    booking.sourceConversationId.length > 0
  );
}

async function customerName(businessId: string, customerId: string): Promise<string> {
  const [row] = await db
    .select({ firstName: customersTable.firstName, lastName: customersTable.lastName })
    .from(customersTable)
    .where(and(eq(customersTable.id, customerId), eq(customersTable.businessId, businessId)));
  if (!row) return "Guest";
  return [row.firstName, row.lastName].filter(Boolean).join(" ") || "Guest";
}

async function staffName(staffId: string | null): Promise<string> {
  if (!staffId) return "unassigned";
  const [row] = await db
    .select({ firstName: staffTable.firstName, lastName: staffTable.lastName })
    .from(staffTable)
    .where(eq(staffTable.id, staffId));
  if (!row) return "staff";
  return [row.firstName, row.lastName].filter(Boolean).join(" ") || "staff";
}

export async function maybeRecordBookingStaffOverride(args: {
  businessId: string;
  bookingId: string;
  previousStaffId: string | null;
  nextStaffId: string | null;
}): Promise<void> {
  if (!args.nextStaffId || args.nextStaffId === args.previousStaffId) return;

  const [booking] = await db
    .select({
      source: bookingsTable.source,
      sourceConversationId: bookingsTable.sourceConversationId,
      customerId: bookingsTable.customerId,
    })
    .from(bookingsTable)
    .where(
      and(eq(bookingsTable.id, args.bookingId), eq(bookingsTable.businessId, args.businessId)),
    );
  if (!booking || !isLivSourcedBooking(booking)) return;

  const [guest, from, to] = await Promise.all([
    customerName(args.businessId, booking.customerId),
    staffName(args.previousStaffId),
    staffName(args.nextStaffId),
  ]);

  const summary = `${guest}: reassigned from ${from} to ${to} after Liv booking — prefer ${to}`.slice(
    0,
    380,
  );

  const { memoryId } = await recordLearningMemory({
    businessId: args.businessId,
    createdBy: "liv",
    sourceRef: args.bookingId,
    record: {
      source: "override_staff",
      summary,
      entityType: "customer",
      entityId: booking.customerId,
      bookingId: args.bookingId,
      evidenceRef: `staff:${args.nextStaffId}`,
    },
  });

  void publishLearningDomainEvent(
    "override_staff",
    {
      businessId: args.businessId,
      bookingId: args.bookingId,
      memoryId,
      overrideKind: "staff",
      summary,
    },
    `${args.businessId}:override-staff:${args.bookingId}:${args.nextStaffId}`,
  );
}

export async function maybeRecordBookingTimeOverride(args: {
  businessId: string;
  bookingId: string;
  previousStartAt: Date;
  nextStartAt: Date;
}): Promise<void> {
  if (args.previousStartAt.getTime() === args.nextStartAt.getTime()) return;

  const [booking] = await db
    .select({
      source: bookingsTable.source,
      sourceConversationId: bookingsTable.sourceConversationId,
      customerId: bookingsTable.customerId,
    })
    .from(bookingsTable)
    .where(
      and(eq(bookingsTable.id, args.bookingId), eq(bookingsTable.businessId, args.businessId)),
    );
  if (!booking || !isLivSourcedBooking(booking)) return;

  const guest = await customerName(args.businessId, booking.customerId);
  const prev = args.previousStartAt.toLocaleString("en-IE", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const next = args.nextStartAt.toLocaleString("en-IE", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const summary =
    `${guest}: time moved from ${prev} to ${next} after Liv booking — note preference`.slice(
      0,
      380,
    );

  const { memoryId } = await recordLearningMemory({
    businessId: args.businessId,
    createdBy: "liv",
    sourceRef: args.bookingId,
    record: {
      source: "override_time",
      summary,
      entityType: "customer",
      entityId: booking.customerId,
      bookingId: args.bookingId,
      evidenceRef: `time:${args.nextStartAt.toISOString()}`,
    },
  });

  void publishLearningDomainEvent(
    "override_time",
    {
      businessId: args.businessId,
      bookingId: args.bookingId,
      memoryId,
      overrideKind: "time",
      summary,
    },
    `${args.businessId}:override-time:${args.bookingId}:${args.nextStartAt.toISOString()}`,
  );
}
