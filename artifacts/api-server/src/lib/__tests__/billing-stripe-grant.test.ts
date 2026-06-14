import assert from "node:assert/strict";
import { billingMayGrantWithoutStripe, billingLocalGrantMode } from "../stripe";

const prev = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in prev)) delete process.env[key];
  }
  Object.assign(process.env, prev);
}

try {
  process.env.NODE_ENV = "development";
  delete process.env.LIVIA_DEPLOY_ENV;
  delete process.env.LIVIA_DEMO_ENABLED;
  assert.equal(billingMayGrantWithoutStripe(), true);
  assert.equal(billingLocalGrantMode(), "dev");

  process.env.NODE_ENV = "production";
  process.env.LIVIA_DEPLOY_ENV = "staging";
  process.env.LIVIA_DEMO_ENABLED = "true";
  assert.equal(billingMayGrantWithoutStripe(), true);
  assert.equal(billingLocalGrantMode(), "staging-demo");

  process.env.NODE_ENV = "production";
  delete process.env.LIVIA_DEPLOY_ENV;
  delete process.env.LIVIA_DEMO_ENABLED;
  assert.equal(billingMayGrantWithoutStripe(), false);
  assert.equal(billingLocalGrantMode(), null);

  process.env.LIVIA_DEMO_ENABLED = "true";
  process.env.LIVIA_DEMO_ALLOW_IN_PRODUCTION = "true";
  assert.equal(billingMayGrantWithoutStripe(), true);
  assert.equal(billingLocalGrantMode(), "demo-override");

  console.log("billing-stripe-grant.test.ts: ok");
} finally {
  restoreEnv();
}
