import type { QueryClient } from "@tanstack/react-query";
import {
  getGetCommerceSignalsQueryKey,
  getGetOwnerIntelligenceQueryKey,
} from "@workspace/api-client-react";

/** Refresh commerce intelligence surfaces after signals, proposals, or billing changes. */
export function invalidateCommerceIntelligence(qc: QueryClient, businessId: string) {
  void qc.invalidateQueries({ queryKey: getGetOwnerIntelligenceQueryKey(businessId) });
  void qc.invalidateQueries({ queryKey: getGetCommerceSignalsQueryKey(businessId) });
  void qc.invalidateQueries({ queryKey: ["owner-intelligence", businessId] });
  void qc.invalidateQueries({ queryKey: ["commerce-signals", businessId] });
}
