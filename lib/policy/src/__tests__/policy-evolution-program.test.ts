import assert from "node:assert/strict";
import {
  computeBalanceDueMinor,
  ownerBalanceAtVisitLine,
  guestBalanceAtVisitLine,
  resolveDepositPercentForService,
  resolvePolicyEvolutionProposals,
  quoteDepositCreditMinor,
} from "../policy-evolution-program";
import { DEFAULT_OPERATIONAL_POLICY } from "../operational-policy";

const colourPct = resolveDepositPercentForService({
  operational: { ...DEFAULT_OPERATIONAL_POLICY, depositRequired: true, depositPercent: 20 },
  service: { category: "Colour", name: "Full colour" },
});
assert.equal(colourPct, 50, "colour services bump to 50%");

const balance = computeBalanceDueMinor({ priceMinor: 10000, depositPaidMinor: 2000 });
assert.equal(balance, 8000);

assert.ok(
  ownerBalanceAtVisitLine({
    priceMinor: 10000,
    depositPaidMinor: 2000,
    currency: "EUR",
    status: "CONFIRMED",
  })?.includes("Balance"),
);

assert.ok(
  guestBalanceAtVisitLine({ priceMinor: 10000, depositPaidMinor: 2000, currency: "EUR" })?.includes(
    "Balance",
  ),
);

const raiseProposal = resolvePolicyEvolutionProposals({
  operational: { ...DEFAULT_OPERATIONAL_POLICY, depositRequired: true, depositPercent: 20 },
  captureRatePercent: 45,
  paymentCount30d: 5,
  completedBookings: 10,
});
assert.ok(raiseProposal.some((p) => p.id === "raise_deposit_capture"));

assert.equal(quoteDepositCreditMinor({ quoteDepositPaidMinor: 5000, quoteSubtotalMinor: 20000 }), 5000);

console.log("policy-evolution-program.test.ts OK");
