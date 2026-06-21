import {
  db,
  bookingsTable,
  businessesTable,
  customersTable,
  notificationLogsTable,
} from "@workspace/db";
import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { beautyRebookSmsBody, customerAllowsMarketingSms } from "@workspace/policy";
import { generateId } from "../lib/id";
import { resolveGuestBookUrl } from "../lib/guest-public-urls";
import { createConversation, attachCustomer } from "./conversations.service";
import { sendAiSms } from "./ai-outbound.service";
import {
  getBeautyFillCycleRadar,
  type FillCycleRow,
} from "./beauty-ops.service";

const TEMPLATE_KEY = "beauty-fill-cycle-rebook";
const DEDUP_MS = 7 * 24 * 60 * 60_000;

export type FillCycleNudgeResult = {
  attempted: number;
  sent: number;
  skipped: Array<{ customerId: string; reason: string }>;
  dryRun?: boolean;
};

async function customersWithUpcomingBookings(
  businessId: string,
  customerIds: string[],
): Promise<Set<string>> {
  if (customerIds.length === 0) return new Set();
  const rows = await db
    .selectDistinct({ customerId: bookingsTable.customerId })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.businessId, businessId),
        inArray(bookingsTable.customerId, customerIds),
        inArray(bookingsTable.status, ["PENDING", "CONFIRMED"]),
        gt(bookingsTable.startAt, new Date()),
      ),
    );
  return new Set(rows.map((r) => r.customerId));
}

async function recentlyNudged(
  businessId: string,
  customerId: string,
  serviceId: string,
): Promise<boolean> {
  const since = new Date(Date.now() - DEDUP_MS);
  const [hit] = await db
    .select({ id: notificationLogsTable.id })
    .from(notificationLogsTable)
    .where(
      and(
        eq(notificationLogsTable.businessId, businessId),
        eq(notificationLogsTable.customerId, customerId),
        eq(notificationLogsTable.templateKey, TEMPLATE_KEY),
        eq(notificationLogsTable.status, "SENT"),
        gt(notificationLogsTable.sentAt, since),
        sql`${notificationLogsTable.payload}->>'serviceId' = ${serviceId}`,
      ),
    )
    .limit(1);
  return !!hit;
}

function bookUrl(slug: string, serviceId: string): string {
  return resolveGuestBookUrl(slug, `service=${encodeURIComponent(serviceId)}`);
}

export async function sendBeautyFillCycleNudges(
  businessId: string,
  opts?: {
    customerIds?: string[];
    dryRun?: boolean;
    limit?: number;
  },
): Promise<FillCycleNudgeResult> {
  const [biz] = await db
    .select({
      name: businessesTable.name,
      slug: businessesTable.slug,
      twilioPhoneNumber: businessesTable.twilioPhoneNumber,
      vertical: businessesTable.vertical,
    })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);

  if (!biz || biz.vertical !== "beauty" || !biz.slug) {
    return { attempted: 0, sent: 0, skipped: [], dryRun: opts?.dryRun };
  }

  const radar = await getBeautyFillCycleRadar(businessId);
  let rows: FillCycleRow[] = radar.rows;
  if (opts?.customerIds?.length) {
    const allow = new Set(opts.customerIds);
    rows = rows.filter((r) => allow.has(r.customerId));
  }
  const limit = Math.min(25, Math.max(1, opts?.limit ?? 10));
  rows = rows.slice(0, limit);

  if (rows.length === 0) {
    return { attempted: 0, sent: 0, skipped: [], dryRun: opts?.dryRun };
  }

  const customerIds = [...new Set(rows.map((r) => r.customerId))];
  const upcoming = await customersWithUpcomingBookings(businessId, customerIds);

  const customers = await db
    .select({
      id: customersTable.id,
      phone: customersTable.phone,
      firstName: customersTable.firstName,
      displayName: customersTable.displayName,
      consent: customersTable.consent,
    })
    .from(customersTable)
    .where(
      and(eq(customersTable.businessId, businessId), inArray(customersTable.id, customerIds)),
    );
  const phoneById = new Map(customers.map((c) => [c.id, c.phone]));
  const consentById = new Map(customers.map((c) => [c.id, c.consent]));

  const result: FillCycleNudgeResult = {
    attempted: 0,
    sent: 0,
    skipped: [],
    dryRun: opts?.dryRun,
  };

  for (const row of rows) {
    result.attempted++;

    if (upcoming.has(row.customerId)) {
      result.skipped.push({ customerId: row.customerId, reason: "upcoming_booking" });
      continue;
    }

    const phone = phoneById.get(row.customerId)?.trim();
    if (!phone) {
      result.skipped.push({ customerId: row.customerId, reason: "no_phone" });
      continue;
    }

    if (!customerAllowsMarketingSms(consentById.get(row.customerId))) {
      result.skipped.push({ customerId: row.customerId, reason: "sms_consent" });
      continue;
    }

    if (await recentlyNudged(businessId, row.customerId, row.serviceId)) {
      result.skipped.push({ customerId: row.customerId, reason: "nudged_recently" });
      continue;
    }

    const url = bookUrl(biz.slug, row.serviceId);
    const body = beautyRebookSmsBody({
      businessName: biz.name,
      serviceName: row.serviceName,
      bookUrl: url,
      daysOverdue: row.daysOverdue > 0 ? row.daysOverdue : undefined,
    });

    if (opts?.dryRun) {
      result.sent++;
      continue;
    }

    if (!biz.twilioPhoneNumber) {
      result.skipped.push({ customerId: row.customerId, reason: "no_twilio_sender" });
      continue;
    }

    const cust = customers.find((c) => c.id === row.customerId);
    const name =
      cust?.displayName?.trim() ||
      cust?.firstName?.trim() ||
      row.customerName;

    const conversation = await createConversation({
      businessId,
      channel: "SMS",
      customerName: name,
      customerPhone: phone,
    });
    await attachCustomer(conversation.id, row.customerId, {
      name,
      phone,
    });

    const sent = await sendAiSms({
      conversationId: conversation.id,
      businessId,
      businessName: biz.name,
      customerId: row.customerId,
      customerPhone: phone,
      content: body,
      fromPhone: biz.twilioPhoneNumber,
    });

    if (sent.status === "SENT") {
      await db.insert(notificationLogsTable).values({
        id: generateId(),
        businessId,
        customerId: row.customerId,
        channel: "SMS",
        templateKey: TEMPLATE_KEY,
        status: "SENT",
        payload: { serviceId: row.serviceId, bookUrl: url, body },
        sentAt: new Date(),
      });
      result.sent++;
    } else {
      result.skipped.push({ customerId: row.customerId, reason: "send_failed" });
    }
  }

  return result;
}

/** Daily sweep — all beauty tenants with due fill-cycle clients. */
export async function sweepBeautyFillCycleNudges(): Promise<{
  businesses: number;
  sent: number;
  skipped: number;
}> {
  const rows = await db
    .select({ id: businessesTable.id })
    .from(businessesTable)
    .where(eq(businessesTable.vertical, "beauty"));

  let sent = 0;
  let skipped = 0;
  for (const { id } of rows) {
    const radar = await getBeautyFillCycleRadar(id);
    if (radar.dueCount === 0) continue;
    const result = await sendBeautyFillCycleNudges(id, { limit: 5 });
    sent += result.sent;
    skipped += result.skipped.length;
  }
  return { businesses: rows.length, sent, skipped };
}
