/** Liv command / inbox prompts for owners and managers (ops mode). */
export function ownerOpsLivSuggestions(args: {
  hasCommerceActSignal?: boolean;
  capabilityBlockers?: number;
  pendingCount?: number;
}): string[] {
  const out: string[] = [];
  if ((args.pendingCount ?? 0) > 0) {
    out.push("What should I confirm first on today's calendar?");
  }
  if (args.hasCommerceActSignal) {
    out.push("Why is payment capture low and what should I fix in billing?");
    out.push("Summarize commerce signals for the last 30 days.");
  }
  if ((args.capabilityBlockers ?? 0) > 0) {
    out.push("Which capability blocker should I fix next to go live?");
  }
  out.push("Read my Business Twin and give me one priority for today.");
  return out.slice(0, 4);
}
