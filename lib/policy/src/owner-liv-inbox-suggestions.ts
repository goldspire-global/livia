/** Owner/manager Liv prompts when inbox queue is clear but commerce or setup needs attention. */
export function ownerLivInboxSuggestions(args: {
  hasCommerceActSignal?: boolean;
  capabilityBlockers?: number;
  pendingCount?: number;
  handedOffCount?: number;
}): string[] {
  const pending = Math.max(0, args.pendingCount ?? 0);
  const handed = Math.max(0, args.handedOffCount ?? 0);
  if (pending > 0 || handed > 0) return [];

  const out: string[] = [];
  if (args.hasCommerceActSignal) {
    out.push("Summarize commerce signals and what I should fix in billing today.");
    out.push("Why is payment capture low — walk me through deposits step by step.");
  }
  if ((args.capabilityBlockers ?? 0) > 0) {
    out.push("Which capability blocker should I clear next to go live?");
  }
  out.push("Read owner intelligence and give me one priority besides inbox.");
  return out.slice(0, 3);
}
