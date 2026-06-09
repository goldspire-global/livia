import type { CapabilityHealthSummary } from "./capability-instances";

export type CapabilityHealthGrade = "A" | "B" | "C" | "D" | "F";

export type CapabilityHealthScore = {
  score: number;
  grade: CapabilityHealthGrade;
  headline: string;
};

function gradeFromScore(score: number): CapabilityHealthGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

/** Single 0–100 score for the tenant capability graph. */
export function scoreCapabilityGraphHealth(
  summary: CapabilityHealthSummary,
): CapabilityHealthScore {
  if (summary.total === 0) {
    return { score: 50, grade: "C", headline: "Capability graph not loaded" };
  }

  const weighted =
    (summary.active * 1 +
      summary.configured * 0.75 +
      summary.installed * 0.45 +
      summary.suspended * 0.2) /
    summary.total;

  let score = Math.round(weighted * 100);
  score -= Math.min(30, summary.blockerCount * 8);
  score -= Math.min(20, summary.suspended * 12);
  score = Math.max(0, Math.min(100, score));

  const grade = gradeFromScore(score);

  let headline: string;
  if (summary.blockerCount > 0) {
    headline = `${summary.blockerCount} blocker${summary.blockerCount === 1 ? "" : "s"} — finish setup to unlock capabilities`;
  } else if (summary.suspended > 0) {
    headline = `${summary.suspended} capability${summary.suspended === 1 ? "" : "ies"} paused`;
  } else if (summary.active === summary.total) {
    headline = "All platform capabilities active";
  } else {
    headline = `${summary.active} active · ${summary.configured} ready of ${summary.total}`;
  }

  return { score, grade, headline };
}
