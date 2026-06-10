import type { QueryClient } from "@tanstack/react-query";
import {
  getGetActivityFeedQueryKey,
  getGetDashboardSummaryQueryKey,
  getListBookingsQueryKey,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";

/** Mobile parity with dashboard `lib/operational-cache.ts`. */
export function invalidateOperationalState(qc: QueryClient, businessId: string) {
  void qc.invalidateQueries({ queryKey: ["liv-proposals", businessId] });
  void qc.invalidateQueries({ queryKey: getListBookingsQueryKey(businessId) });
  void qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey(businessId) });
  void qc.invalidateQueries({ queryKey: getGetActivityFeedQueryKey(businessId) });
  void qc.invalidateQueries({ queryKey: getListConversationsQueryKey(businessId) });
  void qc.invalidateQueries({ queryKey: [`/businesses/${businessId}/conversations`] });
  void qc.invalidateQueries({ queryKey: ["inbox-linked-booking", businessId] });
  void qc.invalidateQueries({ queryKey: ["my-day", businessId] });
  void qc.invalidateQueries({ queryKey: ["shift-templates", businessId] });
  void qc.invalidateQueries({ queryKey: ["staff-shifts", businessId] });
  invalidateCommerceIntelligence(qc, businessId);
}

export function invalidateCommerceIntelligence(qc: QueryClient, businessId: string) {
  void qc.invalidateQueries({ queryKey: ["owner-intelligence", businessId] });
  void qc.invalidateQueries({ queryKey: ["commerce-signals", businessId] });
}

export const OPERATIONAL_REFETCH_MS = 45_000;
