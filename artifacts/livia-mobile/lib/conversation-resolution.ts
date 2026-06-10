export type ConversationResolution = {
  outcome?: string;
  refundMinor?: number | null;
  at?: string;
  effects?: string[];
};

export function resolutionSummary(
  resolution: ConversationResolution | null | undefined,
): string | null {
  if (!resolution?.outcome) return null;
  switch (resolution.outcome) {
    case "refund_and_cancel":
      return resolution.refundMinor
        ? "Refunded · booking cancelled"
        : "Refund issued · booking cancelled";
    case "cancel_no_refund":
      return "Appointment cancelled · no refund";
    case "close_no_action":
      return "Case closed";
    case "reschedule":
      return "Rescheduled";
    default:
      return resolution.outcome.replace(/_/g, " ");
  }
}
