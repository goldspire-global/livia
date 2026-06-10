/**
 * Operator shape → what surfaces appear (solo vs team).
 * Solo-tier owners with only themselves on the roster should not see Team / Rota noise.
 * @see docs/configurations.md (C2 solo shop)
 */

export type OperatorNavSignals = {
  tier?: string | null;
  /** Active staff rows — owner-only solo shops typically have 1. */
  activeStaffCount: number;
};

const MULTI_SEAT_TIERS = new Set([
  "studio",
  "chain",
  "franchise",
  "mid-chain",
  "chair-host",
  "white-label",
]);

/** Workforce / rota surfaces — second practitioner or explicit multi-seat tier. */
export function operatorNeedsWorkforceNav(signals: OperatorNavSignals): boolean {
  const tier = (signals.tier ?? "solo").toLowerCase();
  if (MULTI_SEAT_TIERS.has(tier)) return true;
  return Math.max(0, signals.activeStaffCount) >= 2;
}

function normalizePath(href: string): string {
  return (href.split("?")[0] ?? href).replace(/\/+$/, "") || "/";
}

export function isWorkforceNavHref(href: string): boolean {
  const path = normalizePath(href);
  if (path === "/staff" || path.startsWith("/staff/")) return true;
  if (path === "/rota" || path.startsWith("/rota/")) return true;
  if (path === "/classes" || path.startsWith("/classes/")) return true;
  return false;
}

export function isNavHrefAllowedForOperator(
  href: string,
  signals: OperatorNavSignals,
): boolean {
  if (!isWorkforceNavHref(href)) return true;
  return operatorNeedsWorkforceNav(signals);
}

export function isMobileMenuRouteAllowedForOperator(
  route: string,
  signals: OperatorNavSignals,
): boolean {
  const r = route.replace(/\/+$/, "") || "/";
  if (r === "/rota" || r.startsWith("/rota")) {
    return operatorNeedsWorkforceNav(signals);
  }
  if (r === "/staff" || r.startsWith("/staff")) {
    return operatorNeedsWorkforceNav(signals);
  }
  return true;
}

export function filterNavItemsByOperatorShape<T extends { href: string }>(
  items: T[],
  signals: OperatorNavSignals | null | undefined,
): T[] {
  if (!signals) return items;
  return items.filter((item) => isNavHrefAllowedForOperator(item.href, signals));
}

export function filterMobileMenuItemsByOperatorShape<T extends { route: string }>(
  items: T[],
  signals: OperatorNavSignals | null | undefined,
): T[] {
  if (!signals) return items;
  return items.filter((item) => isMobileMenuRouteAllowedForOperator(item.route, signals));
}

/** Activation checklist — hide optional team invite for solo until they grow. */
export function filterActivationStepsForOperator<
  T extends { id: string; label: string; done: boolean; href: string },
>(steps: T[], signals: OperatorNavSignals | null | undefined): T[] {
  if (!signals || operatorNeedsWorkforceNav(signals)) return steps;
  return steps.filter((s) => s.id !== "team");
}

/** Onboarding act ids that only apply when workforce nav is relevant. */
export const WORKFORCE_ONBOARDING_ACTS = new Set(["a4_team", "a10_invite_team"]);

export function isOnboardingActRelevantForOperator(
  actId: string,
  signals: OperatorNavSignals | null | undefined,
): boolean {
  if (!WORKFORCE_ONBOARDING_ACTS.has(actId)) return true;
  if (!signals) return false;
  return operatorNeedsWorkforceNav(signals);
}
