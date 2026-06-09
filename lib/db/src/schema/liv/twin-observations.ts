import { pgTable, text, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { businessesTable } from "../identity/businesses";

export const twinObservationsTable = pgTable(
  "twin_observations",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    layer: text("layer").notNull().default("observation"),
    observationKey: text("observation_key").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    confidence: text("confidence").notNull().default("medium"),
    evidence: jsonb("evidence").notNull().default([]),
    href: text("href"),
    sourceEvent: text("source_event"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("twin_observations_business_key_idx").on(t.businessId, t.observationKey),
    index("twin_observations_business_created_idx").on(t.businessId, t.createdAt),
  ],
);

export type TwinObservationRow = typeof twinObservationsTable.$inferSelect;
