import { db, eventsTable } from "@workspace/db";
import type { EventTypeLiteral } from "@workspace/db";
import { validateAnalyticsEventType } from "@workspace/policy";
import { generateId } from "../lib/id";
import { logger } from "../lib/logger";

export async function logEvent(opts: {
  type: EventTypeLiteral | string;
  businessId?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  context?: Record<string, unknown>;
  level?: "INFO" | "WARN" | "ERROR";
}): Promise<void> {
  const validation = validateAnalyticsEventType(opts.type);
  if (!validation.catalogued && process.env.NODE_ENV !== "production") {
    logger.warn(
      { type: opts.type, businessId: opts.businessId },
      "analytics event type not in EVENT_CATALOG — add mapping in lib/policy/event-catalog.ts",
    );
  }

  try {
    await db.insert(eventsTable).values({
      id: generateId(),
      type: opts.type,
      source: "api",
      level: opts.level ?? "INFO",
      businessId: opts.businessId,
      userId: opts.userId,
      entityType: opts.entityType,
      entityId: opts.entityId,
      context: opts.context ?? {},
    });
  } catch {
    // never let event logging crash the main flow
  }
}
