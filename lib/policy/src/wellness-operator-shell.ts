import type { PresentationLayoutMorph } from "./presentation-surface";

/**
 * W4/W5 operator + guest book skin when the stored preset is Platform Default.
 * Constellation is signup/marketing chrome — wellness day ops use Harbour Light unless
 * the owner explicitly picked session-rail or evening-ledger.
 */
export const WELLNESS_OPERATOR_DEFAULT_CSS_PRESET = "harbour-light";

/** Minutes blocked after a session ends before the room accepts the next booking (turnover). */
export const WELLNESS_ROOM_TURNOVER_MINUTES = 15;

export function resolveWellnessOperatorCssPreset(
  cssPreset?: string | null,
): string {
  if (!cssPreset || cssPreset === "platform-default") {
    return WELLNESS_OPERATOR_DEFAULT_CSS_PRESET;
  }
  return cssPreset;
}

/** Single nav destination in the wellness W4 shell (harbour / ledger / rail). */
export type WellnessShellNavItem = {
  id: string;
  label: string;
  href: string;
};

export type WellnessShellNavGroup = {
  id: string;
  label: string;
  items: WellnessShellNavItem[];
};

/**
 * Harbour-light atrium — four bands so every shipped surface has a home.
 * Floor · Guests · Insight · Studio
 */
export function wellnessAtriumNavGroups(
  teamNoun: string,
  serviceNoun: string,
): WellnessShellNavGroup[] {
  const sessionsLabel = serviceNoun === "Session" ? "Sessions" : serviceNoun;
  return [
    {
      id: "floor",
      label: "Floor",
      items: [
        { id: "today", label: "Today", href: "/dashboard" },
        { id: "reception", label: "Reception", href: "/wellness-reception" },
        { id: "rooms", label: "Rooms", href: "/bookings" },
        { id: "tv", label: "TV", href: "/wellness-tv" },
      ],
    },
    {
      id: "guests",
      label: "Guests",
      items: [
        { id: "inbox", label: "Inbox", href: "/inbox" },
        { id: "guests", label: "Guests", href: "/customers" },
        { id: "packages", label: "Packages", href: "/day-packages" },
        { id: "retail", label: "Retail", href: "/wellness-retail" },
      ],
    },
    {
      id: "insight",
      label: "Insight",
      items: [
        { id: "reports", label: "Reports", href: "/wellness-reports" },
        { id: "vault", label: "Vault", href: "/wellness-guest-vault" },
        { id: "diary", label: "Diary", href: "/wellness-audit-diary" },
        { id: "chain", label: "Chain", href: "/wellness-chain" },
      ],
    },
    {
      id: "studio",
      label: "Studio",
      items: [
        { id: "sessions", label: sessionsLabel, href: "/services" },
        { id: "staff", label: teamNoun, href: "/staff" },
        { id: "rota", label: "Rota", href: "/rota" },
        { id: "corporate", label: "Corporate", href: "/corporate-wellness" },
        { id: "settings", label: "Settings", href: "/settings" },
      ],
    },
  ];
}

/** @deprecated use wellnessAtriumNavGroups — flat split for legacy callers */
export const WELLNESS_ATRIUM_FOREGROUND_NAV: readonly WellnessShellNavItem[] = [
  { id: "today", label: "Today", href: "/dashboard" },
  { id: "inbox", label: "Inbox", href: "/inbox" },
  { id: "rooms", label: "Rooms", href: "/bookings" },
  { id: "guests", label: "Guests", href: "/customers" },
  { id: "packages", label: "Packages", href: "/day-packages" },
  { id: "reports", label: "Reports", href: "/wellness-reports" },
  { id: "reception", label: "Reception", href: "/wellness-reception" },
  { id: "chain", label: "Chain", href: "/wellness-chain" },
] as const;

export function wellnessAtriumStudioNav(
  teamNoun: string,
  serviceNoun: string,
): WellnessShellNavItem[] {
  const sessionsLabel = serviceNoun === "Session" ? "Sessions" : serviceNoun;
  return [
    { id: "sessions", label: sessionsLabel, href: "/services" },
    { id: "staff", label: teamNoun, href: "/staff" },
    { id: "rota", label: "Rota", href: "/rota" },
    { id: "settings", label: "Settings", href: "/settings" },
  ];
}

/** Evening ledger morph — voucher + messages first. */
export const WELLNESS_LEDGER_FOREGROUND_NAV: readonly WellnessShellNavItem[] = [
  { id: "ledger", label: "Ledger", href: "/dashboard" },
  { id: "messages", label: "Messages", href: "/inbox" },
  { id: "packages", label: "Packages", href: "/day-packages" },
  { id: "reports", label: "Reports", href: "/wellness-reports" },
  { id: "retail", label: "Retail", href: "/wellness-retail" },
] as const;

