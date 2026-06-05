import type { PresentationLayoutMorph } from "./presentation-surface";
import type { WellnessPersonaKind } from "./wellness-persona-homes";
import {
  resolveWellnessShellActiveId,
  wellnessShellNavGroups,
  type WellnessShellNavGroup,
  type WellnessShellNavItem,
} from "./wellness-operator-shell";
import { WELLNESS_GUEST_SURFACE_LINKS } from "./wellness-guest-surfaces";

/** Pin sets — display order always follows {@link wellnessShellNavGroups} (Floor → Guests → Insight → Studio). */
export const WELLNESS_DEFAULT_QUICK_ACCESS_IDS: ReadonlySet<string> = new Set([
  "today",
  "reception",
  "rooms",
  "inbox",
  "guests",
  "packages",
  "reports",
]);

export const WELLNESS_LEDGER_QUICK_ACCESS_IDS: ReadonlySet<string> = new Set([
  "ledger",
  "messages",
  "packages",
  "reports",
]);

export const WELLNESS_QUICK_ACCESS_BY_PERSONA: Partial<
  Record<WellnessPersonaKind, ReadonlySet<string>>
> = {
  /** Day owner — floor, then guest ops, then insight. */
  owner: new Set(["today", "reception", "rooms", "inbox", "guests", "packages", "reports"]),
  /** Desk-first — reception → rooms → guest comms → CRM → packs. */
  receptionist: new Set(["reception", "rooms", "inbox", "guests", "packages"]),
  /** Floor lead — same spine as owner minus CRM depth. */
  manager: new Set(["today", "reception", "rooms", "inbox", "reports"]),
  staff: new Set(["today", "rooms", "inbox"]),
  /** HQ — today + floor touchpoint, then rollup. */
  org_admin: new Set(["today", "reception", "inbox", "reports", "chain"]),
};

export type WellnessQuickAccessGroup = {
  id: string;
  label: string;
  items: WellnessShellNavItem[];
};

export function wellnessQuickAccessIdSet(
  morph: PresentationLayoutMorph,
  persona?: WellnessPersonaKind | null,
): ReadonlySet<string> {
  if (morph === "ledger") return WELLNESS_LEDGER_QUICK_ACCESS_IDS;
  if (persona && WELLNESS_QUICK_ACCESS_BY_PERSONA[persona]) {
    return WELLNESS_QUICK_ACCESS_BY_PERSONA[persona]!;
  }
  return WELLNESS_DEFAULT_QUICK_ACCESS_IDS;
}

/** @deprecated order is undefined — use {@link wellnessQuickAccessGrouped} */
export function wellnessQuickAccessIds(
  morph: PresentationLayoutMorph,
  persona?: WellnessPersonaKind | null,
): readonly string[] {
  return [...wellnessQuickAccessIdSet(morph, persona)];
}

/** Pinned destinations in canonical cluster order (Floor → Guests → Insight → Studio). */
export function wellnessQuickAccessGrouped(
  morph: PresentationLayoutMorph,
  teamNoun: string,
  serviceNoun: string,
  persona?: WellnessPersonaKind | null,
): WellnessQuickAccessGroup[] {
  const pinned = wellnessQuickAccessIdSet(morph, persona);
  return wellnessShellNavGroups(morph, teamNoun, serviceNoun)
    .map((group) => ({
      id: group.id,
      label: group.label,
      items: group.items.filter((item) => pinned.has(item.id)),
    }))
    .filter((group) => group.items.length > 0);
}

export function wellnessQuickAccessItems(
  morph: PresentationLayoutMorph,
  teamNoun: string,
  serviceNoun: string,
  persona?: WellnessPersonaKind | null,
): WellnessShellNavItem[] {
  return wellnessQuickAccessGrouped(morph, teamNoun, serviceNoun, persona).flatMap(
    (group) => group.items,
  );
}

/** Cluster siblings not already pinned — same order as policy cluster items. */
export function wellnessContextExtraItems(
  navContext: WellnessNavContext | null,
  pinnedIds: ReadonlySet<string>,
): WellnessShellNavItem[] {
  if (!navContext) return [];
  return navContext.siblings.filter((item) => !pinnedIds.has(item.id));
}

