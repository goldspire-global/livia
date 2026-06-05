import {
  pendingReasonLabel as pendingReasonLabelFromPolicy,
  pendingApprovalGuidance as pendingApprovalGuidanceFromPolicy,
} from "@workspace/policy";

export function pendingReasonLabel(
  reason: string | null | undefined,
  vertical?: string | null,
  category?: string | null,
): string {
  return pendingReasonLabelFromPolicy(reason, vertical, category);
}

export function pendingApprovalGuidance(
  reason: string | null | undefined,
  vertical?: string | null,
  category?: string | null,
): string {
  return pendingApprovalGuidanceFromPolicy(reason, vertical, category);
}
