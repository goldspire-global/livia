/** Wellness ritual homes — override generic persona paths when vertical=wellness */
export type WellnessPersonaKind =
  | "org_admin"
  | "owner"
  | "manager"
  | "staff"
  | "receptionist";

export type WellnessPersonaHome = {
  homePath: string;
  homeTitle: string;
  homeSubtitle: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export const WELLNESS_PERSONA_HOMES: Partial<Record<WellnessPersonaKind, WellnessPersonaHome>> = {
  receptionist: {
    homePath: "/wellness-reception",
    homeTitle: "Reception desk",
    homeSubtitle: "Scan vouchers, walk-ins, and today's run sheet — tablet-first.",
    primaryAction: { label: "TV mode", href: "/wellness-tv" },
    secondaryAction: { label: "Messages", href: "/inbox" },
  },
  staff: {
    homePath: "/my-day",
    homeTitle: "Session rail",
    homeSubtitle: "Your sessions today — complete and turnover when each room clears.",
    primaryAction: { label: "Room board", href: "/bookings" },
  },
  manager: {
    homePath: "/wellness-reception",
    homeTitle: "Floor ops",
    homeSubtitle: "Duty solver, handoffs, and room truth for today.",
    primaryAction: { label: "Reports", href: "/wellness-reports" },
    secondaryAction: { label: "Today", href: "/dashboard" },
  },
  owner: {
    homePath: "/dashboard",
    homeTitle: "Today",
    homeSubtitle: "Room swimlanes, package ledger, and tomorrow stress.",
    primaryAction: { label: "Reports", href: "/wellness-reports" },
    secondaryAction: { label: "Chain", href: "/wellness-chain" },
  },
  org_admin: {
    homePath: "/wellness-chain",
    homeTitle: "Chain glance",
    homeSubtitle: "Harbour, Havn, and brand-wide package liability.",
    primaryAction: { label: "Open shop", href: "/dashboard" },
  },
};

export function resolveWellnessPersonaHome(
  persona: WellnessPersonaKind,
  vertical: string | null | undefined,
): WellnessPersonaHome | null {
  if (vertical !== "wellness") return null;
  return WELLNESS_PERSONA_HOMES[persona] ?? null;
}

/** Gift buyer lands on public book — not a signed-in persona */
export const WELLNESS_GIFT_BUYER_ENTRY = "/b";

export function resolveWellnessAccountantHome(vertical: string | null | undefined): string | null {
  return vertical === "wellness" ? "/wellness-reports?digest=accountant_preview" : null;
}
