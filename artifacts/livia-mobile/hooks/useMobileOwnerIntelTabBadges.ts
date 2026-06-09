import { useQuery } from "@tanstack/react-query";
import { ownerIntelBadgesForMobileTabs } from "@workspace/policy";
import { customFetch } from "@workspace/api-client-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { usePersona } from "@/hooks/usePersona";
import { useMemo } from "react";

type IntelBundle = {
  remediationTasks?: Array<{ severity: string }>;
  commerce?: { topSignal?: { severity: string } | null; signals?: Array<{ severity: string }> };
  commerceCapabilityBlockers?: unknown[];
  livPrompts?: string[];
  ops?: { pendingCount?: number; handedOffCount?: number };
};

/** Owner-intelligence act counts for mobile tab bar badges. */
export function useMobileOwnerIntelTabBadges() {
  const { currentBusiness } = useBusiness();
  const { kind } = usePersona();
  const bid = currentBusiness?.id ?? "";
  const isOwner = kind === "owner" || kind === "org_admin";

  const { data } = useQuery({
    queryKey: ["owner-intelligence", bid],
    queryFn: () => customFetch<IntelBundle>(`/api/businesses/${bid}/owner-intelligence`),
    enabled: !!bid && isOwner,
    staleTime: 90_000,
  });

  return useMemo(() => ownerIntelBadgesForMobileTabs(data ?? null), [data]);
}
