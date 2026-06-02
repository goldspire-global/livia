/**
 * Beauty (and shared) presentation presets → mobile color overrides.
 * Web uses `html[data-presentation]`; mobile merges into base palette (dark default).
 * Light beauty presets use the same tokens as guest `/b` — see `BEAUTY_LIGHT_PUBLIC_COLORS`.
 */
import { BEAUTY_LIGHT_PUBLIC_COLORS } from "@/lib/beauty-public";

export type PresentationColorOverrides = {
  background?: string;
  card?: string;
  foreground?: string;
  cardForeground?: string;
  primary?: string;
  primaryForeground?: string;
  border?: string;
  mutedForeground?: string;
  colorScheme?: "light" | "dark";
};

export const PRESENTATION_PRESET_MOBILE: Record<string, PresentationColorOverrides> = {
  "platform-default": {},
  "noir-dusk": {
    background: "#131218",
    card: "#1b1922",
    primary: "#d4a5b8",
    border: "#2a2630",
    colorScheme: "dark",
  },
  "soft-studio": {
    ...BEAUTY_LIGHT_PUBLIC_COLORS["soft-studio"],
    cardForeground: BEAUTY_LIGHT_PUBLIC_COLORS["soft-studio"].foreground,
    primaryForeground: "#ffffff",
    colorScheme: "light",
  },
  editorial: {
    ...BEAUTY_LIGHT_PUBLIC_COLORS.editorial,
    cardForeground: BEAUTY_LIGHT_PUBLIC_COLORS.editorial.foreground,
    primaryForeground: "#ffffff",
    colorScheme: "light",
  },
  "premium-dark": {
    background: "#12100e",
    card: "#1c1916",
    primary: "#c9a484",
    border: "#2a2520",
    mutedForeground: "#9a9088",
    colorScheme: "dark",
  },
  "warm-chair": {
    background: "#141210",
    card: "#1e1b17",
    primary: "#a67c52",
    border: "#2a2520",
  },
};

export function resolvePresentationMobileColors(
  cssPreset: string | null | undefined,
  brandAccentHex: string | null | undefined,
): PresentationColorOverrides {
  const base = PRESENTATION_PRESET_MOBILE[cssPreset ?? ""] ?? {};
  if (brandAccentHex) {
    return { ...base, primary: brandAccentHex };
  }
  return base;
}
