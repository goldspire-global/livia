import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPatchTestValid,
  serviceRequiresPatchTest,
  validateBeautyPatchTestGate,
  inferFillRecommendation,
  beautyRebookSmsBody,
} from "../beauty-booking-rules";

describe("beauty booking rules", () => {
  it("serviceRequiresPatchTest respects per-service flag and category", () => {
    assert.equal(
      serviceRequiresPatchTest({ requiresPatchTest: true, category: "Nails" }),
      true,
    );
    assert.equal(
      serviceRequiresPatchTest({ requiresPatchTest: false, category: "Lashes" }),
      true,
    );
    assert.equal(
      serviceRequiresPatchTest({ requiresPatchTest: false, category: "Nails" }),
      false,
    );
  });

  it("validateBeautyPatchTestGate accepts valid profile patch test", () => {
    const recent = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const gate = validateBeautyPatchTestGate({
      service: { requiresPatchTest: true, category: "Lashes" },
      customerPatchTestAt: recent,
    });
    assert.equal(gate.ok, true);
  });

  it("validateBeautyPatchTestGate accepts attestation yes", () => {
    const gate = validateBeautyPatchTestGate({
      service: { requiresPatchTest: true, category: "Lashes" },
      guardAnswers: { patch_test: "yes" },
    });
    assert.equal(gate.ok, true);
  });

  it("validateBeautyPatchTestGate blocks attestation no", () => {
    const gate = validateBeautyPatchTestGate({
      service: { requiresPatchTest: true, category: "Lashes" },
      guardAnswers: { patch_test: "no" },
    });
    assert.equal(gate.ok, false);
    if (!gate.ok) assert.equal(gate.code, "patch_test_attestation_no");
  });

  it("isPatchTestValid expires after window", () => {
    const old = new Date(Date.now() - 200 * 86_400_000).toISOString();
    assert.equal(isPatchTestValid(old), false);
  });

  it("inferFillRecommendation marks overdue fills", () => {
    const last = new Date(Date.now() - 22 * 86_400_000).toISOString();
    const rec = inferFillRecommendation({
      serviceKind: "fill",
      rebookIntervalDays: 14,
      lastVisitAt: last,
    });
    assert.equal(rec.dueForFill, true);
    assert.ok(rec.hint?.includes("due"));
  });

  it("beautyRebookSmsBody includes book url", () => {
    const body = beautyRebookSmsBody({
      businessName: "Bloom",
      serviceName: "Lash fill",
      bookUrl: "https://app.test/b/bloom?service=abc",
      daysOverdue: 3,
    });
    assert.match(body, /Bloom/);
    assert.match(body, /bloom\?service=abc/);
  });
});