/** Short hint for the wellness Go-to compass (search + jump). */
export const WELLNESS_BROWSE_HINTS: Record<string, string> = {
  today: "Room swimlanes and day stress",
  reception: "Voucher scan, walk-ins, run sheet",
  rooms: "Room board and turnover",
  tv: "Next arrivals display",
  inbox: "Guest messages and threads",
  guests: "Guest profiles and history",
  packages: "Day packages and credits",
  retail: "Post-session oils and gift attach",
  reports: "Heatmaps, digest, EOD close",
  vault: "Guest memory and preferences",
  diary: "Audit trail for handoffs",
  chain: "Multi-location rollup",
  sessions: "Service catalogue",
  staff: "Practitioners and team",
  rota: "Shifts and coverage",
  corporate: "Employer benefit portal",
  settings: "Shop profile and account",
  liv: "Liv AI tuning",
  look: "Guest-facing appearance",
  comms: "SMS and email channels",
  integrations: "Fresha, Mindbody, brokers",
  studio: "Studio setup tab",
};

export type WellnessBrowseEntry = WellnessShellNavItem & {
  group: string;
  description: string;
};

export type WellnessNavContext = {
  cluster: WellnessShellNavGroup;
  activeId: string | null;
  /** Sibling pages in the same cluster — shown as contextual tabs. */
  siblings: WellnessShellNavItem[];
};

export function resolveWellnessNavContext(
  pathname: string,
  morph: PresentationLayoutMorph,
  teamNoun: string,
  serviceNoun: string,
  search = "",
): WellnessNavContext | null {
  const activeId = resolveWellnessShellActiveId(pathname, morph, search);
  const clusters = wellnessShellNavGroups(morph, teamNoun, serviceNoun);

  for (const cluster of clusters) {
    if (cluster.items.some((item) => item.id === activeId)) {
      return { cluster, activeId, siblings: cluster.items };
    }
  }

  return null;
}

/** True on Today hub — contextual tabs hidden; compass + page content carry navigation. */
export function wellnessNavIsHubHome(pathname: string, morph: PresentationLayoutMorph): boolean {
  if (pathname !== "/dashboard") return false;
  return morph === "atrium" || morph === "ledger";
}

export function wellnessBrowseCatalog(
  morph: PresentationLayoutMorph,
  teamNoun: string,
  serviceNoun: string,
): WellnessBrowseEntry[] {
  const entries: WellnessBrowseEntry[] = [];

  for (const group of wellnessShellNavGroups(morph, teamNoun, serviceNoun)) {
    for (const item of group.items) {
      entries.push({
        ...item,
        group: group.label,
        description: WELLNESS_BROWSE_HINTS[item.id] ?? group.label,
      });
    }
  }

  if (morph !== "ledger") {
    const studio = entries.find((e) => e.id === "settings");
    const setup: WellnessBrowseEntry[] = [
      { id: "liv", label: "Liv", href: "/settings?tab=liv", group: "Studio", description: WELLNESS_BROWSE_HINTS.liv! },
      { id: "look", label: "Guest look", href: "/settings?tab=appearance", group: "Studio", description: WELLNESS_BROWSE_HINTS.look! },
      { id: "comms", label: "Channels", href: "/settings?tab=comms", group: "Studio", description: WELLNESS_BROWSE_HINTS.comms! },
      { id: "integrations", label: "Brokers", href: "/settings?tab=integrations", group: "Studio", description: WELLNESS_BROWSE_HINTS.integrations! },
    ];
    void studio;
    entries.push(...setup);
  }

  return entries;
}

export function filterWellnessBrowseCatalog(
  catalog: WellnessBrowseEntry[],
  query: string,
): WellnessBrowseEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalog;
  return catalog.filter(
    (entry) =>
      entry.label.toLowerCase().includes(q) ||
      entry.group.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.id.includes(q),
  );
}

export type WellnessGuestBrowseEntry = {
  id: string;
  label: string;
  href: string;
  description: string;
  external?: boolean;
};

export function wellnessGuestBrowseEntries(slug: string): WellnessGuestBrowseEntry[] {
  return WELLNESS_GUEST_SURFACE_LINKS.map((link) => ({
    id: link.id,
    label: link.label,
    href: link.hrefTemplate.replace("{slug}", slug),
    description: link.description,
    external: link.external,
  }));
}
