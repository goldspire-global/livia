import assert from "node:assert/strict";
import {
  ENQUIRY_DECLINE_REASONS,
  resolveEnquiryDeclineCopy,
} from "../enquiry-decline-program";

const calendar = resolveEnquiryDeclineCopy({
  contactName: "Sarah Murphy",
  businessName: "Atelier Decor",
  reasonId: "calendar_full",
});

assert.ok(calendar.body.includes("fully booked"));
assert.ok(!calendar.body.includes("{{reasonSentence}}"));

const scope = resolveEnquiryDeclineCopy({
  contactName: "Ayo Ola",
  businessName: "Atelier Decor",
  reasonId: "scope_mismatch",
});

assert.ok(scope.body.includes("outside the styling scope"));

assert.equal(ENQUIRY_DECLINE_REASONS.length, 7);

console.log("enquiry-decline-program.test.ts OK");
