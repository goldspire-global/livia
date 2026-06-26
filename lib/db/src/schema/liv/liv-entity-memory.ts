import { pgTable, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { businessesTable } from "../identity/businesses";

export const livEntityMemoryTable = pgTable(
  "liv_entity_memory",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businessesTable.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    kind: text("kind").notNull().default("note"),
    content: text("content").notNull(),
    createdBy: text("created_by").notNull().default("staff"),
    supersedesId: text("supersedes_id"),
    sourceRef: text("source_ref"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => [
    index("liv_entity_memory_entity_idx").on(t.businessId, t.entityType, t.entityId),
  ],
);

export type LivEntityMemory = typeof livEntityMemoryTable.$inferSelect;