export function wellnessLedgerNavGroups(teamNoun: string): WellnessShellNavGroup[] {
  return [
    {
      id: "ledger",
      label: "Ledger",
      items: [...WELLNESS_LEDGER_FOREGROUND_NAV],
    },
    {
      id: "studio",
      label: "Studio",
      items: [
        ...wellnessLedgerStudioNav(teamNoun),
        { id: "vault", label: "Vault", href: "/wellness-guest-vault" },
        { id: "diary", label: "Diary", href: "/wellness-audit-diary" },
      ],
    },
  ];
}

export function wellnessLedgerStudioNav(teamNoun: string): WellnessShellNavItem[] {
  return [
    { id: "staff", label: teamNoun, href: "/staff" },
    { id: "settings", label: "Settings", href: "/settings" },
  ];
}

/**
 * Utility strip under primary nav (where account/help live).
 * Deep config — studio, rooms/resources, Liv, guest look, channels.
 */
export const WELLNESS_SETTINGS_STRIP_LINKS: readonly WellnessShellNavItem[] = [
  { id: "settings", label: "Settings", href: "/settings" },
  { id: "studio", label: "Studio", href: "/settings?tab=shop" },
  { id: "liv", label: "Liv", href: "/settings?tab=liv" },
  { id: "look", label: "Guest look", href: "/settings?tab=appearance" },
  { id: "comms", label: "Channels", href: "/settings?tab=comms" },
  { id: "integrations", label: "Brokers", href: "/settings?tab=integrations" },
] as const;

export function wellnessShellNavGroups(
  morph: PresentationLayoutMorph,
  teamNoun: string,
  serviceNoun: string,
): WellnessShellNavGroup[] {
  if (morph === "ledger") {
    return wellnessLedgerNavGroups(teamNoun);
  }
  return wellnessAtriumNavGroups(teamNoun, serviceNoun);
}

/** High-frequency destinations — always visible in the single-tier bar. */
export const WELLNESS_ATRIUM_INLINE_NAV_IDS: ReadonlySet<string> = new Set([
  "today",
  "reception",
  "rooms",
  "inbox",
  "guests",
  "packages",
  "reports",
  "settings",
]);

export const WELLNESS_LEDGER_INLINE_NAV_IDS: ReadonlySet<string> = new Set([
  "ledger",
  "messages",
  "packages",
  "reports",
  "settings",
]);

export type WellnessShellNavBarLayout = {
  inlineGroups: WellnessShellNavGroup[];
  moreGroups: WellnessShellNavGroup[];
};

function splitNavGroup(
  group: WellnessShellNavGroup,
  inlineIds: ReadonlySet<string>,
): { inline: WellnessShellNavGroup | null; more: WellnessShellNavGroup | null } {
  const inlineItems = group.items.filter((item) => inlineIds.has(item.id));
  const moreItems = group.items.filter((item) => !inlineIds.has(item.id));
  return {
    inline: inlineItems.length ? { ...group, items: inlineItems } : null,
    more: moreItems.length ? { ...group, items: moreItems } : null,
  };
}

/** Single-tier bar: grouped inline links + overflow buckets for the More menu. */
export function wellnessShellNavBarLayout(
  morph: PresentationLayoutMorph,
  teamNoun: string,
  serviceNoun: string,
): WellnessShellNavBarLayout {
  const inlineIds =
    morph === "ledger" ? WELLNESS_LEDGER_INLINE_NAV_IDS : WELLNESS_ATRIUM_INLINE_NAV_IDS;
  const inlineGroups: WellnessShellNavGroup[] = [];
  const moreGroups: WellnessShellNavGroup[] = [];

  for (const group of wellnessShellNavGroups(morph, teamNoun, serviceNoun)) {
    const { inline, more } = splitNavGroup(group, inlineIds);
    if (inline) inlineGroups.push(inline);
    if (more) moreGroups.push(more);
  }

  if (morph !== "ledger") {
    const studioMore = moreGroups.find((group) => group.id === "studio");
    const setupItems = WELLNESS_SETTINGS_STRIP_LINKS.filter((link) => link.id !== "settings");
    if (studioMore) {
      studioMore.items = [...studioMore.items, ...setupItems];
    } else if (setupItems.length) {
      moreGroups.push({ id: "setup", label: "Setup", items: [...setupItems] });
    }
  }

  return { inlineGroups, moreGroups };
}

export function wellnessShellActiveMoreItem(
  activeId: string | null,
  layout: WellnessShellNavBarLayout,
): WellnessShellNavItem | null {
  if (!activeId) return null;
  for (const group of layout.moreGroups) {
    const match = group.items.find((item) => item.id === activeId);
    if (match) return match;
  }
  return null;
}

/** Two-tier nav column — header label centered over inline links + optional overflow. */
export type WellnessShellNavColumn = {
  id: string;
  label: string;
  inlineItems: WellnessShellNavItem[];
  moreItems: WellnessShellNavItem[];
};

/** Settings deep links — studio column More only when these do not fit inline. */
export const WELLNESS_STUDIO_MORE_NAV_IDS: ReadonlySet<string> = new Set([
  "liv",
  "look",
  "comms",
  "integrations",
  "studio",
]);

