import { guestEventVendorPath } from "@workspace/policy";
import { isGuestBookSubdomain } from "@/lib/guest-host-routing";

/** Nav base for event-vendor chrome — `/e/{slug}` on app host, bare paths on book subdomain. */
export function eventVendorPublicBase(slug: string): string {
  return isGuestBookSubdomain() ? "" : guestEventVendorPath(slug);
}

export function eventVendorPublicHref(slug: string, segment = ""): string {
  const base = eventVendorPublicBase(slug);
  if (!segment) return base || "/";
  const seg = segment.startsWith("/") ? segment : `/${segment}`;
  return `${base}${seg}`;
}
