import { z } from "zod/v4";
import type { BusinessVertical } from "./types";
import { getCountryOverlay } from "./country-overlays";
import { guestCareAutomationSchema } from "./guest-care-automation-schema";
import { automationToggleSignalSchema } from "./automation-toggle-signals";
import { recommendedDepositPolicyForVertical } from "./booking-commitment-program";

/** Tenant-editable operational rules (stored on business.operational_policy jsonb). */
export const operationalPolicySchema = z.object({
  depositRequired: z.boolean().default(true),
  depositPercent: z.number().int().min(0).max(100).default(20),
  serviceBufferMinutes: z.number().int().min(0).max(120).default(0),
  cancelWindowHours: z.number().int().min(0).max(168).optional(),
  lateGraceMinutes: z.number().int().min(0).max(60).default(10),
  autoConfirmWhenNoDeposit: z.boolean().default(true),
  /** After web booking, open SMS/WA thread for pics and confirm (v3 continuity). */
  bookingContinuityEnabled: z.boolean().default(true),
  bookingContinuityMode: z
    .enum(["sms_thread", "whatsapp_thread", "email_only", "instagram_deep_link"])
    .default("sms_thread"),
  /** Owner-edited guest-facing booking terms — overrides computed jurisdiction block. */
  bookingTermsCustom: z.string().max(8000).optional(),
  /** Guest privacy notice shown on storefront and referenced by Liv. */
  privacyNoticeCustom: z.string().max(8000).optional(),
  /** House rules Liv follows — separate from free-form aiKnowledge on business row. */
  houseRulesCustom: z.string().max(8000).optional(),
  /** Post-session aftercare — see guest-care-automation.ts */
  guestCare: guestCareAutomationSchema.partial().optional(),
  /** Owner automation gate adoption — toggles persistently left off (product signal). */
  automationToggleSignals: z
    .record(z.string(), automationToggleSignalSchema)
    .optional(),
  /** Emergent trusted-client tier — enabled only after owner accepts Twin proposal. */
  emergentTrustProgram: z
    .object({
      enabled: z.boolean().default(false),
      acceptedAt: z.string().datetime().optional(),
      proposalKey: z.string().optional(),
    })
    .optional(),
});

export type OperationalPolicy = z.infer<typeof operationalPolicySchema>;

export const DEFAULT_OPERATIONAL_POLICY: OperationalPolicy = operationalPolicySchema.parse({});

/** Strip leading zeros and clamp 0–100 — used by API + dashboard deposit % inputs. */
export function normalizeDepositPercent(value: unknown): number {
  if (typeof value === "string") {
    const trimmed = value.trim().replace(/^0+(?=\d)/, "");
    if (trimmed === "") return 0;
    const n = parseInt(trimmed, 10);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.floor(value)));
  }
  return 0;
}

export function parseOperationalPolicy(raw: unknown): OperationalPolicy {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_OPERATIONAL_POLICY };
  const record = raw as Record<string, unknown>;
  const coerced =
    record.depositPercent !== undefined
      ? { ...record, depositPercent: normalizeDepositPercent(record.depositPercent) }
      : record;
  const parsed = operationalPolicySchema.safeParse(coerced);
  return parsed.success ? parsed.data : { ...DEFAULT_OPERATIONAL_POLICY };
}

export function mergeOperationalPolicy(
  partial: Partial<OperationalPolicy> | undefined,
  current: OperationalPolicy,
): OperationalPolicy {
  const next = { ...current, ...partial };
  if (partial?.depositPercent !== undefined) {
    next.depositPercent = normalizeDepositPercent(partial.depositPercent);
  }
  return operationalPolicySchema.parse(next);
}

/**
 * Whether a deposit must be collected before this booking can confirm.
 * V1: no per-client VIP waivers — policy-level only.
 */
export function depositAppliesForBooking(
  operational: Pick<OperationalPolicy, "depositRequired" | "depositPercent">,
): boolean {
  return operational.depositRequired && operational.depositPercent > 0;
}

/**
 * @deprecated use depositAppliesForBooking — inverted helper kept for call sites.
 */
export function customerExemptFromDeposit(args: {
  operational: Pick<OperationalPolicy, "depositRequired" | "depositPercent">;
}): boolean {
  return !depositAppliesForBooking(args.operational);
}

/** Owner-facing plain-language summary for Liv setup copilot. */
export function explainOperationalPolicySummary(args: {
  operational: OperationalPolicy;
  cancelWindowHours: number;
  depositPolicySummary: string;
}): { headline: string; bullets: string[] } {
  const { operational: op, cancelWindowHours, depositPolicySummary } = args;
  const bullets: string[] = [
    depositPolicySummary,
    `Free cancellation window: ${cancelWindowHours} hours before the appointment.`,
    `Late grace: ${op.lateGraceMinutes} minutes.`,
    "Liv tracks no-shows and visit patterns on each client — deposit trust rules will evolve from that signal.",
    op.bookingContinuityEnabled
      ? `Booking continuity: ${op.bookingContinuityMode.replace(/_/g, " ")}.`
      : "Booking continuity follow-up is off.",
    "Online bookings confirm automatically once the deposit is paid — Liv handles day-to-day holds.",
  ];
  return {
    headline: op.depositRequired
      ? `Deposits on — ${op.depositPercent}% for online bookings.`
      : "No deposit required for online bookings.",
    bullets,
  };
}

/** Diff helper for propose_policy_patch (read-only). */
export function diffOperationalPolicy(
  current: OperationalPolicy,
  proposed: OperationalPolicy,
): Array<{ field: string; from: string; to: string }> {
  const changes: Array<{ field: string; from: string; to: string }> = [];
  const keys = Object.keys(operationalPolicySchema.shape) as (keyof OperationalPolicy)[];
  for (const key of keys) {
    const a = current[key];
    const b = proposed[key];
    if (a !== b) {
      changes.push({ field: String(key), from: String(a), to: String(b) });
    }
  }
  return changes;
}

/**
 * Recommended initial operational policy defaults for a newly created tenant.
 * This does not override explicit tenant choices; it's used for seeding only.
 */
export function recommendedOperationalPolicyDefaults(args: {
  countryIso: string | null | undefined;
  vertical: BusinessVertical;
}): Partial<OperationalPolicy> {
  const overlay = getCountryOverlay({ countryIso: args.countryIso, vertical: args.vertical });
  const depositDefaults = recommendedDepositPolicyForVertical(args.vertical);
  return {
    bookingContinuityMode: overlay.continuityMode,
    lateGraceMinutes: overlay.defaultLateGraceMinutes,
    depositRequired: depositDefaults.depositRequired,
    depositPercent: depositDefaults.depositPercent,
  };
}
