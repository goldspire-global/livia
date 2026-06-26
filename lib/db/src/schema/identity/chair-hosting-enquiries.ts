import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";

/** Renter interest from public book page — host reviews on /host. */
export const chairHostingEnquiriesTable = pgTable(
  "chair_hosting_enquiries",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone"),
    specialty: text("specialty"),
    message: text("message"),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("chair_hosting_enquiries_business_idx").on(t.businessId),
    index("chair_hosting_enquiries_status_idx").on(t.businessId, t.status),
  ],
);

export type ChairHostingEnquiry = typeof chairHostingEnquiriesTable.$inferSelect;
