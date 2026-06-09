import assert from "node:assert/strict";
import {
  guestVisitDepositLine,
  guestVerticalPrepSmsBody,
} from "../guest-visit-copy";

const paid = guestVisitDepositLine({
  vertical: "beauty",
  status: "CONFIRMED",
  depositPaidEurCents: 2000,
  currency: "EUR",
});
assert.ok(paid?.label.includes("Deposit paid"));
assert.equal(paid?.tone, "paid");

const due = guestVisitDepositLine({
  vertical: "medspa",
  status: "PENDING",
  pendingReason: "awaiting_deposit",
  priceMinor: 25000,
  currency: "EUR",
});
assert.ok(due?.label.includes("Deposit due"));
assert.equal(due?.tone, "due");

const alliedSms = guestVerticalPrepSmsBody("allied-health", "Motion Physio");
assert.ok(alliedSms?.includes("Motion Physio"));
assert.ok(alliedSms?.toLowerCase().includes("comfortable"));

console.log("guest-visit-copy.test.ts: ok");
