import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useTenantExperience } from "@/hooks/useTenantExperience";
import type { PresentationColorOverrides } from "@/lib/presentation-preset-colors";
import {
  resolveMobileSkin,
  type MobileSkin,
} from "@/lib/resolve-mobile-skin";
import { resolveTenantPresentationSurface } from "@/lib/tenant-presentation-surface";
import type { PresentationLayoutMorph } from "@workspace/policy";
import { verticalAccentHex } from "@/lib/vertical-theme";

type PresentationThemeValue = MobileSkin & {
  overrides: PresentationColorOverrides | null;
  cssPreset: string | null;
};

const EMPTY_SURFACE = resolveTenantPresentationSurface({});
const EMPTY_SKIN = resolveMobileSkin(EMPTY_SURFACE);

const EMPTY: PresentationThemeValue = {
  ...EMPTY_SKIN,
  overrides: null,
  cssPreset: null,
};

const PresentationThemeContext = createContext<PresentationThemeValue>(EMPTY);

export function PresentationThemeProvider({ children }: { children: ReactNode }) {
  const { currentBusiness } = useBusiness();
  const bid = currentBusiness?.id;
  const { data: raw } = useTenantExperience(bid);
  const biz = currentBusiness as {
    vertical?: string;
    category?: string;
    country?: string;
  } | null;
  const presentation = (
    raw as {
      vertical?: string;
      presentation?: {
        cssPreset?: string;
        brandAccentHex?: string | null;
        tokens?: { colorMode?: string };
      };
      publicAppearance?: { brandAccentHex?: string | null };
    } | null | undefined
  )?.presentation;

  const value = useMemo<PresentationThemeValue>(() => {
    const vertical = biz?.vertical ?? (raw as { vertical?: string } | null)?.vertical ?? null;
    const category = biz?.category ?? null;
    const cssPreset = presentation?.cssPreset ?? "platform-default";
    const brandAccentHex =
      presentation?.brandAccentHex ??
      (raw as { publicAppearance?: { brandAccentHex?: string | null } } | null)?.publicAppearance
        ?.brandAccentHex;
    const tokenMode = presentation?.tokens?.colorMode;
    const colorMode =
      tokenMode === "light" || tokenMode === "dark" ? tokenMode : null;

    const surface = resolveTenantPresentationSurface({
      vertical,
      category,
      cssPreset,
      brandAccentHex,
      colorMode,
    });
    const skin = resolveMobileSkin(surface);
    const hasOverrides = Object.keys(skin.colorOverrides).length > 0;

    return {
      ...skin,
      overrides: hasOverrides ? skin.colorOverrides : null,
      cssPreset: skin.effectiveCssPreset,
    };
  }, [biz?.vertical, biz?.category, presentation, raw]);

  return (
    <PresentationThemeContext.Provider value={value}>
      {children}
    </PresentationThemeContext.Provider>
  );
}

export function useTenantPresentation(): PresentationThemeValue {
  return useContext(PresentationThemeContext);
}

/** Native skin interpreter output — prefer over ad-hoc `isConstellation` checks. */
export function useMobileSkin(): MobileSkin {
  return useContext(PresentationThemeContext);
}

export function usePresentationColorOverrides(): PresentationColorOverrides | null {
  return useContext(PresentationThemeContext).overrides;
}

export function usePresentationCssPreset(): string | null {
  return useContext(PresentationThemeContext).cssPreset;
}

export function usePresentationLayoutMorph(): PresentationLayoutMorph {
  return useContext(PresentationThemeContext).layoutMorph;
}

/** Tenant chrome accent — preset primary; Constellation keeps vertical ritual pink/teal like web `data-vertical`. */
export function usePresentationAccent(): string {
  const p = useContext(PresentationThemeContext);
  if (p.ritualAccentFromVertical && p.vertical) {
    return verticalAccentHex(p.vertical, p.category);
  }
  return p.colorOverrides.primary ?? verticalAccentHex(p.vertical, p.category);
}
