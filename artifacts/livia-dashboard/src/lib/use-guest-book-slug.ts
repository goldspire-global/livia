import { useParams } from "wouter";
import { useEffect, useState } from "react";
import {
  guestBookSlugFromWindow,
  resolveGuestBookSlugFromWindow,
} from "@/lib/guest-host-routing";
import {
  parsePublicBookingSlug,
  parsePublicEventVendorPathSlug,
  parsePublicQuotePath,
  parsePublicTokenPath,
} from "@/lib/public-guest-route-params";

type GuestTokenSegment = "visit" | "proof" | "intake" | "pay" | "balance" | "shop" | "waitlist";

/** Resolve book slug from route params, subdomain host, custom domain, or `/book/{slug}` path. */
export function useGuestBookSlug(): string | undefined {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const [hostSlug, setHostSlug] = useState<string | undefined>(() => {
    if (routeSlug) return routeSlug;
    return guestBookSlugFromWindow() ?? undefined;
  });

  useEffect(() => {
    if (routeSlug) {
      setHostSlug(routeSlug);
      return;
    }
    const sync = guestBookSlugFromWindow();
    if (sync) setHostSlug(sync);
  }, [routeSlug]);

  useEffect(() => {
    if (routeSlug || hostSlug) return;
    void resolveGuestBookSlugFromWindow().then((s) => {
      if (s) setHostSlug(s);
    });
  }, [routeSlug, hostSlug]);

  if (routeSlug) return routeSlug;
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

/** Event-vendor slug from route params, subdomain host, or `/e/{slug}` path. */
export function useEventVendorSlug(): string | undefined {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  if (routeSlug) return routeSlug;
  const hostSlug = guestBookSlugFromWindow();
  if (hostSlug) return hostSlug;
  if (typeof window !== "undefined") {
    return parsePublicEventVendorPathSlug(window.location.pathname) ?? undefined;
  }
  return undefined;
}

export function useGuestQuoteRoute(): {
  slug: string | undefined;
  token: string | undefined;
} {
  const { slug: routeSlug, token: routeToken } = useParams<{ slug?: string; token?: string }>();
  const parsed =
    typeof window !== "undefined"
      ? parsePublicQuotePath(window.location.pathname)
      : null;
  const eventSlug = useEventVendorSlug();
  const slug = routeSlug ?? eventSlug ?? parsed?.slug ?? undefined;
  const token = routeToken ?? parsed?.token ?? undefined;
  return { slug, token };
}
