export type LivProposalDedupeInput = {
  action: string;
  resourceKind?: string | null;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
};

/** One visible row per logical approval — stops 50× "Turn on deposits" spam. */
export function livProposalDedupeKey(p: LivProposalDedupeInput): string {
  if (p.action === "collect_deposit") return "collect_deposit";
  const title = typeof p.metadata?.title === "string" ? p.metadata.title.trim() : "";
  if (title) return `${p.action}:${title}`;
  const signalId = typeof p.metadata?.signalId === "string" ? p.metadata.signalId : "";
  if (signalId) return `${p.action}:${signalId}`;
  if (p.resourceKind && p.resourceId) return `${p.action}:${p.resourceKind}:${p.resourceId}`;
  return `${p.action}:generic`;
}

export function dedupeLivProposalsForDisplay<T extends LivProposalDedupeInput>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const key = livProposalDedupeKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

/** Parse post-approval navigation from Liv proposal execution effects. */
export function extractLivProposalNavigateHref(effects: string[] | undefined): string | null {
  if (!effects?.length) return null;
  for (const effect of effects) {
    if (effect.startsWith("commerce:open_billing:")) {
      return effect.slice("commerce:open_billing:".length) || "/settings?tab=billing";
    }
  }
  return null;
}

export function livProposalDisplayTitle(args: {
  action: string;
  outcomePreview?: string | null;
  metadata?: Record<string, unknown> | null;
}): string {
  const meta = args.metadata;
  const title = typeof meta?.title === "string" ? meta.title.trim() : "";
  if (title) return title;
  if (args.outcomePreview?.trim()) return args.outcomePreview.trim();
  const customer =
    typeof meta?.customerName === "string" ? meta.customerName.trim() : "";
  const hints: Record<string, string> = {
    reply_inbox: "Inbox reply",
    book_slot: "New booking",
    reschedule: "Reschedule",
    cancel_booking: "Cancellation",
    collect_deposit: "Deposits & billing",
    process_refund: "Refund",
    send_reminder: "Reminder",
    approve_design_proof: "Design proof",
  };
  const hint = hints[args.action];
  if (hint && customer) return `${hint} · ${customer}`;
  return args.action.replace(/_/g, " ");
}
