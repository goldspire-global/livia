/**
 * Persona rituals — shared copy with dashboard `lib/persona-rituals.ts` (nav/icons omitted).
 */
import { businessVocabulary } from "@workspace/policy";
import type { PersonaKind } from "@/hooks/usePersona";

export type PersonaRitual = {
  kind: PersonaKind;
  homePath: string;
  homeTitle: string;
  homeSubtitle: string;
  greetingName: string;
  livFallback: string;
  alertLabel?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export const PERSONA_RITUALS: Record<PersonaKind, PersonaRitual> = {
  org_admin: {
    kind: "org_admin",
    homePath: "/shops",
    homeTitle: "Your shops at a glance",
    homeSubtitle:
      "Week-ahead signal across every location — drill into one shop when you need to.",
    greetingName: "there",
    livFallback:
      "Three numbers per shop, one screen. Liv flags what needs you before Sunday becomes a spreadsheet.",
    primaryAction: { label: "Open shop today", href: "/" },
    secondaryAction: { label: "Review inbox", href: "/inbox" },
    alertLabel: "Cross-shop",
  },
  owner: {
    kind: "owner",
    homePath: "/",
    homeTitle: "Today",
    homeSubtitle: "Today's bookings, inbox, and anything that needs a yes or no.",
    greetingName: "there",
    livFallback:
      "Pending confirmations, overnight messages, and gaps on the calendar — Liv flags what needs you.",
    primaryAction: { label: "Open inbox", href: "/inbox" },
    secondaryAction: { label: "Book appointment", href: "/booking/new" },
  },
  manager: {
    kind: "manager",
    homePath: "/inbox",
    homeTitle: "Queue",
    homeSubtitle: "What Liv handled, what needs your sign-off, and what can wait.",
    greetingName: "there",
    livFallback:
      "Approvals first. Peek a stylist's day in one tap — every preview is audited.",
    primaryAction: { label: "Today's floor", href: "/bookings" },
    secondaryAction: { label: "My day", href: "/my-day" },
    alertLabel: "Needs you",
  },
  staff: {
    kind: "staff",
    homePath: "/my-day",
    homeTitle: "My chair",
    homeSubtitle: "Your appointments, your regulars, nothing else cluttering the view.",
    greetingName: "there",
    livFallback:
      "Next client, time until they're in the chair, and the customers who always ask for you.",
    primaryAction: { label: "Today's list", href: "/bookings" },
  },
  receptionist: {
    kind: "receptionist",
    homePath: "/bookings",
    homeTitle: "Floor",
    homeSubtitle: "Who's in, who's due, and what the phone's asking for.",
    greetingName: "there",
    livFallback: "Calendar's the source of truth — Liv keeps threads warm while you seat guests.",
    primaryAction: { label: "Messages", href: "/inbox" },
    secondaryAction: { label: "Clients", href: "/customers" },
  },
};

export function timeGreeting(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export function greetingLine(
  firstName: string | null | undefined,
  persona: PersonaKind,
  opts?: { locationNoun?: string },
): string {
  const name = firstName?.trim() || PERSONA_RITUALS[persona].greetingName;
  const t = timeGreeting();
  const place = opts?.locationNoun?.toLowerCase() ?? "business";
  const tails: Record<PersonaKind, string> = {
    org_admin: "— here's how your locations are doing.",
    owner: `— here's what needs you at your ${place}.`,
    manager: "— here's your queue.",
    staff: "— here's your chair today.",
    receptionist: "— here's the floor.",
  };
  return `Good ${t}, ${name} ${tails[persona]}`;
}

export function ownerHomeSubtitle(vertical?: string | null, category?: string | null): string {
  return businessVocabulary(vertical, category).ownerTodayLine;
}

/** Map web ritual hrefs to Expo routes */
export function ritualHrefToMobile(href: string): string {
  if (href === "/dashboard" || href === "/chain") return "/";
  if (href.startsWith("/bookings")) return "/bookings";
  return href.split("?")[0] ?? href;
}
