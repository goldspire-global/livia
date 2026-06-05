import { staffLivInboxSuggestions } from "@workspace/policy";

export function inboxLivSuggestions(
  vertical?: string | null,
  category?: string | null,
  mode: "open" | "handoff" = "open",
): readonly string[] {
  return staffLivInboxSuggestions(vertical, category, mode);
}

/** @deprecated Use `inboxLivSuggestions(vertical, category, mode)` */
export const STAFF_LIV_INBOX_SUGGESTIONS = staffLivInboxSuggestions(null, null, "open");
export const STAFF_LIV_HANDOFF_SUGGESTIONS = staffLivInboxSuggestions(null, null, "handoff");
