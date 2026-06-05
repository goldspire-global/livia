import {
  PENDING_REASON_CODES,
  pendingReasonLabel as pendingReasonLabelFromPolicy,
  resolvePendingReasonCode as resolvePendingReasonCodeFromPolicy,
  type PendingReasonCode,
} from "@workspace/policy";

/** Machine-readable reasons for PENDING bookings — surfaced in UI and Liv copy. */
export const PENDING_REASONS = PENDING_REASON_CODES;

export type PendingReason = (typeof PENDING_REASONS)[keyof typeof PENDING_REASONS];

export function pendingReasonLabel(
  reason: string | null | undefined,
  vertical?: string | null,
  category?: string | null,
): string {
  return pendingReasonLabelFromPolicy(reason, vertical, category);
}

export function derivePendingReason(args: {
  source?: string | null;
  aiCanBookDirectly: boolean;
  depositRequired: boolean;
  depositPaidEurCents: number;
  autoConfirmWhenNoDeposit?: boolean;
  customerTrusted?: boolean;
  bookingContinuityEnabled?: boolean;
  customerHasPhone?: boolean;
  customerHasEmail?: boolean;
}): PendingReason | null {
  if (args.customerTrusted && args.autoConfirmWhenNoDeposit !== false) {
    return null;
  }
  return resolvePendingReasonCodeFromPolicy({
    status: "PENDING",
    source: args.source,
    aiCanBookDirectly: args.aiCanBookDirectly,
    depositRequired: args.depositRequired,
    depositPaidEurCents: args.depositPaidEurCents,
    autoConfirmWhenNoDeposit: args.autoConfirmWhenNoDeposit,
    customerTrusted: args.customerTrusted,
    bookingContinuityEnabled: args.bookingContinuityEnabled,
    customerHasPhone: args.customerHasPhone,
    customerHasEmail: args.customerHasEmail,
  });
}

export function resolvePendingReasonForBooking(
  booking: {
    status: string;
    pendingReason?: string | null;
    source?: string | null;
    depositPaidEurCents?: number | null;
  },
  ctx: {
    aiCanBookDirectly: boolean;
    depositRequired: boolean;
    autoConfirmWhenNoDeposit?: boolean;
    bookingContinuityEnabled?: boolean;
    customerTrusted?: boolean;
    customerHasPhone?: boolean;
    customerHasEmail?: boolean;
  },
): PendingReasonCode | null {
  return resolvePendingReasonCodeFromPolicy({
    status: booking.status,
    pendingReason: booking.pendingReason,
    source: booking.source,
    depositPaidEurCents: booking.depositPaidEurCents ?? 0,
    ...ctx,
  });
}
