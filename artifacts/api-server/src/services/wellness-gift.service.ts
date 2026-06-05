import {
  WELLNESS_GIFT_PACKAGE_PRESETS,
  wellnessGiftConfirmLines,
} from "@workspace/policy";
import { findOrCreateCustomer } from "./customers.service";
import { grantPackageCredits } from "./package-credits.service";
import { randomBytes } from "node:crypto";

const GIFT_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeGiftCode(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += GIFT_ALPHABET[bytes[i]! % GIFT_ALPHABET.length];
  }
  return out;
}

export async function purchaseWellnessGiftPackage(
  businessId: string,
  input: {
    presetId: string;
    purchaser: {
      firstName: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };
    recipient: {
      firstName: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };
  },
) {
  const preset = WELLNESS_GIFT_PACKAGE_PRESETS.find((p) => p.id === input.presetId);
  if (!preset) throw new Error("INVALID_PRESET");

  const purchaser = await findOrCreateCustomer(businessId, {
    firstName: input.purchaser.firstName,
    lastName: input.purchaser.lastName,
    email: input.purchaser.email,
    phone: input.purchaser.phone,
  });

  const recipient = await findOrCreateCustomer(businessId, {
    firstName: input.recipient.firstName,
    lastName: input.recipient.lastName,
    email: input.recipient.email,
    phone: input.recipient.phone,
  });

  const code = makeGiftCode();
  const expiresAt =
    preset.expiresInDays != null
      ? new Date(Date.now() + preset.expiresInDays * 86400000).toISOString()
      : undefined;

  const ledger = await grantPackageCredits(businessId, {
    customerId: recipient.id,
    packageName: `${preset.label} (gift)`,
    creditsTotal: preset.creditsTotal,
    expiresAt,
    redemptionCode: code,
    giftedByCustomerId: purchaser.id,
  });

  return {
    ledgerId: ledger.id,
    redemptionCode: code,
    recipientCustomerId: recipient.id,
    creditsTotal: preset.creditsTotal,
    packageLabel: preset.label,
    confirmLines: wellnessGiftConfirmLines(input.recipient.firstName, code),
    myLiviaPath: "/my",
  };
}
