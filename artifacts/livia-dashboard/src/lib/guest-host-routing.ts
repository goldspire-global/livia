import { parseGuestBookSlugFromHost } from "@workspace/policy";

/** Book slug from subdomain (`bloom.livia-hq.com`) or null on app host. */
export function guestBookSlugFromWindow(): string | null {
  if (typeof window === "undefined") return null;
  return parseGuestBookSlugFromHost(window.location.hostname);
}

export function isGuestBookSubdomain(): boolean {
  return guestBookSlugFromWindow() != null;
}
