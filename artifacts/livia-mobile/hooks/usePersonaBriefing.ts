import {
  customFetch,
  useGetDashboardSummary,
  useListConversations,
} from "@workspace/api-client-react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { businessVocabulary } from "@workspace/policy";
import { useBusiness } from "@/contexts/BusinessContext";
import { useMembership } from "@/hooks/useMembership";
import { usePersona, type PersonaKind } from "@/hooks/usePersona";
import { resolveBriefingFirstName, stripBusinessPrefix } from "@/lib/briefing-display";
import {
  greetingLine,
  ownerHomeSubtitle,
  PERSONA_RITUALS,
} from "@/lib/persona-rituals";

type ChainRollup = {
  orgAdminBriefingLine: string;
};

type LivPresencePayload = {
  line: string;
  source?: string;
  pulse?: "info" | "watch" | "act";
  briefing?: { summary?: string; source?: string };
};

type MyDayPeek = {
  todayCount: number;
  next: { startAt: string; customer?: { displayName: string | null } | null } | null;
};

function buildLivLineFallback(
  persona: PersonaKind,
  data: {
    chain?: ChainRollup | null;
    summary?: {
      todayBookings?: number;
      pendingBookings?: number;
      pendingCount?: number;
      handedOffCount?: number;
    } | null;
    openConversations?: number;
    myDay?: MyDayPeek | null;
    businessName?: string;
  },
): string {
  const fallback = PERSONA_RITUALS[persona].livFallback;
  const shop =
    persona === "org_admin" && data.businessName ? `${data.businessName}: ` : "";

  if (persona === "org_admin" && data.chain?.orgAdminBriefingLine) {
    return data.chain.orgAdminBriefingLine;
  }

  if ((persona === "owner" || persona === "manager") && data.summary) {
    const today = data.summary.todayBookings ?? 0;
    const pending = data.summary.pendingCount ?? data.summary.pendingBookings ?? 0;
    const handoffs = data.summary.handedOffCount ?? 0;
    const open = data.openConversations ?? 0;
    if (handoffs > 0 && pending > 0) {
      return `${shop}${today} today · ${pending} to confirm · ${handoffs} inbox handoff${handoffs === 1 ? "" : "s"}.`;
    }
    if (handoffs > 0) {
      return `${shop}${handoffs} inbox handoff${handoffs === 1 ? "" : "s"} need${handoffs === 1 ? "s" : ""} you — ${today} on the books today.`;
    }
    if (persona === "manager" && open > 0) {
      return `${shop}${open} conversation${open === 1 ? "" : "s"} need${open === 1 ? "s" : ""} you — ${today} on the books today.`;
    }
    if (pending > 0) {
      return `${shop}${today} today · ${pending} pending confirmation${pending === 1 ? "" : "s"}.`;
    }
    return today > 0
      ? `${shop}${today} appointment${today === 1 ? "" : "s"} today — you're on track.`
      : fallback;
  }

  if (persona === "staff" && data.myDay) {
    if (data.myDay.next) {
      const name = data.myDay.next.customer?.displayName ?? "your next client";
      const mins = Math.max(
        0,
        Math.round((new Date(data.myDay.next.startAt).getTime() - Date.now()) / 60000),
      );
      return mins <= 15
        ? `${name} is due in ${mins} minutes.`
        : `${data.myDay.todayCount} today — next up ${name} in ${mins}m.`;
    }
    if (data.myDay.todayCount === 0) {
      return "Chair's open. Walk-ins can be added from the floor calendar.";
    }
  }

  if (persona === "receptionist") {
    const today = data.summary?.todayBookings ?? 0;
    const open = data.openConversations ?? 0;
    if (open > 0 && today > 0) {
      return `${shop}${today} on the floor · phone's active (${open} thread${open === 1 ? "" : "s"}).`;
    }
    if (today > 0) return `${shop}${today} bookings today — calendar's the source of truth.`;
  }

  return fallback;
}

