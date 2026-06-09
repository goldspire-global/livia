import { Linking } from "react-native";
import { getDashboardOrigin } from "@/lib/guest-surface-url";

export const GUEST_HUB_TOKEN_KEY = "livia_guest_hub_token";

/** Open book URL — supports subdomain absolute URLs or path-mode. */
export function openGuestBookUrl(url: string): void {
  if (/^https?:\/\//i.test(url)) {
    void Linking.openURL(url);
    return;
  }
  const path = url.startsWith("/") ? url : `/${url}`;
  void Linking.openURL(`${getDashboardOrigin()}${path}`);
}

/** `/my/{slug}/visit/{bookingId}` → native mobile route segments. */
export function guestVisitMobilePath(visitUrl: string): string | null {
  const m = visitUrl.match(/\/my\/([^/]+)\/visit\/([^/?#]+)/);
  if (!m) return null;
  return `/my-livia/${m[1]}/visit/${m[2]}`;
}
