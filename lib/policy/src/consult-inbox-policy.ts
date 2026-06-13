/**
 * Consult-first verticals — one inbox for structured leads + message threads.
 */
import type { BusinessVertical } from "./types";

export const UNIFIED_CONSULT_INBOX_VERTICALS = new Set<BusinessVertical>(["event-vendors"]);

export function isUnifiedConsultInboxVertical(vertical: string | null | undefined): boolean {
  return UNIFIED_CONSULT_INBOX_VERTICALS.has((vertical ?? "hair") as BusinessVertical);
}

/** Canonical route — leads and DMs live here (not a separate /enquiries nav). */
export function unifiedConsultInboxRoute(): string {
  return "/inbox";
}

export function consultInboxLeadHref(enquiryId: string): string {
  return `${unifiedConsultInboxRoute()}?lead=${encodeURIComponent(enquiryId)}`;
}

export function consultInboxThreadHref(conversationId: string): string {
  return `${unifiedConsultInboxRoute()}?conversation=${encodeURIComponent(conversationId)}`;
}

export function unifiedConsultInboxTitle(): string {
  return "Inbox";
}

export function unifiedConsultInboxSubtitle(): string {
  return "Website leads and DMs — review, reply, or move to the next stage.";
}

export function consultQuotesHref(quoteId: string): string {
  return `/quotes?id=${encodeURIComponent(quoteId)}`;
}

export function consultEnquiryStatusLabel(status: string): string {
  const step = CONSULT_ENQUIRY_PIPELINE_STEPS.find((s) => s.id === status);
  return step?.label ?? status;
}

export type ConsultInboxLens = "all" | "leads" | "messages";

export const CONSULT_INBOX_LENS_LABELS: Record<
  ConsultInboxLens,
  { short: string; description: string }
> = {
  all: { short: "All", description: "Every lead and DM thread." },
  leads: { short: "Leads", description: "Structured enquires from your website and forms." },
  messages: { short: "DMs", description: "WhatsApp, SMS, and web chat threads." },
};

/** Consult-first enquiry pipeline — mirrors real decor operator workflow. */
export const CONSULT_ENQUIRY_PIPELINE_STEPS = [
  { id: "new", label: "New", hint: "Just in — qualify and decide: quote or close." },
  { id: "quoted", label: "Quoted", hint: "Quote with client — follow up if quiet." },
  { id: "accepted", label: "Accepted", hint: "Client said yes — collect deposit." },
  { id: "booked", label: "Booked", hint: "Date secured — event-day prep." },
  { id: "lost", label: "Closed", hint: "Not proceeding — archived." },
] as const;

export type ConsultLeadActionId = "draft_quote" | "open_quote" | "decline" | "mark_booked";

export type ConsultLeadDecision = {
  /** Optional one-line hint — keep empty in inbox; stages live on Quotes. */
  hint?: string;
  primary: { action: ConsultLeadActionId; label: string };
  secondary?: { action: ConsultLeadActionId; label: string; destructive?: boolean };
};

/** Inbox actions only — qualify, issue quote (opens Quotes), or close. */
export function resolveConsultLeadDecision(
  status: string,
  opts?: { hasLinkedQuote?: boolean },
): ConsultLeadDecision | null {
  const hasQuote = opts?.hasLinkedQuote ?? false;

  switch (status) {
    case "new":
      return {
        primary: { action: "draft_quote", label: "Issue quote" },
        secondary: { action: "decline", label: "Decline", destructive: true },
      };
    case "quoted":
      return {
        hint: "Quote work lives on Quotes — follow up or send from there.",
        primary: {
          action: hasQuote ? "open_quote" : "draft_quote",
          label: hasQuote ? "Open quote" : "Issue quote",
        },
        secondary: { action: "decline", label: "Mark lost", destructive: true },
      };
    case "accepted":
      return {
        primary: { action: "open_quote", label: "Open quote" },
        secondary: { action: "mark_booked", label: "Mark booked" },
      };
    case "booked":
      return {
        primary: { action: "open_quote", label: "Open quote" },
      };
    case "lost":
      return null;
    default:
      return null;
  }
}
