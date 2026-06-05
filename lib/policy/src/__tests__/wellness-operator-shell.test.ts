import assert from "node:assert/strict";
import {
  resolveWellnessOperatorCssPreset,
  WELLNESS_OPERATOR_DEFAULT_CSS_PRESET,
} from "../wellness-operator-shell";

assert.equal(resolveWellnessOperatorCssPreset(null), WELLNESS_OPERATOR_DEFAULT_CSS_PRESET);
assert.equal(resolveWellnessOperatorCssPreset("platform-default"), WELLNESS_OPERATOR_DEFAULT_CSS_PRESET);
assert.equal(resolveWellnessOperatorCssPreset("session-rail"), "session-rail");
assert.equal(resolveWellnessOperatorCssPreset("evening-ledger"), "evening-ledger");

console.log("wellness-operator-shell.test.ts: ok");
