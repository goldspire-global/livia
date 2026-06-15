import {
  applyExperienceTheme,
  applyTenantPresentationSurface,
  clearExperienceTheme,
  clearPresentationTheme,
  resolvePresentationColorMode,
} from "@/lib/experience-theme";

export type PublicGuestExperienceSkin = {
  presentation?: string;
  presentationColorMode?: string;
  brandAccentHex?: string | null;
};

/** Apply tenant presentation on public /b guest surfaces (book, pay, visit, shop). */
export function applyPublicGuestSurfaceTheme(args: {
  vertical?: string | null;
  category?: string | null;
  country?: string | null;
  experienceSkin?: PublicGuestExperienceSkin | null;
}) {
  const preset = args.experienceSkin?.presentation ?? null;
  applyExperienceTheme({
    vertical: args.vertical,
    category: args.category,
    country: args.country,
    includeVerticalColorTokens: !preset,
  });

  if (!preset && !args.experienceSkin?.brandAccentHex) return;

  const savedMode =
    args.experienceSkin?.presentationColorMode === "light" ||
    args.experienceSkin?.presentationColorMode === "dark"
      ? args.experienceSkin.presentationColorMode
      : null;

  applyTenantPresentationSurface({
    vertical: args.vertical,
    category: args.category,
    country: args.country,
    cssPreset: preset ?? "platform-default",
    brandAccentHex: args.experienceSkin?.brandAccentHex,
    colorMode: savedMode ?? resolvePresentationColorMode(preset),
  });
}

export function clearPublicGuestSurfaceTheme() {
  document.documentElement.removeAttribute("data-vertical");
  clearExperienceTheme();
  clearPresentationTheme();
}
