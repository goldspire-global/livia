/**
 * W5 guest public experience — `/b/{slug}` storefront, book flow, visit token.
 * Policy hub for copy + layout hints; surfaces stay thin.
 */
import type { BusinessVertical } from "./types";
import { businessVocabulary, resolveVerticalKey } from "./vocabulary";

export type GuestPublicCatalogLayout = "list" | "grid-2x2";

export type GuestPublicExperience = {
  heroTitle: string;
  heroTaglineByPreset?: Record<string, string>;
  catalogLayout: GuestPublicCatalogLayout;
  catalogTitle: string;
  careNotes: string[];
  guardSectionTitle: string;
  staffSelectLabel: string;
  visitPrep: string[];
  visitGreeting: (firstName: string | null) => string;
  confirmPendingTitle: string;
  confirmBookedTitle: string;
  giftComingSoonNote: string | null;
};

const WELLNESS_HERO_TAGLINES: Record<string, string> = {
  "harbour-light": "MIND · CALM · REST",
  "session-rail": "FOCUS · SESSION · FLOW",
  "evening-ledger": "RITUAL · REST · RETREAT",
  "platform-default": "MIND · CALM · REST",
};

function defaultGuestPublic(vertical: BusinessVertical): GuestPublicExperience {
  const v = businessVocabulary(vertical, null);
  const service = v.serviceNoun.toLowerCase();
  return {
    heroTitle: `Book a ${service}`,
    catalogLayout: "list",
    catalogTitle: v.publicBookCatalogTitle,
    careNotes: [
      "You'll get a confirmation by email or SMS with everything you need for your visit.",
    ],
    guardSectionTitle: "A few quick details",
    staffSelectLabel: v.teamNoun,
    visitPrep: ["Arrive a few minutes early.", "Reply in your booking thread if plans change."],
    visitGreeting: (first) =>
      first?.trim() ? `Hi ${first.trim()} — here's your visit summary.` : "Here's your visit summary.",
    confirmPendingTitle: "Booking received",
    confirmBookedTitle: "You're booked",
    giftComingSoonNote: null,
  };
}

const WELLNESS_GUEST: GuestPublicExperience = {
  heroTitle: "Book a session",
  heroTaglineByPreset: WELLNESS_HERO_TAGLINES,
  catalogLayout: "grid-2x2",
  catalogTitle: "Sessions",
  careNotes: [
    "Share health or pressure notes in the form — not a medical diagnosis.",
    "Couples and gift bookings: pick the option that fits; the studio confirms room layout.",
    "You'll get a calm SMS thread for intake questions before your session is fully confirmed.",
  ],
  guardSectionTitle: "Before your session",
  staffSelectLabel: "Therapist",
  visitPrep: [
    "Arrive 10 minutes early for a calm check-in.",
    "Hydrate before massage; avoid heavy meals right before bodywork.",
    "Reply on your visit link if you're running late — we'll hold your room when we can.",
  ],
  visitGreeting: (first) =>
    first?.trim()
      ? `Hi ${first.trim()} — your session at the studio is below.`
      : "Your session at the studio is below.",
  confirmPendingTitle: "Session request received",
  confirmBookedTitle: "You're booked in",
  giftComingSoonNote: null,
};

const BY_VERTICAL: Partial<Record<BusinessVertical, GuestPublicExperience>> = {
  wellness: WELLNESS_GUEST,
  beauty: {
    ...defaultGuestPublic("beauty"),
    careNotes: [
      "Patch tests may be required 24–48h before lash or tint services — we'll confirm by message.",
      "Arrive with clean lashes/nails and no heavy oils on the treatment area.",
    ],
    guardSectionTitle: "Treatment intake",
  },
  hair: {
    ...defaultGuestPublic("hair"),
    careNotes: [
      "For colour appointments, bring reference photos if you have them.",
      "Running late? Use your visit link to let the team know.",
    ],
  },
  medspa: {
    ...defaultGuestPublic("medspa"),
    heroTitle: "Book a treatment",
    careNotes: [
      "Consultations are required for first-time injectable treatments.",
      "Avoid blood thinners and alcohol 24h before certain procedures unless your clinician advises otherwise.",
    ],
    guardSectionTitle: "Treatment intake",
  },
  "pet-grooming": {
    ...defaultGuestPublic("pet-grooming"),
    guardSectionTitle: "About your pet",
    careNotes: [
      "Tell us about temperament, matting, or medical needs in the notes step.",
      "Puppies and seniors may need shorter sessions — we'll confirm timing after you book.",
    ],
  },
  fitness: {
    ...defaultGuestPublic("fitness"),
    heroTitle: "Book a class",
    guardSectionTitle: "Before your session",
  },
  "allied-health": {
    ...defaultGuestPublic("allied-health"),
    guardSectionTitle: "Clinical intake",
  },
  "automotive-detailing": {
    ...defaultGuestPublic("automotive-detailing"),
    guardSectionTitle: "Your vehicle",
  },
  "body-art": {
    ...defaultGuestPublic("body-art"),
    heroTitle: "Book a session",
    careNotes: [
      "Consultations are free — session work may require a deposit to hold long slots.",
      "Come rested, fed, and hydrated; avoid alcohol before your session.",
    ],
  },
};

export function guestPublicExperience(
  vertical?: string | null,
  category?: string | null,
): GuestPublicExperience {
  const key = resolveVerticalKey(vertical, category);
  return BY_VERTICAL[key] ?? defaultGuestPublic(key);
}

export function guestPublicHeroTagline(
  vertical?: string | null,
  category?: string | null,
  cssPreset?: string | null,
): string | undefined {
  const exp = guestPublicExperience(vertical, category);
  if (!exp.heroTaglineByPreset) return undefined;
  const preset = cssPreset ?? "harbour-light";
  return exp.heroTaglineByPreset[preset] ?? exp.heroTaglineByPreset["harbour-light"];
}

export function guestPublicCatalogLayout(
  vertical?: string | null,
  category?: string | null,
): GuestPublicCatalogLayout {
  return guestPublicExperience(vertical, category).catalogLayout;
}

export function guestPublicCareNotes(
  vertical?: string | null,
  category?: string | null,
): string[] {
  return guestPublicExperience(vertical, category).careNotes;
}

export function guestPublicGuardSectionTitle(
  vertical?: string | null,
  category?: string | null,
): string {
  return guestPublicExperience(vertical, category).guardSectionTitle;
}

export function guestPublicVisitPrep(
  vertical?: string | null,
  category?: string | null,
): string[] {
  return guestPublicExperience(vertical, category).visitPrep;
}
