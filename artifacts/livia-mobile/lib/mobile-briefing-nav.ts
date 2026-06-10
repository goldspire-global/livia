import * as Linking from "expo-linking";
import { getDashboardBaseUrl } from "@/lib/dashboard-url";

/** Map policy/web briefing hrefs to in-app Expo routes where mobile has parity. */
export function briefingHrefToMobile(href: string): string | null {
  const base = href.split("?")[0];
  if (base === "/bookings" || href.startsWith("/bookings?")) {
    const q = href.includes("status=PENDING") ? "?status=PENDING" : "";
    return `/bookings${q}`;
  }
  if (base === "/inbox" || href.startsWith("/inbox?")) {
    return "/inbox";
  }
  if (base === "/customers") return "/customers";
  if (base === "/dashboard" || base === "/") return "/";
  if (base === "/my-day") return "/my-day";
  if (base === "/approvals") return "/approvals";
  if (base === "/booking/new") return "/booking/new";
  return null;
}

export function openBriefingHref(href: string, router: { push: (path: string) => void }): void {
  const mobile = briefingHrefToMobile(href);
  if (mobile) {
    router.push(mobile as never);
    return;
  }
  void Linking.openURL(`${getDashboardBaseUrl()}${href}`);
}
