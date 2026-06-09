/** Parse guest book paths — `/book/{slug}` (canonical), legacy `/b/{slug}`, or subdomain token paths. */

export function parsePublicTokenPath(
  pathname: string,
  segment: string,
): { slug: string | null; token: string } | null {
  const p = pathname.split("?")[0] ?? "";
  const prefixed = p.match(
    new RegExp(`^\\/(?:b|book)\\/([^/]+)\\/${segment}\\/([^/]+)\\/?$`),
  );
  if (prefixed?.[1] && prefixed[2]) {
    return {
      slug: decodeURIComponent(prefixed[1]),
      token: decodeURIComponent(prefixed[2]),
    };
  }
  const bare = p.match(new RegExp(`^\\/${segment}\\/([^/]+)\\/?$`));
  if (bare?.[1]) {
    return { slug: null, token: decodeURIComponent(bare[1]) };
  }
  return null;
}

export function parsePublicShopPath(pathname: string): { slug: string; token: string } | null {
  const parsed = parsePublicTokenPath(pathname, "shop");
  if (!parsed?.token) return null;
  return { slug: parsed.slug ?? "", token: parsed.token };
}

export function parsePublicBookingSlug(pathname: string): string | null {
  const p = pathname.split("?")[0] ?? "";
  const m = p.match(/^\/(?:b|book)\/([^/]+)\/?$/);
  if (!m?.[1]) return null;
  return decodeURIComponent(m[1]);
}

export function isPublicShopPath(pathname: string): boolean {
  return parsePublicShopPath(pathname) != null;
}
