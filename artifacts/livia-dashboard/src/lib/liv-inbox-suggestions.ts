/**
 * Legacy exports — prefer `staffLivInboxSuggestions` from `@workspace/policy`.
 * @deprecated
 */
import { staffLivInboxSuggestions } from "@workspace/policy";

export const STAFF_LIV_INBOX_SUGGESTIONS = staffLivInboxSuggestions(null, null, "open");
export const STAFF_LIV_HANDOFF_SUGGESTIONS = staffLivInboxSuggestions(null, null, "handoff");
