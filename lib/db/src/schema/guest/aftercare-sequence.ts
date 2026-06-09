import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { businessesTable } from "../identity/businesses";
import { bookingsTable } from "../booking/bookings";

export const aftercareSequenceStepsTable = pgTable(
  "aftercare_sequence_steps",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookingsTable.id, { onDelete: "cascade" }),
    stepIndex: integer("step_index").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("pending"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("aftercare_sequence_booking_idx").on(t.bookingId),
    index("aftercare_sequence_scheduled_idx").on(t.status, t.scheduledAt),
  ],
);
