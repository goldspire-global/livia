/** Trust + anti lock-in copy for wellness onboarding and settings */

export const WELLNESS_TRUST_COPY = {
  exportAnytime:
    "Your guest list is yours — export CSV anytime from Guests. No marketplace lock-in.",
  auditDiary:
    "Liv and staff actions on bookings and packages appear in your audit diary.",
  brokerHonesty:
    "Liv explains what each integration does and what stays manual until you connect it.",
  dataPortability:
    "Leave with your guests, packages ledger, and conversation history — not a walled garden.",
} as const;

export const WELLNESS_ONBOARDING_TRUST_LINES = [
  WELLNESS_TRUST_COPY.exportAnytime,
  WELLNESS_TRUST_COPY.dataPortability,
] as const;
