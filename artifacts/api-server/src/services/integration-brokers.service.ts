import { runWellnessBrokerSync } from "./wellness-broker-sync.service";

export type BrokerId =
  | "fresha"
  | "square"
  | "google_calendar"
  | "xero"
  | "quickbooks"
  | "vagaro"
  | "acuity"
  | "timely"
  | "mindbody"
  | "stripe"
  | "treatwell"
  | "mailchimp"
  | "whatsapp"
  | "booksy";

export type BrokerStatus = {
  id: BrokerId;
  label: string;
  mode: "csv_only" | "oauth_stub" | "read_only_api";
  connected: boolean;
  note: string;
};

function envConfigured(key: string): boolean {
  const v = process.env[key];
  return typeof v === "string" && v.length > 0;
}

export function listIntegrationBrokers(_businessId: string): BrokerStatus[] {
  return [
    {
      id: "fresha",
      label: "Fresha",
      mode: "read_only_api",
      connected: envConfigured("FRESHA_CLIENT_ID"),
      note: "OAuth broker stub — set FRESHA_CLIENT_ID for connect flow.",
    },
    {
      id: "square",
      label: "Square Appointments",
      mode: "read_only_api",
      connected: envConfigured("SQUARE_APPLICATION_ID"),
      note: "Read-only appointment import — set SQUARE_APPLICATION_ID.",
    },
    {
      id: "google_calendar",
      label: "Google Calendar",
      mode: "oauth_stub",
      connected: envConfigured("GOOGLE_OAUTH_CLIENT_ID"),
      note: "Two-way sync job lands after OAuth credentials are provisioned.",
    },
    {
      id: "xero",
      label: "Xero",
      mode: "csv_only",
      connected: envConfigured("XERO_CLIENT_ID"),
      note: envConfigured("XERO_CLIENT_ID")
        ? "OAuth configured — live sync when import job ships."
        : "Settlement CSV export available today; set XERO_CLIENT_ID for OAuth.",
    },
    {
      id: "quickbooks",
      label: "QuickBooks",
      mode: "csv_only",
      connected: envConfigured("QUICKBOOKS_CLIENT_ID"),
      note: envConfigured("QUICKBOOKS_CLIENT_ID")
        ? "OAuth configured — live sync when import job ships."
        : "Use weekly settlement export until QBO OAuth is configured.",
    },
    {
      id: "vagaro",
      label: "Vagaro",
      mode: "read_only_api",
      connected: envConfigured("VAGARO_API_KEY"),
      note: "v2 fitness/beauty import — UK + US salon long tail.",
    },
    {
      id: "acuity",
      label: "Acuity Scheduling",
      mode: "read_only_api",
      connected: envConfigured("ACUITY_USER_ID"),
      note: "Generic appointment import for wellness and solo pros.",
    },
    {
      id: "timely",
      label: "Timely",
      mode: "read_only_api",
      connected: envConfigured("TIMELY_API_TOKEN"),
      note: "UK/AU/NZ salon import path.",
    },
    {
      id: "mindbody",
      label: "Mindbody",
      mode: "csv_only",
      connected: envConfigured("MINDBODY_API_KEY"),
      note: envConfigured("MINDBODY_API_KEY")
        ? "API key set — parallel run diff available."
        : "Class + client CSV importer (v2 fitness wedge).",
    },
    {
      id: "stripe",
      label: "Stripe payments",
      mode: "read_only_api",
      connected: envConfigured("STRIPE_SECRET_KEY"),
      note: "Webhook confirms bookings when deposit clears — STRIPE_SECRET_KEY required.",
    },
    {
      id: "treatwell",
      label: "Treatwell",
      mode: "read_only_api",
      connected: false,
      note: "Marketplace bookings tagged on import — margin in Reports.",
    },
    {
      id: "mailchimp",
      label: "Mailchimp / Klaviyo",
      mode: "oauth_stub",
      connected: envConfigured("MAILCHIMP_API_KEY"),
      note: "Package expiring + 90d no-visit events when connected.",
    },
    {
      id: "whatsapp",
      label: "WhatsApp Business",
      mode: "read_only_api",
      connected: envConfigured("META_WHATSAPP_TOKEN"),
      note: "Arrival, intake, and voucher templates via channels.",
    },
    {
      id: "booksy",
      label: "Booksy",
      mode: "csv_only",
      connected: true,
      note: "CSV paste import in Settings → Integrations.",
    },
  ];
}

export async function triggerBrokerSyncJob(
  businessId: string,
  brokerId: BrokerId,
): Promise<{ ok: boolean; message: string; payload?: unknown }> {
  const brokers = listIntegrationBrokers(businessId);
  const b = brokers.find((x) => x.id === brokerId);
  if (!b) return { ok: false, message: "Unknown broker" };
  if (!b.connected && brokerId !== "booksy" && brokerId !== "treatwell") {
    return { ok: false, message: b.note };
  }
  return runWellnessBrokerSync(businessId, brokerId);
}
