import assert from "node:assert/strict";
import {
  buildBusinessActivationSnapshot,
  computeTimeToFirstBookingMs,
  formatActivationDuration,
  resolveActivationStatus,
} from "../activation-metrics";
import { initialOnboardingState } from "../onboarding-state";

assert.equal(computeTimeToFirstBookingMs("2026-01-01T10:00:00.000Z", "2026-01-01T11:30:00.000Z"), 5_400_000);
assert.equal(formatActivationDuration(90_000), "2 min");
assert.equal(formatActivationDuration(3_600_000), "1 hr");

assert.equal(resolveActivationStatus({ sacredMetricMet: true, activationStepsComplete: 1 }), "activated");
assert.equal(resolveActivationStatus({ sacredMetricMet: false, activationStepsComplete: 2 }), "in_progress");
assert.equal(resolveActivationStatus({ sacredMetricMet: false, activationStepsComplete: 0 }), "not_started");

const activated = buildBusinessActivationSnapshot({
  businessCreatedAt: "2026-01-01T10:00:00.000Z",
  onboardingState: {
    ...initialOnboardingState(),
    checklist: {
      ...initialOnboardingState().checklist!,
      testBooking: true,
      firstBookingAt: "2026-01-01T10:45:00.000Z",
      firstBookingId: "bk_1",
      activationSource: "public",
    },
  },
  vertical: "beauty",
});

assert.equal(activated.sacredMetricMet, true);
assert.equal(activated.status, "activated");
assert.equal(activated.timeToFirstBookingLabel, "45 min");
assert.equal(activated.activationSource, "public");

console.log("activation-metrics.test.ts OK");
