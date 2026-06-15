/**
 * Operator-facing UI copy — outcome and action only.
 * Never explain UI mechanics (collapse, hidden until, expand, same as PDF, opens when).
 * See event-vendor-quote-program operator copy rule.
 */

export function notificationsEmptySubtitle(): string {
  return "Bookings, inbox handoffs, and chain alerts appear here when action is needed.";
}

export function pendingApprovalsEmptyLine(): string {
  return "Nothing waiting for approval.";
}

export function pendingApprovalsEmptyHint(): string {
  return "Edge cases that need a human land here.";
}

export function unknownGuestInboxLabel(): string {
  return "Unknown guest";
}

export function unknownGuestInboxHint(): string {
  return "Links automatically once identified.";
}

export function livMemoryCorrectionSavedToast(): string {
  return "Correction saved — applied on the next reply.";
}

export function refundLinkedInboxBannerBody(): string {
  return "Refund requested — resolve in inbox, then close the case.";
}

export function bookingAftercareAutoSendLine(): string {
  return "Liv will send aftercare automatically — timing and channel come from guest care settings.";
}

export function bookingAftercareDraftHint(): string {
  return "Liv prepared aftercare — edit if needed, then send. Uses the guest's preferred channel.";
}

export function bookingAftercareDisabledHint(): string {
  return "Post-session follow-up is off. Turn it on in Settings → Guest care when you're ready.";
}

export function bookingAftercareManualOnlyHint(): string {
  return "Aftercare is manual-only — Liv does not auto-send. Copy from the guest thread when needed.";
}

export function inboxRefundResolvePrompt(): string {
  return "Refund request — reply below, then confirm refund and booking update.";
}

export function livMandateBlockedActionsLine(): string {
  return "Even at a high rung, blocked actions always need you — Liv refuses or proposes only.";
}

export function eventVendorLivCommandTitle(): string {
  return "Liv — your quote assistant";
}

export function eventPrepTimelineLoadingLine(): string {
  return "Loading event prep…";
}
