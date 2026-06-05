import { useBeautyChrome, useWellnessChrome } from "@/lib/presentation-layout";
import {
  beautyListScroll,
  beautyOutlineButton,
  beautyPanel,
  beautyPrimaryButton,
  beautyRow,
} from "@/lib/beauty-operational-ui";
import {
  wellnessAvatarRing,
  wellnessBookingStatusClass,
  wellnessListPanel,
  wellnessListScroll,
  wellnessOutlineButton,
  wellnessPrimaryButton,
  wellnessRow,
} from "@/lib/wellness-operational-ui";
import { cn } from "@/lib/utils";

/** Beauty or wellness native presentation — W4 list pages, bookings, roster, etc. */
export function useOperationalChrome(vertical?: string | null) {
  const beauty = useBeautyChrome(vertical);
  const wellness = useWellnessChrome(vertical);
  return {
    beauty,
    wellness,
    native: beauty || wellness,
    panel: (extra?: string) => cn(beautyPanel(beauty, extra), wellnessListPanel(wellness, extra)),
    primaryButton: (extra?: string) =>
      cn(beautyPrimaryButton(beauty, extra), wellnessPrimaryButton(wellness, extra)),
    outlineButton: (extra?: string) =>
      cn(beautyOutlineButton(beauty, extra), wellnessOutlineButton(wellness, extra)),
    listScroll: (extra?: string) =>
      cn(beauty ? beautyListScroll(extra) : "", wellness ? wellnessListScroll(extra) : "", !beauty && !wellness && "divide-y divide-border/70 overscroll-contain"),
    row: (attention?: boolean, extra?: string) =>
      cn(beautyRow(beauty, attention, extra), wellnessRow(wellness, attention, extra)),
    avatarRing: (extra?: string) =>
      cn(
        "flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm shrink-0",
        wellness ? wellnessAvatarRing(true, extra) : "bg-primary/10 text-primary",
        extra,
      ),
    bookingStatus: (status: string, fallback: string) =>
      wellnessBookingStatusClass(wellness, status, fallback),
  };
}
