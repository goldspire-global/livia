import { EventType } from "@workspace/db";
import { resolveCommerceSignals, type CommerceSignal } from "@workspace/policy";
import {
  formatCommerceMinor,
  getCommerceSnapshot,
  type CommerceSnapshot,
} from "./commerce-intelligence.service";
import { getDashboardSummary } from "./dashboard.service";
import { upsertLivSignal } from "./liv-signals.service";
import { logEvent } from "./events.service";
import { publishDomainEvent } from "../lib/domain-events";
import { syncCommerceRemediationProposals } from "./commerce-remediation.service";

export type CommerceSignalsBundle = {
  businessId: string;
  generatedAt: string;
  signals: CommerceSignal[];
  snapshot: CommerceSnapshot & { capturedLabel: string };
};

export async function getCommerceSignalsBundle(
  businessId: string,
): Promise<CommerceSignalsBundle> {
  const [snapshot, summary] = await Promise.all([
    getCommerceSnapshot(businessId),
    getDashboardSummary(businessId),
  ]);

  const capturedLabel = formatCommerceMinor(snapshot.capturedMinor30d, snapshot.currency);
  const signals = resolveCommerceSignals({
    capturedMinor30d: snapshot.capturedMinor30d,
    captureRatePercent: snapshot.captureRatePercent,
    paymentCount30d: snapshot.paymentCount30d,
    refundMinor30d: snapshot.refundMinor30d,
    demandBookings: (summary.pendingCount ?? 0) + (summary.confirmedCount ?? 0),
    weekBookings: summary.weekBookings ?? 0,
    capturedLabel,
  });

  return {
    businessId,
    generatedAt: new Date().toISOString(),
    signals,
    snapshot: { ...snapshot, capturedLabel },
  };
}

/** Materialize act/watch commerce signals as Liv moments (deduped). */
export async function syncCommerceLivSignals(businessId: string): Promise<number> {
  const bundle = await getCommerceSignalsBundle(businessId);
  let created = 0;

  for (const signal of bundle.signals.filter(
    (s) => s.severity === "act" || s.severity === "watch",
  )) {
    const inserted = await upsertLivSignal({
      businessId,
      kind: "coach_owner",
      priority: signal.severity === "act" ? "act" : "watch",
      title: signal.title,
      body: signal.body,
      dedupeKey: `${businessId}:commerce:${signal.id}`,
      eventName: "commerce.signal",
      entityType: "commerce",
      entityId: signal.id,
      ttlHours: 168,
    });
    if (inserted) {
      created += 1;
      void logEvent({
        type: EventType.COMMERCE_SIGNAL_DETECTED,
        businessId,
        entityType: "commerce_signal",
        entityId: signal.id,
        context: { signalId: signal.id, severity: signal.severity },
      });
      void publishDomainEvent(
        "commerce.signal.detected",
        {
          businessId,
          signalId: signal.id,
          severity: signal.severity,
        },
        `${businessId}:commerce-signal:${signal.id}`,
      );
    }
  }

  return created;
}

const commerceLoopLastRun = new Map<string, number>();
const commerceLoopInflight = new Set<string>();
const COMMERCE_LOOP_MIN_MS =
  process.env.NODE_ENV === "development" ? 5 * 60_000 : 90_000;

/** Sync Liv signals + remediation proposals after commerce picture changes. */
export async function syncCommerceIntelligenceLoop(businessId: string): Promise<{
  signalsSynced: number;
  proposalsCreated: number;
}> {
  const now = Date.now();
  const last = commerceLoopLastRun.get(businessId) ?? 0;
  if (commerceLoopInflight.has(businessId) || now - last < COMMERCE_LOOP_MIN_MS) {
    return { signalsSynced: 0, proposalsCreated: 0 };
  }

  commerceLoopInflight.add(businessId);
  commerceLoopLastRun.set(businessId, now);
  try {
    const signalsSynced = await syncCommerceLivSignals(businessId);
    const bundle = await getCommerceSignalsBundle(businessId);
    const proposalsCreated = await syncCommerceRemediationProposals(businessId, bundle.signals);
    const { syncTwinObservations } = await import("./twin-observations.service");
    void syncTwinObservations(businessId).catch(() => undefined);
    const { invalidateOwnerIntelligenceCache } = await import("./owner-intelligence-cache");
    invalidateOwnerIntelligenceCache(businessId);
    return { signalsSynced, proposalsCreated };
  } finally {
    commerceLoopInflight.delete(businessId);
  }
}

export async function materializePaymentFailedSignal(args: {
  businessId: string;
  paymentId: string;
  amountMinor?: number;
  currency?: string;
}): Promise<void> {
  const amount =
    args.amountMinor != null && args.currency
      ? formatCommerceMinor(args.amountMinor, args.currency)
      : "A payment";
  await upsertLivSignal({
    businessId: args.businessId,
    kind: "coach_owner",
    priority: "watch",
    title: "Payment failed",
    body: `${amount} did not go through — guest may need a new link or card.`,
    dedupeKey: `${args.businessId}:payment-failed:${args.paymentId}`,
    eventName: EventType.PAYMENT_FAILED,
    entityType: "payment",
    entityId: args.paymentId,
    ttlHours: 72,
  });
  void syncCommerceIntelligenceLoop(args.businessId);
  void publishDomainEvent(
    "payment.failed",
    {
      businessId: args.businessId,
      paymentId: args.paymentId,
      amountMinor: args.amountMinor,
      currency: args.currency,
    },
    `${args.businessId}:payment-failed:${args.paymentId}`,
  );
}
