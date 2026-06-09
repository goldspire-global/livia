import { useGetOwnerIntelligence } from "@workspace/api-client-react";
import { ownerIntelBadgesForNav } from "@workspace/policy";
import { useBusiness } from "@/lib/business-context";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { useInAppNotifications } from "@/hooks/use-in-app-notifications";
import { useMemo } from "react";

/** Pending bookings + inbox + commerce/capability act — nav badges and bell. */
export function useNavActionCounts() {
  const { business } = useBusiness();
  const bid = business?.id ?? "";
  const { data: summary } = useGetDashboardSummary(bid, {
    query: { enabled: !!bid, refetchInterval: 60_000 } as never,
  });
  const { data: ownerIntel } = useGetOwnerIntelligence(bid, {
    query: { enabled: !!bid, staleTime: 90_000 } as never,
  });
  const { unreadCount } = useInAppNotifications();

  const pendingCount = summary?.pendingCount ?? 0;
  const handedOffCount =
    (summary as { handedOffCount?: number } | undefined)?.handedOffCount ?? 0;

  const intelBadges = useMemo(() => ownerIntelBadgesForNav(ownerIntel ?? null), [ownerIntel]);

  return { pendingCount, handedOffCount, unreadCount, intelBadges };
}
