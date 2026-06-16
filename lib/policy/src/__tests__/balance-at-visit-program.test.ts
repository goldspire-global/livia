import assert from "node:assert/strict";
import test from "node:test";
import {
  computeBalanceDueFromBooking,
  resolveTotalPaidMinor,
  serviceDepositPercentHint,
} from "../balance-at-visit-program";

test("resolveTotalPaidMinor uses max of deposit and total", () => {
  assert.equal(resolveTotalPaidMinor({ depositPaidEurCents: 2000, totalPaidEurCents: 5000 }), 5000);
  assert.equal(resolveTotalPaidMinor({ depositPaidEurCents: 5000, totalPaidEurCents: 2000 }), 5000);
});

test("computeBalanceDueFromBooking subtracts paid from price", () => {
  assert.equal(
    computeBalanceDueFromBooking({
      priceMinor: 10000,
      depositPaidEurCents: 3000,
      totalPaidEurCents: 3000,
    }),
    7000,
  );
  assert.equal(
    computeBalanceDueFromBooking({
      priceMinor: 10000,
      depositPaidEurCents: 3000,
      totalPaidEurCents: 10000,
    }),
    0,
  );
});

test("serviceDepositPercentHint returns null when default applies", () => {
  assert.equal(
    serviceDepositPercentHint({
      operational: { depositRequired: true, depositPercent: 30 },
      service: { category: "Hair", name: "Cut" },
    }),
    null,
  );
});
