import {
  isWellnessCssPreset,
  resolveWellnessExperience,
  type WellnessExperienceProfile,
} from "@workspace/policy";

export type SurfaceClass = "phone" | "tablet" | "desktop";

const LS_KEY = "livia.wellnessAmbient";

export type WellnessAmbientTier = "live" | "reduced";

export function detectSurfaceClass(width = typeof window !== "undefined" ? window.innerWidth : 1280): SurfaceClass {
  if (width < 640) return "phone";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function readWellnessAmbientTier(): WellnessAmbientTier {
  if (typeof window === "undefined") return "live";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";
  const stored = window.localStorage.getItem(LS_KEY);
  if (stored === "reduced") return "reduced";
  return "live";
}

export function applyWellnessAmbient(args: {
  cssPreset: string | null | undefined;
  vertical: string | null | undefined;
  surface?: SurfaceClass;
}): WellnessExperienceProfile | null {
  if (typeof document === "undefined") return null;
  const root = document.documentElement;
  const isWellness = args.vertical === "wellness";
  if (!isWellness || !isWellnessCssPreset(args.cssPreset ?? "")) {
    delete root.dataset.wellnessAmbience;
    delete root.dataset.wellnessSurface;
    delete root.dataset.wellnessDriftTier;
    return null;
  }

  const profile = resolveWellnessExperience(args.cssPreset);
  if (!profile) return null;

  const surface = args.surface ?? detectSurfaceClass();
  const tier = readWellnessAmbientTier();
  const hour = new Date().getHours();
  const tod = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  root.dataset.wellnessAmbience = tier;
  root.dataset.wellnessSurface = surface;
  root.dataset.wellnessDriftTier = String(profile.ambience.driftTier);
  root.dataset.wellnessTimeOfDay = tod;
  root.dataset.wellnessTouchMin = String(
    surface === "tablet" ? profile.surface.tabletTouchMinPx : profile.surface.touchMinPx,
  );
  root.style.setProperty("--wellness-breath-ms", `${profile.ambience.breathPeriodMs}ms`);
  root.style.setProperty("--wellness-touch-min", `${root.dataset.wellnessTouchMin}px`);

  return profile;
}

export function setWellnessAmbientTier(tier: WellnessAmbientTier): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, tier);
}
