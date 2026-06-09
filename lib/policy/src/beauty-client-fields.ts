import type { BeautyClientProfile } from "./beauty-booking-rules";

export type { BeautyClientProfile };

export const BEAUTY_LASH_CURL_OPTIONS = ["J", "C", "CC", "D"] as const;
export const BEAUTY_NAIL_SHAPE_OPTIONS = ["square", "almond", "oval", "coffin"] as const;

export function parseBeautyPreferences(raw: unknown): BeautyClientProfile["beautyPreferences"] {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    lashCurl: typeof o.lashCurl === "string" ? o.lashCurl : null,
    lashLength: typeof o.lashLength === "string" ? o.lashLength : null,
    lashStyle: typeof o.lashStyle === "string" ? o.lashStyle : null,
    nailShape: typeof o.nailShape === "string" ? o.nailShape : null,
    adhesiveSensitivity: o.adhesiveSensitivity === true,
    formulaNotes: typeof o.formulaNotes === "string" ? o.formulaNotes : null,
    formulaSketchUrl: typeof o.formulaSketchUrl === "string" ? o.formulaSketchUrl : null,
  };
}

export function beautyClientPatchTestLabel(completedAt?: string | Date | null): string {
  if (!completedAt) return "No patch test on file";
  const d = completedAt instanceof Date ? completedAt : new Date(completedAt);
  if (Number.isNaN(d.getTime())) return "No patch test on file";
  return `Patch test · ${d.toLocaleDateString()}`;
}

export function staffWalkInHintForBeauty(): string {
  return "Walk-ins are routed by front desk — your chair updates when they're seated.";
}
