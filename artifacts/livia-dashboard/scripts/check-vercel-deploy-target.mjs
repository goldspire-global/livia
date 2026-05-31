#!/usr/bin/env node
/**
 * Fails CI/Vercel build when staging project env does not match project name.
 * Run via prebuild on dashboard.
 */
const project = (process.env.VERCEL_PROJECT_NAME ?? "").toLowerCase();
const deployEnv = (process.env.VITE_LIVIA_DEPLOY_ENV ?? "").trim().toLowerCase();
const root = (process.env.VERCEL_PROJECT_SETTINGS_ROOT_DIRECTORY ?? "").replace(/\\/g, "/");

if (process.env.VERCEL !== "1") {
  process.exit(0);
}

const looksStagingProject = /stg|staging/.test(project);
const looksProdProject = /livia-app|livia-dashboard|livia-hq/.test(project) && !looksStagingProject;

if (looksStagingProject) {
  if (deployEnv !== "staging") {
    console.error(
      "\n✗ Staging Vercel project requires VITE_LIVIA_DEPLOY_ENV=staging (Production + Preview envs).\n" +
        `  Project: ${process.env.VERCEL_PROJECT_NAME}\n` +
        "  See docs/operations/VERCEL-DEPLOY-ENVIRONMENTS.md\n",
    );
    process.exit(1);
  }
  if (root && !root.includes("livia-dashboard")) {
    console.error(
      "\n✗ Staging project Root Directory must be artifacts/livia-dashboard (not repo root).\n" +
        `  Current: ${root}\n` +
        "  Repo-root vercel.json proxies /api to PRODUCTION api.livia-hq.com.\n",
    );
    process.exit(1);
  }
}

if (looksProdProject && deployEnv === "staging") {
  console.error(
    "\n✗ Production Vercel project must not set VITE_LIVIA_DEPLOY_ENV=staging.\n",
  );
  process.exit(1);
}

console.log(`✓ Vercel deploy target OK (${process.env.VERCEL_PROJECT_NAME ?? "unknown"})`);
