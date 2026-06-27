/**
 * Chair / booth hosting — advertise on public book, capture renter enquiries, link on /host.
 */
import { resolveVerticalKey } from "./vocabulary";

export type ChairHostingListing = {
  enabled: boolean;
  headline: string;
  body: string;
  /** Weekly rate in minor units (cents). */
  weeklyRateMinor: number;
  chairsAvailable: number;
  amenities: string[];
  /** Shown on public book when set. */
  contactEmail?: string | null;
};

export const DEFAULT_CHAIR_HOSTING_LISTING: ChairHostingListing = {
  enabled: false,
  headline: "Chair available",
  body: "Independent stylist? Rent a chair with us — enquire below.",
  weeklyRateMinor: 0,
  chairsAvailable: 1,
  amenities: [],
  contactEmail: null,
};

export function parseChairHostingListing(raw: unknown): ChairHostingListing {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_CHAIR_HOSTING_LISTING };
  const o = raw as Record<string, unknown>;
  return {
    enabled: o.enabled === true,
    headline:
      typeof o.headline === "string" && o.headline.trim()
        ? o.headline.trim()
        : DEFAULT_CHAIR_HOSTING_LISTING.headline,
    body:
      typeof o.body === "string" && o.body.trim()
        ? o.body.trim()
        : DEFAULT_CHAIR_HOSTING_LISTING.body,
    weeklyRateMinor:
      typeof o.weeklyRateMinor === "number" && o.weeklyRateMinor >= 0
        ? Math.round(o.weeklyRateMinor)
        : 0,
    chairsAvailable:
      typeof o.chairsAvailable === "number" && o.chairsAvailable > 0
        ? Math.min(24, Math.round(o.chairsAvailable))
        : 1,
    amenities: Array.isArray(o.amenities)
      ? o.amenities.filter((a): a is string => typeof a === "string").slice(0, 12)
      : [],
    contactEmail: typeof o.contactEmail === "string" ? o.contactEmail.trim() || null : null,
  };
}

/** Verticals where chair/booth hosting advertising is offered. */
export function chairHostingEligibleVertical(vertical?: string | null): boolean {
  const key = resolveVerticalKey(vertical);
  return key === "hair" || key === "beauty" || key === "body-art";
}

export function chairHostingPublicVisible(
  vertical: string | null | undefined,
  listing: ChairHostingListing,
  tier?: string | null,
): boolean {
  if (!listing.enabled) return false;
  if (!chairHostingEligibleVertical(vertical)) return false;
  if (tier === "chair-host") return true;
  return listing.chairsAvailable > 0 && listing.headline.trim().length > 0;
}

export const CHAIR_HOSTING_COPY = {
  publicEyebrow: "For stylists",
  publicCta: "Enquire about a chair",
  publicThanks: "Thanks — the studio will be in touch shortly.",
  hostPanelTitle: "Advertise chair rental",
  hostPanelBody:
    "Show availability on your public booking page. Enquiries land here. Link renters on Host floor after upgrading to the Host plan in Billing.",
  enquiriesTitle: "Chair enquiries",
  emptyEnquiries: "No enquiries yet — turn on advertising to attract renters.",
} as const;
