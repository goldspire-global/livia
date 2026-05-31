import assert from "node:assert/strict";
import test from "node:test";
import { computeDepositDueMinor } from "../guest-deposit-pay.service.ts";

test("computeDepositDueMinor returns zero when deposit not required", () => {
  assert.equal(
    computeDepositDueMinor({
      priceMinor: 10_000,
      depositPercent: 30,
      depositRequired: false,
      depositPaidMinor: 0,
    }),
    0,
  );
});

test("computeDepositDueMinor subtracts amount already paid", () => {
  assert.equal(
    computeDepositDueMinor({
      priceMinor: 10_000,
      depositPercent: 30,
      depositRequired: true,
      depositPaidMinor: 2_000,
    }),
    1_000,
  );
});

test("computeDepositDueMinor never returns negative", () => {
  assert.equal(
    computeDepositDueMinor({
      priceMinor: 5_000,
      depositPercent: 20,
      depositRequired: true,
      depositPaidMinor: 5_000,
    }),
    0,
  );
});
