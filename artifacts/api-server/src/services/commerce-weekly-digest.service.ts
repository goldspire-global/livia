import { db, businessesTable, businessMembershipsTable, usersTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getCommerceSignalsBundle, syncCommerceIntelligenceLoop } from "./commerce-signals.service";
import { sendOperationalEmail } from "./transactional-email.service";
import { logger } from "../lib/logger";

async function resolveOwnerEmail(businessId: string): Promise<string | null> {
  const [row] = await db
    .select({ email: usersTable.email })
    .from(businessMembershipsTable)
    .innerJoin(usersTable, eq(usersTable.id, businessMembershipsTable.userId))
    .where(
      and(
        eq(businessMembershipsTable.businessId, businessId),
        eq(businessMembershipsTable.role, "OWNER"),
      ),
    )
    .limit(1);
  return row?.email?.trim() ?? null;
}

export type CommerceDailySyncResult = {
  businessId: string;
  signalsSynced: number;
  proposalsCreated: number;
  topSignalId?: string;
};

/** Daily commerce intelligence — sync Liv moments + remediation proposals (push via domain events). */
export async function runCommerceIntelligenceDaily(
  businessId: string,
): Promise<CommerceDailySyncResult> {
  const { signalsSynced, proposalsCreated } = await syncCommerceIntelligenceLoop(businessId);
  const bundle = await getCommerceSignalsBundle(businessId);
  const top = bundle.signals.find((s) => s.severity === "act");

  if (proposalsCreated > 0) {
    logger.info({ businessId, proposalsCreated }, "commerce intelligence daily proposals");
  }

  return {
    businessId,
    signalsSynced,
    proposalsCreated,
    topSignalId: top?.id,
  };
}

export async function sendCommerceWeeklyDigestEmail(
  businessId: string,
): Promise<"sent" | "skipped" | "failed"> {
  const [biz] = await db
    .select({ name: businessesTable.name })
    .from(businessesTable)
    .where(eq(businessesTable.id, businessId))
    .limit(1);
  if (!biz) return "skipped";

  const bundle = await getCommerceSignalsBundle(businessId);
  const to = await resolveOwnerEmail(businessId);
  if (!to) {
    logger.warn({ businessId }, "commerce-weekly-digest: no owner email");
    return "skipped";
  }

  const captured = bundle.snapshot.capturedLabel;
  const rate =
    bundle.snapshot.captureRatePercent != null
      ? `${bundle.snapshot.captureRatePercent}% capture rate`
      : "capture rate not yet measurable";

  const signalLines = bundle.signals
    .filter((s) => s.severity !== "info")
    .slice(0, 3)
    .map((s) => `• ${s.title} — ${s.body}`);

  const body = [
    `Hi — Liv's commerce digest for ${biz.name}.`,
    ``,
    `${captured} captured in the last 30 days (${rate}).`,
    signalLines.length > 0 ? `` : `No act/watch commerce signals this week — nice work.`,
    ...signalLines,
    ``,
    `Open Settings → Billing or ask Liv on your home screen for next steps.`,
    ``,
    `— Liv`,
  ].join("\n");

  return sendOperationalEmail({
    businessId,
    to,
    subject: `Commerce digest — ${biz.name}`,
    body,
    templateKey: "commerce-weekly-digest",
  });
}
