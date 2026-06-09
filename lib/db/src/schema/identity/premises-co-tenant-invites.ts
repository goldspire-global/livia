import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { premisesTable } from "./premises";
import { businessesTable } from "./businesses";

export const premisesCoTenantInvitesTable = pgTable(
  "premises_co_tenant_invites",
  {
    id: text("id").primaryKey(),
    premisesId: text("premises_id")
      .notNull()
      .references(() => premisesTable.id, { onDelete: "cascade" }),
    invitingBusinessId: text("inviting_business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    invitedEmail: text("invited_email").notNull(),
    publicLabel: text("public_label").notNull(),
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("pending"),
    acceptedBusinessId: text("accepted_business_id").references(() => businessesTable.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("premises_co_tenant_invites_premises_idx").on(t.premisesId),
    index("premises_co_tenant_invites_token_idx").on(t.token),
  ],
);
