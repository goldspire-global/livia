/**
 * Wellness owner reports — labels and stress score weights (hub).
 */
export const WELLNESS_REPORT_SLUGS = [
  "room_heatmap",
  "package_waterfall",
  "sales_by_service",
  "tomorrow_stress",
  "liv_interventions",
] as const;

export type WellnessReportSlug = (typeof WELLNESS_REPORT_SLUGS)[number];

export const WELLNESS_REPORT_LABELS: Record<WellnessReportSlug, { title: string; description: string }> = {
  room_heatmap: {
    title: "Room utilisation",
    description: "Hour-by-hour load per room — idle, booked, turnover buffer.",
  },
  package_waterfall: {
    title: "Package waterfall",
    description: "Sessions sold, redeemed, remaining, and expiring liability.",
  },
  sales_by_service: {
    title: "Sessions by treatment",
    description: "Duration mix and volume for the period.",
  },
  tomorrow_stress: {
    title: "Tomorrow stress",
    description: "Pending decisions, room pressure, and vouchers expiring soon.",
  },
  liv_interventions: {
    title: "Liv this week",
    description: "Bookings Liv touched — confirms, escalations, saved no-shows.",
  },
};

/** Weights for 0–100 stress score on Today. */
export const WELLNESS_STRESS_WEIGHTS = {
  perPending: 8,
  perRoomConflict: 12,
  perExpiringVoucher: 5,
  cap: 100,
} as const;
