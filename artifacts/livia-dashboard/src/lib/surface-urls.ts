/** Customer-facing production domains (override via Vite env for previews). */

const marketingOrigin =
  (import.meta.env.VITE_MARKETING_URL as string | undefined)?.replace(/\/+$/, "") ??
  (import.meta.env.DEV ? "http://127.0.0.1:5174" : "https://livia-hq.com");

export const LEGAL_ENTITY_NAME = "Goldspire Ventures Ltd";

export function getMarketingOrigin(): string {
  return marketingOrigin;
}

export function legalUrl(path: "privacy" | "tos" | "dpa" | "cookies"): string {
  return `${marketingOrigin}/legal/${path}`;
}

function dashboardOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin.replace(/\/+$/, "");
  return import.meta.env.DEV ? "http://localhost:5173" : "https://app.livia-hq.com";
}

/** Wildcard `*.livia-hq.com` is opt-in — until DNS + Vercel host is live, use app path URLs. */
export function guestSubdomainLive(): boolean {
  return (
    !import.meta.env.DEV &&
    (import.meta.env.VITE_GUEST_SUBDOMAIN_LIVE === "true" ||
      import.meta.env.VITE_GUEST_SUBDOMAIN_LIVE === "1")
  );
}

export function publicBookingUrl(slug: string): string {
  if (!guestSubdomainLive()) return `${dashboardOrigin()}/book/${slug}`;
  return `https://${slug}.livia-hq.com`;
}

export function publicEventVendorSiteUrl(slug: string): string {
  if (!guestSubdomainLive()) return `${dashboardOrigin()}/e/${slug}`;
  return `https://${slug}.livia-hq.com`;
}

export function publicEventVendorEnquireUrl(slug: string): string {
  return `${publicEventVendorSiteUrl(slug)}/enquire`;
}

export function marketingPricingUrl(): string {
  return `${marketingOrigin}/pricing`;
}

/** Slug field prefix in onboarding — dev path or subdomain stem. */
export function publicBookingSlugPrefix(): string {
  if (!guestSubdomainLive()) return `${dashboardOrigin().replace(/^https?:\/\//, "")}/book/`;
  return "";
}

export function publicBookingSlugSuffix(): string {
  if (!guestSubdomainLive()) return "";
  return ".livia-hq.com";
}
