import { gatewayTheme } from "@/lib/gateway-theme";
import { verticalAccentHex } from "@/lib/vertical-theme";

/** Web `platform-default-constellation.css` — map watermark base opacity × 1.2 */
export const CONSTELLATION_MAP_OPACITY = 0.28;

export const CONSTELLATION_STROKE = {
  outer: 1.2,
  inner: 0.9,
  line: 0.6,
} as const;

export type ConstellationVerticalChrome = {
  vertical: string | null;
  ritualAccent: string;
  shellAccent: string;
  beautyBriefing: boolean;
  wellnessBriefing: boolean;
  briefingEyebrow: string;
};

/** Vertical beat on Constellation shell — web `data-vertical` + constellation-today. */
export function resolveConstellationVerticalChrome(
  vertical?: string | null,
  category?: string | null,
): ConstellationVerticalChrome {
  const ritualAccent =
    vertical === "beauty" || vertical === "wellness"
      ? verticalAccentHex(vertical, category)
      : gatewayTheme.aurumChampagne;

  return {
    vertical: vertical ?? null,
    ritualAccent,
    shellAccent: gatewayTheme.aurumChampagne,
    beautyBriefing: vertical === "beauty",
    wellnessBriefing: vertical === "wellness",
    briefingEyebrow:
      vertical === "beauty"
        ? "Liv briefing"
        : vertical === "wellness"
          ? "Liv briefing"
          : "Briefing",
  };
}
