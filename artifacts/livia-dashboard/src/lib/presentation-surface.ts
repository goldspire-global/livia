import type { PresentationLayoutMorph } from "@workspace/policy";
import { useTenantExperience, type TenantPresentation } from "@/lib/tenant-experience-api";

export type PresentationSurfaceState = {
  cssPreset: string | null;
  layoutMorph: PresentationLayoutMorph | null;
  layout: string | null;
  presetId: string | null;
  presetLabel: string | null;
};

export function presentationSurfaceFromTenant(
  presentation?: TenantPresentation | null,
  vertical?: string | null,
): PresentationSurfaceState {
  if (!presentation) {
    return {
      cssPreset: null,
      layoutMorph: null,
      layout: null,
      presetId: null,
      presetLabel: null,
    };
  }
  return {
    cssPreset: presentation.cssPreset,
    layoutMorph: null,
    layout: presentation.tokens?.layout ?? null,
    presetId: presentation.presetId,
    presetLabel: presentation.label,
  };
}

export function usePresentationSurface(businessId: string | undefined): PresentationSurfaceState {
  const { data } = useTenantExperience(businessId);
  const presentation = data?.presentation;
  return {
    cssPreset: presentation?.cssPreset ?? null,
    layoutMorph:
      typeof document !== "undefined"
        ? (document.documentElement.dataset.layoutMorph as PresentationLayoutMorph | undefined) ??
          null
        : null,
    layout: presentation?.tokens?.layout ?? null,
    presetId: presentation?.presetId ?? null,
    presetLabel: presentation?.label ?? null,
  };
}

export function layoutMorphLabel(morph: PresentationLayoutMorph | null): string {
  switch (morph) {
    case "atrium":
      return "Room swimlanes";
    case "timeline-rail":
      return "Session timeline";
    case "ledger":
      return "Voucher ledger";
    case "constellation":
      return "Constellation";
    case "pipeline":
      return "Pipeline";
    case "split-inbox":
      return "Split inbox";
    case "menu-card":
      return "Treatment menu";
    case "cockpit":
      return "Floor cockpit";
    default:
      return "Standard";
  }
}
