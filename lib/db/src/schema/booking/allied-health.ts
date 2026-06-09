import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { businessesTable } from "../identity/businesses";
import { customersTable } from "./customers";
import { bookingsTable } from "./bookings";

export const alliedClinicalNotesTable = pgTable(
  "allied_clinical_notes",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => customersTable.id, { onDelete: "cascade" }),
    bookingId: text("booking_id").references(() => bookingsTable.id, { onDelete: "set null" }),
    authorUserId: text("author_user_id"),
    subjective: text("subjective"),
    objective: text("objective"),
    assessment: text("assessment"),
    plan: text("plan"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("allied_clinical_notes_business_customer_idx").on(
      t.businessId,
      t.customerId,
      t.createdAt,
    ),
  ],
);

export type AlliedClinicalNote = typeof alliedClinicalNotesTable.$inferSelect;
