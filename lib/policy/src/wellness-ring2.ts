/** Ring 2 — hotel folio, ClassPass-adjacent packs (corporate → wellness-corporate-portal.ts) */

export const WELLNESS_HOTEL_FOLIO = {
  partnerLabel: "Hotel spa folio",
  chargeCodePrefix: "HS",
  note: "Charges post to room folio when hotel partner API key is configured.",
} as const;

export const WELLNESS_CLASSPASS_ADJACENT = {
  packName: "Session pack",
  sessionsIncluded: 10,
  validityDays: 90,
  note: "Multi-session packs with studio-wide redeem — not ClassPass marketplace dependency.",
} as const;