export function wellnessShellNavColumns(
  morph: PresentationLayoutMorph,
  teamNoun: string,
  serviceNoun: string,
): WellnessShellNavColumn[] {
  const columns: WellnessShellNavColumn[] = [];

  for (const group of wellnessShellNavGroups(morph, teamNoun, serviceNoun)) {
    const inlineItems = [...group.items];
    let moreItems: WellnessShellNavItem[] = [];

    if (group.id === "studio" && morph !== "ledger") {
      moreItems = WELLNESS_SETTINGS_STRIP_LINKS.filter(
        (link) => link.id !== "settings" && WELLNESS_STUDIO_MORE_NAV_IDS.has(link.id),
      );
    }

    columns.push({
      id: group.id,
      label: group.label,
      inlineItems,
      moreItems,
    });
  }

  return columns;
}

export function wellnessShellActiveMoreItemInColumns(
  activeId: string | null,
  columns: WellnessShellNavColumn[],
): WellnessShellNavItem | null {
  if (!activeId) return null;
  for (const column of columns) {
    const match = column.moreItems.find((item) => item.id === activeId);
    if (match) return match;
  }
  return null;
}

/** Flat list for single-tier operator nav (groups keep divider order). */
export function wellnessShellFlatNavItems(
  morph: PresentationLayoutMorph,
  teamNoun: string,
  serviceNoun: string,
): WellnessShellNavItem[] {
  return wellnessShellNavGroups(morph, teamNoun, serviceNoun).flatMap((group) => group.items);
}

/** @deprecated use wellnessShellNavGroups */
export function wellnessShellNavItems(
  morph: PresentationLayoutMorph,
  teamNoun: string,
  serviceNoun: string,
): { foreground: WellnessShellNavItem[]; studio: WellnessShellNavItem[] } {
  const groups = wellnessShellNavGroups(morph, teamNoun, serviceNoun);
  if (morph === "ledger") {
    return {
      foreground: groups[0]?.items ?? [],
      studio: groups[1]?.items ?? [],
    };
  }
  const floor = groups.find((g) => g.id === "floor")?.items ?? [];
  const guests = groups.find((g) => g.id === "guests")?.items ?? [];
  const insight = groups.find((g) => g.id === "insight")?.items ?? [];
  const studio = groups.find((g) => g.id === "studio")?.items ?? [];
  return {
    foreground: [...floor, ...guests, ...insight],
    studio,
  };
}

/** Which nav band (Floor / Guests / …) owns the current route. */
export function resolveWellnessShellActiveGroupId(
  pathname: string,
  morph: PresentationLayoutMorph,
  teamNoun: string,
  serviceNoun: string,
  search = "",
): string {
  const activeId = resolveWellnessShellActiveId(pathname, morph, search);
  const groups = wellnessShellNavGroups(morph, teamNoun, serviceNoun);
  for (const group of groups) {
    if (group.items.some((item) => item.id === activeId)) {
      return group.id;
    }
  }
  return groups[0]?.id ?? "floor";
}

export function resolveWellnessShellActiveId(
  pathname: string,
  morph: PresentationLayoutMorph,
  search = "",
): string | null {
  if (pathname.startsWith("/settings")) {
    const stripId = resolveWellnessSettingsStripActiveId(pathname, search);
    if (stripId) return stripId;
    return "settings";
  }
  if (pathname.startsWith("/staff")) return "staff";
  if (pathname.startsWith("/services")) return "sessions";
  if (pathname.startsWith("/rota")) return "rota";
  if (pathname.startsWith("/wellness-tv")) return "tv";
  if (pathname.startsWith("/wellness-retail")) return "retail";
  if (pathname.startsWith("/wellness-guest-vault")) return "vault";
  if (pathname.startsWith("/wellness-audit-diary")) return "diary";
  if (pathname.startsWith("/corporate-wellness") || pathname.startsWith("/wellness-corporate")) {
    return "corporate";
  }
  if (pathname.startsWith("/inbox")) return morph === "ledger" ? "messages" : "inbox";
  if (pathname.startsWith("/bookings")) return "rooms";
  if (pathname.startsWith("/day-packages")) return "packages";
  if (pathname.startsWith("/wellness-reports")) return "reports";
  if (pathname.startsWith("/wellness-reception")) return "reception";
  if (pathname.startsWith("/wellness-chain")) return "chain";
  if (pathname.startsWith("/customers")) return "guests";
  if (morph === "ledger") return "ledger";
  return "today";
}

export function resolveWellnessSettingsStripActiveId(
  pathname: string,
  search: string,
): string | null {
  if (!pathname.startsWith("/settings")) return null;
  const tab = new URLSearchParams(search).get("tab");
  if (tab === "shop") return "studio";
  if (tab === "liv") return "liv";
  if (tab === "appearance") return "look";
  if (tab === "comms") return "comms";
  if (tab === "integrations") return "integrations";
  return "settings";
}
