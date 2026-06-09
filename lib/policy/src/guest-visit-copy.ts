/**
 * Guest visit surfaces — deposit truth + reminder prep (policy hub).
 */
import type { BusinessVertical } from "./types";
import { resolveVerticalKey } from "./vocabulary";
import { guestPublicVisitPrep } from "./guest-public-experience";

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
}): GuestVisitDepositLine | null {
  const paid = args.depositPaidEurCents ?? 0;
  const status = (args.status ?? "").toUpperCase();
  const currency = args.currency ?? "EUR";
  const vertical = resolveVerticalKey(args.vertical, null);

  if (paid > 0) {
    return {
      label: `Deposit paid — ${formatMoneyMinor(paid, currency)} held for this visit`,
      tone: "paid",
    };
  }

  const awaitingDeposit =
    args.pendingReason === "awaiting_deposit" ||
    (status === "PENDING" &&
      (vertical === "body-art" || vertical === "medspa" || vertical === "wellness"));

  if (awaitingDeposit) {
    const due =
      args.priceMinor && args.priceMinor > 0
        ? formatMoneyMinor(Math.round(args.priceMinor * 0.2), currency)
        : "your deposit";
    return {
      label: `Deposit due — complete the pay link we sent to hold your slot (${due})`,
      tone: "due",
    };
  }

  if (status === "CONFIRMED" && (vertical === "body-art" || vertical === "medspa")) {
    return {
      label: "Your slot is held — no deposit outstanding",
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
