/**
 * Quality registry — category moat stub for visit quality signals (year-one data).
 */
export type QualitySignalId = "visit_feedback_avg" | "no_show_rate" | "rebook_rate";

export type QualityRegistryEntry = {
  signalId: QualitySignalId;
  label: string;
  value: number | null;
  unit: "score" | "percent";
  benchmarkLabel: string;
  status: "strong" | "watch" | "unknown";
};

export function buildQualityRegistryEntries(input: {
  avgFeedback: number | null;
  noShowRatePercent: number | null;
  rebookRatePercent: number | null;
}): QualityRegistryEntry[] {
  const feedbackStatus =
    input.avgFeedback == null
      ? "unknown"
      : input.avgFeedback >= 4.5
        ? "strong"
        : input.avgFeedback >= 3.8
          ? "watch"
          : "watch";
  const noShowStatus =
    input.noShowRatePercent == null
      ? "unknown"
      : input.noShowRatePercent <= 5
        ? "strong"
        : input.noShowRatePercent <= 10
          ? "watch"
          : "watch";
  const rebookStatus =
    input.rebookRatePercent == null
      ? "unknown"
      : input.rebookRatePercent >= 35
        ? "strong"
        : input.rebookRatePercent >= 20
          ? "watch"
          : "watch";

  return [
    {
      signalId: "visit_feedback_avg",
      label: "Visit feedback",
      value: input.avgFeedback,
      unit: "score",
      benchmarkLabel: "4.5+ is strong for premium service",
      status: feedbackStatus,
    },
    {
      signalId: "no_show_rate",
      label: "No-show rate",
      value: input.noShowRatePercent,
      unit: "percent",
      benchmarkLabel: "Under 5% is excellent",
      status: noShowStatus,
    },
    {
      signalId: "rebook_rate",
      label: "Rebook rate",
      value: input.rebookRatePercent,
      unit: "percent",
      benchmarkLabel: "35%+ repeat within 90 days",
      status: rebookStatus,
    },
  ];
}
