import { resolveCommerceSignals, topCommerceSignal, type CommerceSignal } from "./commerce-signals";

export type ChainShopCommerceSlice = {
  businessId: string;
  shopName: string;
  capturedMinor30d: number;
  capturedLabel: string;
  captureRatePercent: number | null;
  paymentCount30d: number;
  demandBookings: number;
  topSignal: CommerceSignal | null;
};

export type ChainCommerceAlert = {
  businessId: string;
  shopName: string;
  severity: "act" | "watch";
  code: "uncaptured_demand" | "low_capture" | "elevated_refunds";
  message: string;
  href: string;
};

export function buildChainCommerceAlerts(
  shops: ChainShopCommerceSlice[],
): ChainCommerceAlert[] {
  const alerts: ChainCommerceAlert[] = [];
  for (const shop of shops) {
    const top = shop.topSignal;
    if (!top || top.severity === "info") continue;
    if (top.severity !== "act" && top.severity !== "watch") continue;
    alerts.push({
      businessId: shop.businessId,
      shopName: shop.shopName,
      severity: top.severity,
      code: top.id as ChainCommerceAlert["code"],
      message: `${shop.shopName}: ${top.title}`,
      href: top.href,
    });
  }
  const rank = (s: ChainCommerceAlert["severity"]) => (s === "act" ? 0 : 1);
  return alerts.sort((a, b) => rank(a.severity) - rank(b.severity));
}

export function summarizeChainCommerce(slices: ChainShopCommerceSlice[]): {
  totalCapturedMinor30d: number;
  shopsWithActSignal: number;
  shopsWithWatchSignal: number;
} {
  let totalCapturedMinor30d = 0;
  let shopsWithActSignal = 0;
  let shopsWithWatchSignal = 0;
  for (const s of slices) {
    totalCapturedMinor30d += s.capturedMinor30d;
    const top = s.topSignal;
    if (top?.severity === "act") shopsWithActSignal += 1;
    else if (top?.severity === "watch") shopsWithWatchSignal += 1;
  }
  return { totalCapturedMinor30d, shopsWithActSignal, shopsWithWatchSignal };
}

/** Resolve signals for one chain shop from snapshot facts. */
export function chainShopCommerceSignals(args: {
  capturedMinor30d: number;
  captureRatePercent: number | null;
  paymentCount30d: number;
  refundMinor30d?: number;
  demandBookings: number;
  weekBookings: number;
  capturedLabel: string;
}): CommerceSignal[] {
  return resolveCommerceSignals(args);
}

export function chainShopTopSignal(signals: CommerceSignal[]): CommerceSignal | null {
  return topCommerceSignal(signals);
}
