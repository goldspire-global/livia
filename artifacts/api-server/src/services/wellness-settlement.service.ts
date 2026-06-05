import { getPackageCreditSummary } from "./package-credits.service";
import { getWellnessReportsBundle } from "./wellness-reports.service";

export async function buildWellnessSettlementCsv(businessId: string): Promise<string> {
  const [summary, bundle] = await Promise.all([
    getPackageCreditSummary(businessId),
    getWellnessReportsBundle(businessId),
  ]);
  const lines = [
    "section,metric,value",
    `packages,sold_sessions,${summary.creditsSold}`,
    `packages,redeemed_sessions,${summary.creditsRedeemed}`,
    `packages,remaining_liability_sessions,${summary.creditsRemaining}`,
    `packages,active_packages,${summary.activePackages}`,
    `week,confirmed_bookings,${bundle.livInterventions.confirmed}`,
    `week,pending_bookings,${bundle.livInterventions.pending}`,
    `deposits,held_minor,${bundle.depositEscrow?.heldMinor ?? 0}`,
    `deposits,captured_minor,${bundle.depositEscrow?.capturedMinor ?? 0}`,
    `stress,tomorrow_score,${bundle.tomorrowStress.score}`,
  ];
  return lines.join("\n");
}
