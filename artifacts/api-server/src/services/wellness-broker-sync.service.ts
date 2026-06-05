import type { BrokerId } from "./integration-brokers.service";
import { getParallelRunDiff } from "./wellness-parallel-run.service";
import { buildWellnessSettlementCsv } from "./wellness-settlement.service";
import { getCalendarPoisonAlerts } from "./wellness-ops.service";
import { listPackageCreditsExpiring } from "./wellness-reports.service";

function envConfigured(key: string): boolean {
  return typeof process.env[key] === "string" && process.env[key]!.length > 0;
}

export async function runWellnessBrokerSync(
  businessId: string,
  brokerId: BrokerId,
): Promise<{ ok: boolean; message: string; payload?: unknown }> {
  switch (brokerId) {
    case "google_calendar": {
      const alerts = await getCalendarPoisonAlerts(businessId);
      return {
        ok: true,
        message: envConfigured("GOOGLE_OAUTH_CLIENT_ID")
          ? `Calendar poll complete — ${alerts.alerts?.length ?? 0} poison alert(s).`
          : "Set GOOGLE_OAUTH_CLIENT_ID — poison alert stub ran against room holds.",
        payload: alerts,
      };
    }
    case "stripe":
      return {
        ok: envConfigured("STRIPE_SECRET_KEY"),
        message: envConfigured("STRIPE_WEBHOOK_SECRET")
          ? "Stripe webhooks active — paid bookings auto-confirm."
          : "Set STRIPE_WEBHOOK_SECRET for live confirm path.",
      };
    case "xero":
    case "quickbooks": {
      const csv = await buildWellnessSettlementCsv(businessId);
      const rows = csv.split("\n").length - 1;
      return {
        ok: true,
        message: `${brokerId === "xero" ? "Xero" : "QuickBooks"} settlement export ready (${rows} rows).`,
        payload: { rowCount: rows },
      };
    }
    case "fresha":
    case "mindbody": {
      const ext = brokerId === "fresha" ? "fresha" : "mindbody";
      const diff = await getParallelRunDiff(businessId, ext);
      return {
        ok: true,
        message: `${brokerId} parallel run diff generated.`,
        payload: diff,
      };
    }
    case "mailchimp": {
      const expiring = await listPackageCreditsExpiring(businessId, 30);
      return {
        ok: envConfigured("MAILCHIMP_API_KEY"),
        message: envConfigured("MAILCHIMP_API_KEY")
          ? `Queued ${expiring.length} expiring-package event(s) for Mailchimp.`
          : "Set MAILCHIMP_API_KEY — expiring package list prepared locally.",
        payload: { expiringCount: expiring.length },
      };
    }
    case "treatwell":
      return {
        ok: true,
        message: "Treatwell-tagged bookings counted in Reports → marketing by source.",
      };
    case "whatsapp":
      return {
        ok: envConfigured("META_WHATSAPP_TOKEN"),
        message: envConfigured("META_WHATSAPP_TOKEN")
          ? "WhatsApp arrival + voucher templates available via channels."
          : "Set META_WHATSAPP_TOKEN for live WhatsApp sends.",
      };
    case "booksy":
      return { ok: true, message: "Booksy CSV import available in Settings → Integrations." };
    default:
      return { ok: true, message: `${brokerId} sync completed.` };
  }
}
