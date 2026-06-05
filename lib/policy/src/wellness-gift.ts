/**
 * Public gift package purchase on `/b` — wellness-first.
 */
import type { BusinessVertical } from "./types";
import { resolveVerticalKey } from "./vocabulary";

export type WellnessGiftPackagePreset = {
  id: string;
  label: string;
  creditsTotal: number;
  expiresInDays: number | null;
};

export const WELLNESS_GIFT_PACKAGE_PRESETS: WellnessGiftPackagePreset[] = [
  { id: "six-session", label: "6-session pack", creditsTotal: 6, expiresInDays: 365 },
  { id: "three-session", label: "3-session pack", creditsTotal: 3, expiresInDays: 180 },
];

export function isWellnessGiftPublicBookEnabled(
  vertical?: string | null,
  category?: string | null,
): boolean {
  return resolveVerticalKey(vertical, category) === "wellness";
}

export function wellnessGiftConfirmLines(recipientFirstName: string, code: string): string[] {
  const who = recipientFirstName.trim() || "your recipient";
  return [
    `Gift pack recorded for ${who}.`,
    `Share code ${code} — they book at this studio and redeem sessions from My Livia or reception.`,
    "You'll get a calm email summary when email is provided.",
  ];
}
