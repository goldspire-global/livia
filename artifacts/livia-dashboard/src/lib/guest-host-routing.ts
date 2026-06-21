import {
  isCustomBookHostCandidate,
  normalizeBookHost,
  parseGuestBookSlugFromHost,
} from "@workspace/policy";

const hostSlugCache = new Map<string, string | null>();

/** Book slug from subdomain (`bloom.livia-hq.com`) — sync only. */
export function guestBookSlugFromWindow(): string | null {
  if (typeof window === "undefined") return null;
  return parseGuestBookSlugFromHost(window.location.hostname);
}

/** Subdomain or verified custom domain → tenant slug. */
export async function resolveGuestBookSlugFromWindow(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const hostname = normalizeBookHost(window.location.hostname);
  const subdomainSlug = parseGuestBookSlugFromHost(hostname);
  if (subdomainSlug) return subdomainSlug;

  if (!isCustomBookHostCandidate(hostname)) return null;
  if (hostSlugCache.has(hostname)) return hostSlugCache.get(hostname) ?? null;

  try {
    const res = await fetch(
      `/api/public/resolve-book-host?host=${encodeURIComponent(hostname)}`,
    );
    if (res.ok) {
      const data = (await res.json()) as { slug?: string };
      const slug = data.slug?.trim() || null;
      hostSlugCache.set(hostname, slug);
      return slug;
    }
  } catch {
    /* offline / dev without API */
  }
  hostSlugCache.set(hostname, null);
  return null;
}

export function isGuestBookSubdomain(): boolean {
  return guestBookSlugFromWindow() != null;
}

/** Host may be book subdomain or verified custom domain. */
export function mightBeGuestBookHost(): boolean {
  if (typeof window === "undefined") return false;
  if (guestBookSlugFromWindow()) return true;
  return isCustomBookHostCandidate(window.location.hostname);
}
