/** Wellness-specific Liv tool ids — wired in liv-runtime wellness pack */

export const WELLNESS_LIV_TOOL_IDS = {
  PROPOSE_ROOM: "wellness_propose_room",
  PROPOSE_PACKAGE_BOOK: "wellness_propose_package_book",
  EOD_CLOSE: "wellness_eod_close",
  DUTY_SOLVER: "wellness_duty_solver",
  REROOM: "wellness_reroom",
} as const;

export type WellnessLivToolId = (typeof WELLNESS_LIV_TOOL_IDS)[keyof typeof WELLNESS_LIV_TOOL_IDS];

export const WELLNESS_LIV_TOOL_DESCRIPTIONS: Record<
  WellnessLivToolId,
  { label: string; failurePlainEnglish: string }
> = {
  wellness_propose_room: {
    label: "Propose room for booking",
    failurePlainEnglish:
      "That room is blocked by turnover or another session — try another lane or time.",
  },
  wellness_propose_package_book: {
    label: "Book using package credits",
    failurePlainEnglish:
      "No active package credits on this guest — offer a single session or sell a pack first.",
  },
  wellness_eod_close: {
    label: "End-of-day close narrative",
    failurePlainEnglish: "Could not build close summary — check today's bookings loaded.",
  },
  wellness_duty_solver: {
    label: "Find free therapist in room",
    failurePlainEnglish: "No therapist free in that room at that hour — try another slot.",
  },
  wellness_reroom: {
    label: "Propose rerooming after cancel",
    failurePlainEnglish: "No open rooms with turnover buffer for those sessions.",
  },
};

export const WELLNESS_LIV_EXTRA_TOOL_IDS: WellnessLivToolId[] = [
  WELLNESS_LIV_TOOL_IDS.PROPOSE_ROOM,
  WELLNESS_LIV_TOOL_IDS.PROPOSE_PACKAGE_BOOK,
  WELLNESS_LIV_TOOL_IDS.EOD_CLOSE,
  WELLNESS_LIV_TOOL_IDS.DUTY_SOLVER,
  WELLNESS_LIV_TOOL_IDS.REROOM,
];
