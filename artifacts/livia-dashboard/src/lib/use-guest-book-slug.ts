import { useParams } from "wouter";
import { guestBookSlugFromWindow } from "@/lib/guest-host-routing";
import {
  parsePublicBookingSlug,
  parsePublicTokenPath,
} from "@/lib/public-guest-route-params";

type GuestTokenSegment = "visit" | "proof" | "intake" | "pay" | "shop" | "waitlist";

/** Resolve book slug from route params, subdomain host, or `/book/{slug}` path. */
export function useGuestBookSlug(): string | undefined {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  if (routeSlug) return routeSlug;
  const hostSlug = guestBookSlugFromWindow();
  if (hostSlug) return hostSlug;
  if (typeof window !== "undefined") {
    return parsePublicBookingSlug(window.location.pathname) ?? undefined;
  }
  return undefined;
}

export function useGuestBookTokenRoute(segment: GuestTokenSegment): {
  slug: string | undefined;
  token: string | undefined;
} {
  const { token: routeToken } = useParams<{ slug?: string; token?: string }>();
  const slug = useGuestBookSlug();
  const token =
    routeToken ??
    (typeof window !== "undefined"
      ? parsePublicTokenPath(window.location.pathname, segment)?.token
      : undefined);
  return { slug, token };
}
