import type { BrokerId } from "./wellness-integration-types";

/** Plain-English lines Liv uses when a broker is not connected. */
export function livBrokerHonestyLine(brokerId: BrokerId, connected: boolean): string | null {
  if (connected) return null;
  const lines: Partial<Record<BrokerId, string>> = {
    stripe: "Deposits may still be manual until Stripe webhooks are connected in Settings → Integrations.",
    google_calendar: "Therapist Google Calendars are not synced — room board is the schedule truth.",
    xero: "Package liability is in Livia; your accountant can export settlement CSV from Reports.",
    square: "Square appointments are not imported — parallel run diff is available after connect.",
    mindbody: "Mindbody is not linked — use parallel run report when switching systems.",
    fresha: "Fresha read-only import is not connected yet.",
  };
  return lines[brokerId] ?? null;
}