export function usePersonaBriefing() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { kind: persona, isLoading: personaLoading } = usePersona();
  const { currentBusiness, businesses } = useBusiness();
  const { staffId } = useMembership();
  const bid = currentBusiness?.id ?? "";
  const firstName = resolveBriefingFirstName(
    user?.firstName ?? user?.fullName?.split(" ")[0] ?? null,
  );

  const { data: chain } = useQuery({
    queryKey: ["chain-rollup-briefing"],
    queryFn: () => customFetch<ChainRollup>("/api/me/chain-rollup"),
    enabled: isSignedIn && persona === "org_admin" && businesses.length >= 2,
    staleTime: 60_000,
  });

  const { data: summary } = useGetDashboardSummary(bid, {
    query: {
      enabled: !!bid && ["owner", "manager", "receptionist"].includes(persona),
    } as never,
  });

  const { data: convos } = useListConversations(
    bid,
    { status: "OPEN" },
    {
      query: {
        enabled: !!bid && ["owner", "manager", "receptionist"].includes(persona),
      } as never,
    },
  );

  const { data: myDay } = useQuery({
    queryKey: ["my-day-briefing", bid, staffId],
    queryFn: () =>
      customFetch<MyDayPeek>(
        `/api/businesses/${bid}/my-day${staffId ? `?staffId=${staffId}` : ""}`,
      ),
    enabled: !!bid && persona === "staff",
    staleTime: 30_000,
  });

  const presenceContext =
    persona === "org_admin"
      ? null
      : persona === "staff"
        ? "staff_today"
        : persona === "receptionist"
          ? "reception_today"
          : persona === "manager"
            ? "manager_today"
            : "owner_today";

  const { data: orgAdminPresence, isLoading: orgAdminPresenceLoading } = useQuery({
    queryKey: ["liv-presence-org-admin"],
    queryFn: () => customFetch<LivPresencePayload>("/api/me/liv-presence"),
    enabled: isSignedIn && persona === "org_admin",
    staleTime: 90_000,
  });

  const { data: tenantPresence, isLoading: tenantPresenceLoading } = useQuery({
    queryKey: ["liv-presence-briefing", bid, presenceContext, staffId],
    queryFn: () =>
      customFetch<LivPresencePayload>(
        `/api/businesses/${bid}/liv-presence?context=${presenceContext}${
          persona === "staff" && staffId ? `&staffId=${staffId}` : ""
        }`,
      ),
    enabled: !!bid && !!presenceContext,
    staleTime: 90_000,
  });

  const openCount = Array.isArray(convos) ? convos.length : 0;

  const rawLivLine =
    (persona === "org_admin" ? orgAdminPresence?.line : tenantPresence?.line) ??
    buildLivLineFallback(persona, {
      chain: chain ?? null,
      summary: summary as {
        todayBookings?: number;
        pendingBookings?: number;
        pendingCount?: number;
        handedOffCount?: number;
      } | undefined,
      openConversations: openCount,
      myDay: myDay ?? null,
      businessName: currentBusiness?.name,
    });

  const livLine =
    persona === "owner" || persona === "manager"
      ? stripBusinessPrefix(rawLivLine, currentBusiness?.name)
      : rawLivLine;

  const ritual = PERSONA_RITUALS[persona];
  const biz = currentBusiness as { vertical?: string; category?: string } | null;
  const vocab = businessVocabulary(biz?.vertical, biz?.category);

  const briefingSummary =
    persona === "org_admin"
      ? orgAdminPresence?.briefing?.summary
      : tenantPresence?.briefing?.summary;

  const homeSubtitle = (() => {
    const s = briefingSummary?.trim();
    if (s && s !== livLine.trim()) return s;
    if (persona === "owner") return ownerHomeSubtitle(biz?.vertical, biz?.category);
    return ritual.homeSubtitle;
  })();

  return {
    persona,
    ritual,
    firstName,
    greeting: greetingLine(firstName, persona, { locationNoun: vocab.locationNoun }),
    homeSubtitle,
    livLine,
    livPulse:
      persona === "org_admin" ? orgAdminPresence?.pulse : tenantPresence?.pulse,
    verticalLabel: vocab.label,
    businessName: currentBusiness?.name,
    isLoading:
      personaLoading ||
      (persona === "org_admin" ? orgAdminPresenceLoading : tenantPresenceLoading),
  };
}
