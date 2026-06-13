/**
 * Engagement exit notifications — PII-safe in-app + push (API layer).
 */
import {
  clientWithdrewNotificationCopy,
  depositPaidNotificationCopy,
  quoteAcceptedNotificationCopy,
  type EngagementExitActor,
} from "@workspace/policy";
import { deliverInAppNotification } from "./in-app-notifications.service";
import { notifyBusinessMembersPush } from "./push.service";

export async function notifyQuoteAccepted(businessId: string, quoteId: string, publicToken: string) {
  const copy = quoteAcceptedNotificationCopy(publicToken);
  await deliverInAppNotification({
    kind: "quote.accepted",
    businessId,
    title: copy.title,
    body: copy.body,
    priority: "act",
    resourceKind: "quote",
    resourceId: quoteId,
    dedupeKey: `quote.accepted:${quoteId}`,
    audience: "operators",
  });
}

export async function notifyQuoteDepositPaid(args: {
  businessId: string;
  quoteId: string;
  publicToken: string;
  amountMinor: number;
  currency: string;
  dateSecured: boolean;
}) {
  const copy = depositPaidNotificationCopy({
    publicToken: args.publicToken,
    amountMinor: args.amountMinor,
    currency: args.currency,
    dateSecured: args.dateSecured,
  });
  await deliverInAppNotification({
    kind: "quote.deposit_paid",
    businessId: args.businessId,
    title: copy.title,
    body: copy.body,
    priority: "act",
    resourceKind: "quote",
    resourceId: args.quoteId,
    dedupeKey: `quote.deposit_paid:${args.quoteId}:${args.amountMinor}`,
    audience: "operators",
  });
  await notifyBusinessMembersPush({
    businessId: args.businessId,
    title: copy.title,
    body: copy.body,
    data: { quoteId: args.quoteId, type: "quote_deposit_paid" },
  });
}

export async function notifyClientWithdrew(args: {
  businessId: string;
  quoteId: string;
  publicToken: string;
  depositPaidMinor: number;
  depositAmountMinor: number;
  initiatedBy: EngagementExitActor;
}) {
  const copy = clientWithdrewNotificationCopy({
    publicToken: args.publicToken,
    depositPaidMinor: args.depositPaidMinor,
    depositAmountMinor: args.depositAmountMinor,
    initiatedBy: args.initiatedBy,
  });
  await deliverInAppNotification({
    kind: "quote.client_withdrew",
    businessId: args.businessId,
    title: copy.title,
    body: copy.body,
    priority: "watch",
    resourceKind: "quote",
    resourceId: args.quoteId,
    dedupeKey: `quote.client_withdrew:${args.quoteId}`,
    audience: "operators",
  });
}
