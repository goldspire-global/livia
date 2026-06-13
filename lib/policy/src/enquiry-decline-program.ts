/**
 * Operator decline reasons — templated reply with inline reason sentence.
 */
export type EnquiryDeclineReasonId =
  | "calendar_full"
  | "scope_mismatch"
  | "capacity"
  | "budget"
  | "location"
  | "timing"
  | "other";

export type EnquiryDeclineReason = {
  id: EnquiryDeclineReasonId;
  label: string;
  /** Flows as a full sentence inside the decline email / WhatsApp body. */
  reasonSentence: string;
};

export const ENQUIRY_DECLINE_REASONS: EnquiryDeclineReason[] = [
  {
    id: "calendar_full",
    label: "Calendar full",
    reasonSentence:
      "We're fully booked for that date and can't take on another celebration then.",
  },
  {
    id: "scope_mismatch",
    label: "Outside our scope",
    reasonSentence: "This one's outside the styling scope we specialise in.",
  },
  {
    id: "capacity",
    label: "Guest count / capacity",
    reasonSentence: "The guest count is more than we can staff and deliver well for on one day.",
  },
  {
    id: "budget",
    label: "Budget doesn't fit",
    reasonSentence: "The budget guide doesn't align with what we need to deliver this properly.",
  },
  {
    id: "location",
    label: "Location / travel",
    reasonSentence: "The venue or travel distance isn't workable for us on this date.",
  },
  {
    id: "timing",
    label: "Lead time too short",
    reasonSentence: "There isn't enough lead time to plan, source, and set up to our standard.",
  },
  {
    id: "other",
    label: "Other",
    reasonSentence:
      "After reviewing the details, we're not able to take this enquiry forward right now.",
  },
];

export function enquiryDeclineReason(id: EnquiryDeclineReasonId): EnquiryDeclineReason {
  return ENQUIRY_DECLINE_REASONS.find((r) => r.id === id) ?? ENQUIRY_DECLINE_REASONS.at(-1)!;
}

function applyDeclineTemplate(
  template: string,
  args: { firstName: string; businessName: string; reasonSentence: string },
): string {
  return template
    .replaceAll("{{firstName}}", args.firstName)
    .replaceAll("{{businessName}}", args.businessName)
    .replaceAll("{{reasonSentence}}", args.reasonSentence);
}

/** Default template uses {{reasonSentence}} inline — operators override via decline_reply. */
export const DEFAULT_ENQUIRY_DECLINE_WITH_REASON = `Hi {{firstName}},

Thank you for reaching out to {{businessName}}. {{reasonSentence}}

We hope your celebration goes wonderfully, and we'd love to hear from you again for a future event.

Warmly,
{{businessName}}`;

export function resolveEnquiryDeclineCopy(args: {
  contactName: string;
  businessName: string;
  reasonId?: EnquiryDeclineReasonId | null;
  operatorTemplate?: string | null;
}): { subject: string; body: string; whatsappText: string; reasonId: EnquiryDeclineReasonId } {
  const reasonId = args.reasonId ?? "other";
  const reason = enquiryDeclineReason(reasonId);
  const firstName = args.contactName.trim().split(/\s+/)[0] ?? "there";
  const rawTemplate = args.operatorTemplate?.trim();
  const template =
    rawTemplate && rawTemplate.includes("{{reasonSentence}}")
      ? rawTemplate
      : rawTemplate
        ? rawTemplate.replace(
            /our calendar and styling scope won't be the right fit this time\./i,
            "{{reasonSentence}}",
          )
        : DEFAULT_ENQUIRY_DECLINE_WITH_REASON;

  const body = applyDeclineTemplate(template, {
    firstName,
    businessName: args.businessName,
    reasonSentence: reason.reasonSentence,
  });
  const subject = `Update on your enquiry — ${args.businessName}`;
  const whatsappText = body.replace(/\n\n/g, "\n").trim();
  return { subject, body, whatsappText, reasonId };
}

/** Back-compat — decline_reply overrides without reason placeholder get reason appended. */
export function resolveLegacyDeclineCopy(args: {
  contactName: string;
  businessName: string;
  operatorTemplate?: string | null;
}): { subject: string; body: string; whatsappText: string } {
  const { reasonId: _, ...rest } = resolveEnquiryDeclineCopy({
    ...args,
    reasonId: "other",
  });
  void _;
  if (args.operatorTemplate?.trim() && !args.operatorTemplate.includes("{{reasonSentence}}")) {
    const firstName = args.contactName.trim().split(/\s+/)[0] ?? "there";
    const body = args.operatorTemplate
      .replaceAll("{{firstName}}", firstName)
      .replaceAll("{{businessName}}", args.businessName);
    return {
      subject: `Update on your enquiry — ${args.businessName}`,
      body,
      whatsappText: body.replace(/\n\n/g, "\n").trim(),
    };
  }
  return rest;
}
