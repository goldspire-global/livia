#!/usr/bin/env node
/**
 * Mobile parity audit — verifies P2 gaps from WEB-MOBILE-PARITY.md have code hooks.
 *
 *   pnpm mobile:parity-audit
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const checks = [
  {
    id: "mobile-settings-logo",
    label: "Mobile settings logo URL field",
    pass: () => readFileSync(join(root, "artifacts/livia-mobile/app/settings.tsx"), "utf8").includes("logoUrl"),
  },
  {
    id: "mobile-presentation-card",
    label: "Mobile presentation preset card",
    pass: () => existsSync(join(root, "artifacts/livia-mobile/components/MobilePresentationCard.tsx")),
  },
  {
    id: "mobile-tenant-experience",
    label: "Mobile tenant experience fetch",
    pass: () => existsSync(join(root, "artifacts/livia-mobile/lib/tenant-experience.ts")),
  },
  {
    id: "web-mobile-parity-doc",
    label: "WEB-MOBILE-PARITY.md present",
    pass: () => existsSync(join(root, "docs/product/WEB-MOBILE-PARITY.md")),
  },
];

console.log("\n══ Mobile parity audit (R3 Wave 2) ══\n");

let ok = true;
for (const c of checks) {
  const pass = c.pass();
  console.log(`${pass ? "✓" : "✗"} ${c.label}`);
  ok = pass && ok;
}

console.log(ok ? "\n✅ mobile parity audit passed\n" : "\n❌ mobile parity audit failed\n");
process.exit(ok ? 0 : 1);
