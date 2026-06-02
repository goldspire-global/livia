import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useTenantExperience } from "@/hooks/useTenantExperience";
import {
  resolvePresentationMobileColors,
  type PresentationColorOverrides,
} from "@/lib/presentation-preset-colors";

type PresentationThemeValue = {
  overrides: PresentationColorOverrides | null;
  cssPreset: string | null;
};

const PresentationThemeContext = createContext<PresentationThemeValue>({
  overrides: null,
  cssPreset: null,
});

export function PresentationThemeProvider({ children }: { children: ReactNode }) {
  const { currentBusiness } = useBusiness();
  const bid = currentBusiness?.id;
  const { data: raw } = useTenantExperience(bid);
  const presentation = (
    raw as {
      presentation?: { cssPreset?: string; brandAccentHex?: string | null };
      publicAppearance?: { brandAccentHex?: string | null };
    } | null | undefined
  )?.presentation;

  const overrides = useMemo(
    () =>
      resolvePresentationMobileColors(
        presentation?.cssPreset,
        presentation?.brandAccentHex ??
          (raw as { publicAppearance?: { brandAccentHex?: string | null } } | null)?.publicAppearance
            ?.brandAccentHex,
      ),
    [presentation?.cssPreset, presentation?.brandAccentHex, raw],
  );

  const value = useMemo<PresentationThemeValue>(
    () => ({
      overrides: Object.keys(overrides).length > 0 ? overrides : null,
      cssPreset: presentation?.cssPreset ?? null,
    }),
    [overrides, presentation?.cssPreset],
  );

  return (
    <PresentationThemeContext.Provider value={value}>
      {children}
    </PresentationThemeContext.Provider>
  );
}

export function usePresentationColorOverrides(): PresentationColorOverrides | null {
  return useContext(PresentationThemeContext).overrides;
}

export function usePresentationCssPreset(): string | null {
  return useContext(PresentationThemeContext).cssPreset;
}
