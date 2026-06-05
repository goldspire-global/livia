/**
 * Wellness experiential layer — policy hub for ambiance, motion beats, and surface ergonomics.
 * Consumed by web canvas ambient, mobile Reanimated halos, and tablet/reception layouts.
 * Not CSS-only: runtime reads these tokens for JS animation timing and touch targets.
 */

export type WellnessCssPreset = "harbour-light" | "session-rail" | "evening-ledger";

export type WellnessAmbienceTokens = {
  /** Full in-out breath cycle (ms) — sync web canvas + mobile halo */
  breathPeriodMs: number;
  /** Primary wash (hex or hsl string for canvas) */
  glowPrimary: string;
  glowSecondary: string;
  /** 0 = static gradient only; 1 = slow drift; 2 = dual orb drift (desktop/tablet) */
  driftTier: 0 | 1 | 2;
  /** Evening ledger candle flicker on confirm beats */
  candleFlicker: boolean;
};

export type WellnessMotionBeats = {
  pageEnter: "fade-rise" | "fade";
  listStaggerMs: number;
  successGlowMs: number;
  turnoverPulseMs: number;
  livThinkingPulse: boolean;
};

export type WellnessSurfaceErgonomics = {
  /** Phone minimum touch target (px) */
  touchMinPx: number;
  /** Tablet / reception desk */
  tabletTouchMinPx: number;
  /** Stylus + fine pointer — tighter hit slop on drag handles */
  stylusPrecision: boolean;
  /** Landscape tablet split (reception, inbox) */
  splitPaneTablet: boolean;
  /** Haptic on session complete (mobile) */
  hapticOnComplete: boolean;
};

export type WellnessExperienceProfile = {
  preset: WellnessCssPreset;
  label: string;
  ambience: WellnessAmbienceTokens;
  motion: WellnessMotionBeats;
  surface: WellnessSurfaceErgonomics;
  /** Copy beats for ritual moments — tenant vocabulary still applies on surfaces */
  ritualCopy: {
    sessionComplete: string;
    turnoverStart: string;
    giftReveal: string;
    arrivalCalm: string;
  };
};

const BASE_SURFACE: WellnessSurfaceErgonomics = {
  touchMinPx: 44,
  tabletTouchMinPx: 56,
  stylusPrecision: true,
  splitPaneTablet: true,
  hapticOnComplete: true,
};

export const WELLNESS_EXPERIENCE_BY_CSS: Record<WellnessCssPreset, WellnessExperienceProfile> = {
  "harbour-light": {
    preset: "harbour-light",
    label: "Harbour Light",
    ambience: {
      breathPeriodMs: 4200,
      glowPrimary: "hsla(174, 72%, 28%, 0.12)",
      glowSecondary: "hsla(158, 38%, 75%, 0.18)",
      driftTier: 2,
      candleFlicker: false,
    },
    motion: {
      pageEnter: "fade-rise",
      listStaggerMs: 40,
      successGlowMs: 600,
      turnoverPulseMs: 800,
      livThinkingPulse: true,
    },
    surface: { ...BASE_SURFACE },
    ritualCopy: {
      sessionComplete: "Session complete — room turning over",
      turnoverStart: "Turnover buffer — next guest shortly",
      giftReveal: "A calm gift, ready when they are",
      arrivalCalm: "Arrive unhurried — we will guide you to your room",
    },
  },
  "session-rail": {
    preset: "session-rail",
    label: "Session Rail",
    ambience: {
      breathPeriodMs: 3600,
      glowPrimary: "hsla(222, 47%, 11%, 0.06)",
      glowSecondary: "hsla(220, 14%, 86%, 0.25)",
      driftTier: 1,
      candleFlicker: false,
    },
    motion: {
      pageEnter: "fade",
      listStaggerMs: 32,
      successGlowMs: 500,
      turnoverPulseMs: 700,
      livThinkingPulse: true,
    },
    surface: { ...BASE_SURFACE, splitPaneTablet: false },
    ritualCopy: {
      sessionComplete: "Marked complete",
      turnoverStart: "Turnover timer running",
      giftReveal: "Package ready to redeem",
      arrivalCalm: "Your therapist will meet you at the room",
    },
  },
  "evening-ledger": {
    preset: "evening-ledger",
    label: "Evening Ledger",
    ambience: {
      breathPeriodMs: 5200,
      glowPrimary: "hsla(38, 55%, 58%, 0.14)",
      glowSecondary: "hsla(220, 25%, 12%, 0.5)",
      driftTier: 2,
      candleFlicker: true,
    },
    motion: {
      pageEnter: "fade-rise",
      listStaggerMs: 48,
      successGlowMs: 700,
      turnoverPulseMs: 900,
      livThinkingPulse: true,
    },
    surface: { ...BASE_SURFACE },
    ritualCopy: {
      sessionComplete: "Evening session closed",
      turnoverStart: "Room reset for tomorrow",
      giftReveal: "Voucher added to ledger",
      arrivalCalm: "Evening arrival — take a breath at reception",
    },
  },
};

export function isWellnessCssPreset(v: string | null | undefined): v is WellnessCssPreset {
  return v === "harbour-light" || v === "session-rail" || v === "evening-ledger";
}

export function resolveWellnessExperience(
  cssPreset: string | null | undefined,
): WellnessExperienceProfile | null {
  if (!isWellnessCssPreset(cssPreset)) return null;
  return WELLNESS_EXPERIENCE_BY_CSS[cssPreset];
}

/** Reception / TV routes — always tablet-first ergonomics regardless of preset */
export const WELLNESS_RECEPTION_SURFACE_IDS = [
  "wellness-reception",
  "wellness-tv",
  "wellness-reception-handoffs",
] as const;

export type WellnessReceptionSurfaceId = (typeof WELLNESS_RECEPTION_SURFACE_IDS)[number];

export function isWellnessReceptionSurface(surfaceId: string): surfaceId is WellnessReceptionSurfaceId {
  return (WELLNESS_RECEPTION_SURFACE_IDS as readonly string[]).includes(surfaceId);
}
