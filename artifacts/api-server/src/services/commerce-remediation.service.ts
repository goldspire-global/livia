import { buildCommerceRemediationTasks, type CommerceSignal } from "@workspace/policy";
import { createLivProposalIfNeeded } from "./liv-mandate.service";
import { logger } from "../lib/logger";

/** Materialize Liv proposals for act-level commerce remediation (deduped via mandate service). */
export async function syncCommerceRemediationProposals(
  businessId: string,
  signals: CommerceSignal[],
): Promise<number> {
  const tasks = buildCommerceRemediationTasks(signals).filter((t) => t.severity === "act");
  let created = 0;

  for (const task of tasks) {
    if (!task.proposalAction) continue;
    const result = await createLivProposalIfNeeded({
      businessId,
      action: task.proposalAction,
      resourceKind: "commerce_signal",
      resourceId: task.signalId,
      metadata: {
        signalId: task.signalId,
        href: task.href,
        title: task.title,
        body: task.body,
      },
    });
    if (result?.inserted && result.proposal) {
      created += 1;
      logger.info(
        { businessId, signalId: task.signalId, action: task.proposalAction },
        "commerce remediation proposal created",
      );
    }
  }

  return created;
}
