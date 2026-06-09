import assert from "node:assert/strict";
import test from "node:test";
import { validateFitnessParqGate } from "../fitness-booking-rules";

test("validateFitnessParqGate skips repeat visitors", () => {
  assert.deepEqual(
    validateFitnessParqGate({ isFirstBooking: false, guardAnswers: {} }),
    { ok: true },
  );
});

test("validateFitnessParqGate requires attestation on first book", () => {
  const fail = validateFitnessParqGate({ isFirstBooking: true, guardAnswers: {} });
  assert.equal(fail.ok, false);
  if (!fail.ok) assert.equal(fail.code, "parq_required");

  assert.deepEqual(
    validateFitnessParqGate({
      isFirstBooking: true,
      guardAnswers: { parq_cleared: "yes_cleared" },
    }),
    { ok: true },
  );
  assert.deepEqual(
    validateFitnessParqGate({
      isFirstBooking: true,
      guardAnswers: { parq_cleared: "need_review" },
    }),
    { ok: true },
  );
});
