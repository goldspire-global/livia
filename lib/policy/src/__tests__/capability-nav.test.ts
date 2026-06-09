import assert from "node:assert/strict";
import {
  filterNavItemsByCapabilities,
  filterMobileMenuItems,
  isMobileMenuRouteAllowedByCapabilities,
  isNavRouteAllowedByCapabilities,
  isWellnessNavHrefAllowed,
} from "../capability-nav";

const caps = [
  { id: "bookings", state: "active" as const },
  { id: "messaging", state: "installed" as const },
  { id: "memberships", state: "defined" as const },
];

assert.equal(isNavRouteAllowedByCapabilities("/dashboard", caps), true);
assert.equal(isNavRouteAllowedByCapabilities("/inbox", caps), true);
assert.equal(isNavRouteAllowedByCapabilities("/day-packages", caps), false);

assert.equal(
  isMobileMenuRouteAllowedByCapabilities("/staff/", [{ id: "bookings", state: "defined" }]),
  false,
);
assert.equal(
  isMobileMenuRouteAllowedByCapabilities("/staff/", [{ id: "bookings", state: "active" }]),
  true,
);

const mobileFiltered = filterMobileMenuItems(
  [
    { route: "/settings", label: "Settings" },
    { route: "/staff/", label: "Staff" },
    { route: "/day-packages", label: "Packages" },
  ],
  caps,
);
assert.equal(mobileFiltered.length, 2);
assert.ok(mobileFiltered.some((i) => i.route === "/settings"));

const filtered = filterNavItemsByCapabilities(
  [
    { href: "/dashboard", label: "Today" },
    { href: "/inbox", label: "Inbox" },
    { href: "/day-packages", label: "Packages" },
  ],
  caps,
);
assert.equal(filtered.length, 2);
assert.ok(filtered.some((i) => i.href === "/inbox"));

const wellnessReady = new Set(["wellness-reports"]);
assert.equal(isWellnessNavHrefAllowed("/wellness-reports", wellnessReady), true);
assert.equal(isWellnessNavHrefAllowed("/wellness-reports", new Set()), false);
assert.equal(isWellnessNavHrefAllowed("/dashboard", new Set()), true);

console.log("capability-nav.test.ts OK");
