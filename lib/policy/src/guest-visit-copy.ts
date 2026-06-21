/**
 * Guest visit surfaces — deposit truth + reminder prep (policy hub).
 */
import type { BusinessVertical } from "./types";
import { resolveVerticalKey } from "./vocabulary";
import { guestPublicVisitPrep } from "./guest-public-experience";
import { guestBalanceAtVisitLine } from "./policy-evolution-program";

export type GuestVisitDepositLine = {
  label: string;
  tone: "paid" | "due" | "hold" | "none";
};

function formatMoneyMinor(minor: number, currency = "EUR"): string {
  const amount = minor / 100;
  try {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}

/** Deposit truth line for token visit + `/my` manage visit (Innovation P0). */
export function guestVisitDepositLine(args: {
  vertical?: string | null;
  status: string;
  depositPaidEurCents?: number;
  priceMinor?: number;
  currency?: string;
  pendingReason?: string | null;
  depositDueMinor?: number;
  depositPercent?: number;
}): GuestVisitDepositLine | null {
  const paid = args.depositPaidEurCents ?? 0;
  const status = (args.status ?? "").toUpperCase();
  const currency = args.currency ?? "EUR";

  if (paid > 0) {
    const balanceLine = guestBalanceAtVisitLine({
      priceMinor: args.priceMinor ?? 0,
      depositPaidMinor: paid,
      currency,
    });
    return {
      label: balanceLine
        ? `Deposit paid — ${formatMoneyMinor(paid, currency)}. ${balanceLine}`
        : `Deposit paid — ${formatMoneyMinor(paid, currency)}. Your slot is locked.`,
      tone: "paid",
    };
  }

  if (args.pendingReason === "awaiting_deposit" || status === "PENDING") {
    const dueMinor =
      args.depositDueMinor ??
      (args.priceMinor && args.depositPercent
        ? Math.round((args.priceMinor * args.depositPercent) / 100)
        : 0);
    if (dueMinor > 0) {
      return {
        label: `Pay ${formatMoneyMinor(dueMinor, currency)} to hold your slot — Liv confirms automatically when payment clears.`,
        tone: "due",
      };
    }
    if (args.pendingReason === "awaiting_deposit") {
      return {
        label: "Complete the pay link we sent — Liv confirms your slot when payment clears.",
        tone: "due",
      };
    }
  }

  if (status === "CONFIRMED") {
    return {
      label: "Your slot is confirmed — see you soon.",
      tone: "hold",
    };
  }

  return null;
}

/** T-24h reminder prep snippet — first line from vertical visit prep. */
export function guestVisitReminderPrepSnippet(vertical?: string | null): string | null {
  const prep = guestPublicVisitPrep(vertical, null);
  return prep[0] ?? null;
}

/** Allied-health / medspa SMS prep body (Innovation P0). */
export function guestVerticalPrepSmsBody(
  vertical: string | null | undefined,
  businessName: string,
): string | null {
  const key = resolveVerticalKey(vertical, null) as BusinessVertical;
  if (key === "allied-health") {
    return `${businessName}: tomorrow's session — wear comfortable clothes, bring any referral letter, and arrive 5 minutes early. Reply on your visit link if plans change.`;
  }
  if (key === "medspa") {
    return `${businessName}: before your treatment — avoid alcohol and blood thinners unless your clinician advised otherwise. Complete any intake forms on your visit link.`;
  }
  if (key === "wellness") {
    const line = guestPublicVisitPrep("wellness", null)[0];
    return line ? `${businessName}: ${line}` : null;
  }
  if (key === "hair") {
    return `${businessName}: tomorrow's appointment — arrive with clean dry hair. Reply on your visit link if you need to reschedule.`;
  }
  if (key === "beauty") {
    return `${businessName}: reminder for tomorrow — arrive makeup-free for lash/brow services. Your visit link has prep details.`;
  }
  if (key === "fitness") {
    return `${businessName}: class tomorrow — arrive 10 minutes early. Hydrate and bring a towel. Visit link for changes.`;
  }
  if (key === "pet-grooming") {
    return `${businessName}: groom tomorrow — ensure your pet has had a toilet break before drop-off. Visit link for details.`;
  }
  if (key === "automotive-detailing") {
    return `${businessName}: detail tomorrow — please remove personal items from the vehicle. Visit link for drop-off notes.`;
  }
  if (key === "body-art") {
    return `${businessName}: session tomorrow — eat well, stay hydrated, and avoid alcohol. Visit link for aftercare prep.`;
  }
  if (key === "event-vendors") {
    return `${businessName}: your event date is approaching — confirm setup access times on your visit link.`;
  }
  return `${businessName}: reminder — your appointment is tomorrow. Open your visit link for details or to reschedule.`;
}

/** T-24h appointment reminder SMS (all verticals). */
export function guestVerticalReminderSmsBody(
  vertical: string | null | undefined,
  businessName: string,
  startLabel: string,
): string {
  const prep = guestVerticalPrepSmsBody(vertical, businessName);
  if (prep) return prep;
  return `${businessName}: see you ${startLabel}. Open your visit link for details.`;
}
