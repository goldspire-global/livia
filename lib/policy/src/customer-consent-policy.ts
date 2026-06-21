/** GDPR consent ledger helpers — customers.consent jsonb. */

export type CustomerConsentLedger = {
  marketing?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
  voiceRecording?: boolean;
  aiAgentInteraction?: boolean;
  updatedAt?: string;
  basis?: string;
};

export function parseCustomerConsent(raw: unknown): CustomerConsentLedger {
  if (!raw || typeof raw !== "object") return {};
  return raw as CustomerConsentLedger;
}

/** Marketing / rebook SMS requires explicit sms consent when ledger is present. */
export function customerAllowsMarketingSms(consent: unknown): boolean {
  const c = parseCustomerConsent(consent);
  if (c.sms === false || c.marketing === false) return false;
  if (c.sms === true || c.marketing === true) return true;
  return true;
}
