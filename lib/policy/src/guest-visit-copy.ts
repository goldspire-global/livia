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
  return null;
}
