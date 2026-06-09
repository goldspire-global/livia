/**
 * Fitness PAR-Q gate — required on first book (Innovation P0).
 */

export type FitnessParqGateResult =
  | { ok: true }
  | { ok: false; code: "parq_required"; message: string };

export function fitnessParqRequired(isFirstBooking: boolean): boolean {
  return isFirstBooking;
}

export function validateFitnessParqGate(args: {
  isFirstBooking: boolean;
  guardAnswers?: Record<string, string>;
}): FitnessParqGateResult {
  if (!fitnessParqRequired(args.isFirstBooking)) return { ok: true };

  const attestation = args.guardAnswers?.parq_cleared?.trim();
  if (attestation === "yes_cleared" || attestation === "need_review") {
    return { ok: true };
  }

  return {
    ok: false,
    code: "parq_required",
    message:
      "Please complete the physical activity readiness question before your first session.",
  };
}
