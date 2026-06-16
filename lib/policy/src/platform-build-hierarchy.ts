/**
 * Platform build hierarchy — parent flows and children for cascade-complete delivery.
 * Agents: before marking a node done, complete all descendants or explicitly defer with reason.
 */
import type { BusinessVertical } from "./types";

export type BuildHierarchyStatus = "shipped" | "in_progress" | "planned" | "deferred";

export type BuildHierarchyNode = {
  id: string;
  title: string;
  summary: string;
  status: BuildHierarchyStatus;
  /** Policy / API / dashboard / mobile / guest /my */
  surfaces?: string[];
  children?: BuildHierarchyNode[];
};

/** Root programs — L0. */
export const PLATFORM_BUILD_ROOTS: BuildHierarchyNode[] = [
  {
    id: "commitment-gate",
    title: "Commitment Gate",
    summary: "What must be true before a scarce human minute locks.",
    status: "in_progress",
    surfaces: ["policy", "api", "guest /b", "guest /my", "dashboard"],
    children: [
      {
        id: "commitment-percent-deposit",
        title: "Percent deposit rail",
        summary: "Tenant % on service price → Stripe → Liv auto-confirms.",
        status: "shipped",
        children: [
          {
            id: "commitment-vertical-defaults",
            title: "Vertical deposit defaults",
            summary: "Seed % per vertical from market norms.",
            status: "shipped",
          },
          {
            id: "commitment-consult-waive",
            title: "Free consult SKU waive",
            summary: "€0 consult / assessment — no deposit gate.",
            status: "shipped",
          },
          {
            id: "commitment-auto-confirm",
            title: "Auto-confirm on payment",
            summary: "Webhook → capture → confirmBookingAfterStripePayment.",
            status: "shipped",
          },
          {
            id: "commitment-combined-checkout",
            title: "Deposit + retail combined",
            summary: "One Stripe session for hold + bag.",
            status: "shipped",
          },
          {
        id: "commitment-guest-truth-line",
        title: "Guest deposit truth on /my",
        summary: "Accurate due/paid copy with vertical tone.",
        status: "shipped",
      },
      {
        id: "commitment-balance-at-visit",
        title: "Balance at visit",
        summary: "Chair/bay balance due — post-commitment settlement.",
        status: "shipped",
          },
        ],
      },
      {
        id: "commitment-package-credit",
        title: "Package credit rail",
        summary: "Prepaid sessions satisfy gate — burn on book.",
        status: "shipped",
        children: [
          {
            id: "commitment-pack-burn-confirm",
            title: "Pack burn → instant confirm",
            summary: "Transactional credit burn; no double deposit.",
            status: "shipped",
          },
          {
            id: "commitment-pack-purchase",
            title: "Guest pack purchase on /b",
            summary: "Stripe buy pack → ledger → book with credit.",
            status: "shipped",
          },
        ],
      },
      {
        id: "commitment-milestone-quote",
        title: "Milestone quote rail",
        summary: "Event vendors — consult-first quote schedule.",
        status: "shipped",
        surfaces: ["api", "guest /e"],
      },
      {
        id: "commitment-proof-deposit",
        title: "Proof then deposit",
        summary: "Body art — design approved → pay link → lock.",
        status: "shipped",
      },
    ],
  },
  {
    id: "owner-operating-ritual",
    title: "Owner Operating Ritual",
    summary: "Today = what Liv handled, what needs you, what guests must finish.",
    status: "shipped",
    surfaces: ["policy", "dashboard", "mobile"],
    children: [
      {
        id: "ritual-operating-pulse",
        title: "Operating pulse",
        summary: "Liv handling · Needs you · Guest completing counts.",
        status: "shipped",
      },
      {
        id: "ritual-pending-split",
        title: "Pending queue split",
        summary: "Deposit-wait vs human-queue vs policy review.",
        status: "shipped",
      },
      {
        id: "ritual-inbox-lenses",
        title: "Inbox lenses",
        summary: "needs_you / liv_handling / taken_over parity.",
        status: "shipped",
      },
      {
        id: "ritual-persona-homes",
        title: "Persona ritual homes",
        summary: "Owner / manager / staff / reception morph.",
        status: "shipped",
      },
    ],
  },
  {
    id: "guest-continuity",
    title: "Guest Continuity",
    summary: "/b book → pay/commit → /my visit → thread → rebook.",
    status: "in_progress",
    children: [
      {
        id: "continuity-book-pay",
        title: "Book and pay path",
        summary: "Pending → pay token → confirmed without staff.",
        status: "shipped",
      },
      {
        id: "continuity-my-vault",
        title: "/my vault modules",
        summary: "Visits, packs, proofs, pets, vehicle.",
        status: "shipped",
      },
      {
        id: "continuity-thread-read",
        title: "Visit thread read",
        summary: "Guest reads Liv/staff messages on visit page.",
        status: "shipped",
      },
      {
        id: "continuity-vertical-memory",
        title: "Vertical memory on visit",
        summary: "Beauty prefs, patch test, wellness prep.",
        status: "shipped",
      },
    ],
  },
  {
    id: "emergent-trust",
    title: "Emergent Trust Programs",
    summary: "VIP-style service proposed from data — never default-on.",
    status: "in_progress",
    surfaces: ["policy", "twin", "dashboard"],
    children: [
      {
        id: "trust-signal-collection",
        title: "Signal collection",
        summary: "Show rate, rebook, strikes, LTV — year-one data.",
        status: "in_progress",
      },
      {
        id: "trust-twin-proposal",
        title: "Twin proposal card",
        summary: "Liv suggests trusted-client tier when metrics qualify.",
        status: "in_progress",
      },
      {
        id: "trust-policy-patch",
        title: "Accept → policy patch",
        summary: "Owner accepts; audit trail; per-tenant only.",
        status: "shipped",
      },
    ],
  },
  {
    id: "operating-twin",
    title: "Operating Twin",
    summary: "Business mirror — risks, opportunities, policy evolution.",
    status: "in_progress",
    children: [
      {
        id: "twin-observations",
        title: "Observation drafts",
        summary: "Facts → meaningful interpretations.",
        status: "shipped",
      },
      {
        id: "twin-commerce-signals",
        title: "Commerce signals",
        summary: "Capture rate, deposit tuning nudges.",
        status: "shipped",
      },
      {
        id: "twin-policy-patch-ui",
        title: "Policy patch accept UI",
        summary: "One-tap accept from Twin card.",
        status: "shipped",
      },
    ],
  },
];

export function listBuildHierarchyNodes(
  nodes: BuildHierarchyNode[] = PLATFORM_BUILD_ROOTS,
): BuildHierarchyNode[] {
  const out: BuildHierarchyNode[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...listBuildHierarchyNodes(n.children));
  }
  return out;
}

export function buildHierarchyNode(id: string): BuildHierarchyNode | undefined {
  return listBuildHierarchyNodes().find((n) => n.id === id);
}

/** Vertical packs inherit commitment profile — see booking-commitment-program.ts */
export function verticalBuildPriority(vertical: BusinessVertical): string[] {
  const common = ["commitment-gate", "guest-continuity", "owner-operating-ritual"];
  if (vertical === "event-vendors") {
    return ["commitment-milestone-quote", "owner-operating-ritual", "guest-continuity"];
  }
  if (vertical === "wellness" || vertical === "fitness") {
    return [...common, "commitment-package-credit"];
  }
  if (vertical === "body-art") {
    return [...common, "commitment-proof-deposit"];
  }
  return common;
}
