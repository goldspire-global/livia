# Capability Graph Specification

**Status:** canonical Volume C (2026-06-05)  
**Audience:** engineering, product, architecture, Cursor  
**Priority:** **Highest-priority missing architectural system** (audit Part 6)  
**Repo hub:** `lib/policy`, `lib/entitlements`, `lib/capability-tokens`, `liv-tool-matrix.ts`

---

## Executive finding

Without the Capability Graph, Livia becomes: salon software + tattoo software + gym software + clinic software + coach software.

With it: **one platform, many business types.**

The Capability Graph is the single most important scalability system in Livia.

---

## Core philosophy

Most software organizes around **industries**. The Capability Graph organizes around **business functions**.

| Functions repeat | Industries differ |
|------------------|-------------------|
| Appointments, deposits, messaging, reviews, memberships, verification, packages, classes | Beauty, tattoo, wellness, coaching, trades |

**Businesses differ. Capabilities repeat.**

---

## Definition

A **capability** is a reusable business function that can be enabled, configured, observed, and reasoned about.

**Examples:** Bookings, Deposits, Reviews, Messaging, Verification, Memberships, Intake, Portfolio, Waitlists.

Capabilities are **platform concepts**, not vertical concepts.

---

## Core rule

```text
Businesses do not CREATE capabilities.
Businesses ACTIVATE capabilities.
```

| Wrong | Right |
|-------|-------|
| Tattoo Deposits | Deposits capability configured for tattoo business |
| Salon Bookings | Bookings capability configured for beauty business |

---

## Capability structure (mandatory fields)

Every capability in the registry must define:

| Field | Purpose |
|-------|---------|
| `id` | Stable identifier |
| `name` | Human label |
| `description` | What it does |
| `category` | People, Scheduling, Commerce, Communication, Trust, Intelligence |
| `dependencies` | Required other capabilities |
| `events` | Published event types |
| `permissions` | Role access matrix |
| `surfaces` | Where it appears (dashboard, mobile, `/b`) |
| `liv_tools` | Tools Liv may invoke |
| `policies` | Owned policy types |
| `states` | Lifecycle states |

No exceptions for production capabilities.

---

## Capability categories

| Category | Examples |
|----------|----------|
| **People** | Staff, customers, teams |
| **Scheduling** | Bookings, availability, waitlists, classes |
| **Commerce** | Deposits, payments, memberships, packages |
| **Communication** | Messaging, campaigns, notifications |
| **Trust** | Reviews, verification, certifications |
| **Intelligence** | Insights, predictions, recommendations |

---

## Capability states

```text
Defined → Installed → Configured → Active → Suspended → Retired
```

| State | Meaning |
|-------|---------|
| **Defined** | Exists in platform registry |
| **Installed** | Available to business (plan/vertical) |
| **Configured** | Business has set required settings |
| **Active** | In production use |
| **Suspended** | Temporarily disabled |
| **Retired** | No longer used |

---

## Capability registry

The registry is the **source of truth**. Contains: definition, metadata, dependencies, policies, experience rules, trust rules, Liv rules.

**Businesses never modify registry definitions** — only their instances.

### Current repo (Phase 1 — declarative)

| Source | What it provides |
|--------|------------------|
| `lib/policy/src/vertical-announcement.ts` | `VerticalCapability` with `id`, `maturity` (R1–R3), `surfaces` |
| `lib/policy/src/liv-tool-matrix.ts` | Tool ↔ capability mapping, ship status |
| `lib/entitlements/src/index.ts` | Plan → capability keys |
| `lib/capability-tokens/src/index.ts` | Runtime permission tokens on tool invoke |
| `welcomeVerticalAnnouncement()` | Splits `readyCapabilities` vs `deferredCapabilities` |

**Gap:** No single `CAPABILITY_REGISTRY` module with full mandatory fields. No tenant **capability instance** store. No `GET /me/capabilities` resolved graph endpoint.

---

## Capability instance

```text
Capability (platform definition)
  +
Capability Instance (business configuration)
  =
Effective capability for tenant
```

**Example:** Deposits capability + Elite Recovery deposit settings (amount, refund policy, Stripe state).

**Target schema (Phase 2):**

```typescript
interface CapabilityInstance {
  businessId: string;
  capabilityId: string;
  state: CapabilityState;
  config: Record<string, unknown>;
  readinessChecks: ReadinessCheck[];
  installedAt: string;
  activatedAt: string | null;
}
```

---

## Dependency graph

Capabilities may require other capabilities. Dependencies must be **explicit, never hidden**.

```text
Bookings → Payments → Deposits
Customers → Reviews → Trust
Memberships → Customers + Payments
Classes → Scheduling + Staff
```

Enables: installation checks, onboarding gates, Liv reasoning ("you need Payments before Deposits").

**Repo:** Partial — onboarding acts imply dependencies; no graph resolver.

---

## Capability packs (convenience, not architecture)

Collections packaged for onboarding UX:

| Pack | Capabilities |
|------|--------------|
| Tattoo | Bookings, Deposits, Portfolio, Messaging, Consent |
| Wellness | Bookings, Intake, Memberships, Messaging |
| Beauty | Bookings, Deposits, Reviews, Portfolio, Messaging |

Packs accelerate setup; architecture remains graph-based.

---

## Vertical mapping

Verticals **never create** capabilities. Verticals **map** required and optional capabilities.

```text
Business → Vertical → Capability Requirements → Installed → Resolved Capability Set
```

Everything downstream uses **Resolved Capability Set**:

- Experience OS (what UI appears)  
- Liv (what tools are available)  
- Onboarding (what steps block activation)  
- Twin (what signals to observe)  

**Repo:** `vertical-pack-factory.ts`, `VERTICAL_COVERAGE_REGISTRY`, `vertical-announcement.ts`.

---

## Integration contracts

### Experience OS

Deposits enabled → deposit settings, screens, flows appear.  
Deposits disabled → no dead UI, no empty screens.

No feature flags; **capability resolution**.

### Trust

Capabilities may define trust requirements (e.g. aesthetic procedures → certification).

### Policy

Every capability may own policies (cancellation, refund, moderation).

### Events

Every capability **must publish events**. Mandatory — see Event Taxonomy.

### Business Twin

Twin consumes capability events. Never bypasses capabilities to query raw tables.

### Liv

Every capability exposes **Liv tools**. Liv never touches database entities directly.

```yaml
# Bookings tools (example)
create_booking
cancel_booking
reschedule_booking
check_availability
```

**Repo:** `lib/liv-runtime/src/registry.ts`, `liv-tool-matrix.ts`.

---

## Capability health (future)

Per-tenant reporting: adoption, usage, configuration completeness, readiness.

Liv may recommend: "Messaging capability not configured."

Feeds Twin **Capability Health** domain.

---

## Anti-patterns (forbidden)

| Anti-pattern | Why |
|--------------|-----|
| Vertical logic inside capability code (`if salon`) | Forks architecture |
| Capability duplication (Tattoo Deposits, Beauty Deposits) | Maintenance explosion |
| Hidden dependencies | Breaks onboarding and Liv |
| Direct Liv database access | No governance |
| Feature flags instead of capability resolution | Dead UI, inconsistent experience |

---

## Build phases

### Phase 1 — Registry hub (Era 1 Q3)

- [ ] `lib/policy/src/capability-registry.ts` — full definitions for V1 capabilities  
- [ ] Migrate `vertical-announcement` + `liv-tool-matrix` to derive from registry  
- [ ] `pnpm capability:check` CI — every vertical maps only registered capabilities  
- [ ] Document event + tool ownership per capability  

### Phase 2 — Tenant instances (Era 2 Q1)

- [ ] `capability_instances` persistence  
- [ ] `GET /me/capabilities` — resolved graph for tenant  
- [ ] Readiness engine — "Bookings active when services + staff + availability exist"  
- [ ] Onboarding acts driven by readiness, not hardcoded lists  

### Phase 3 — Health + marketplace (Era 4)

- [ ] Capability health signals → Twin  
- [ ] Marketplace installs capabilities, not apps  

---

## Strategic benchmark

A new business type appears. Founder adds capability mapping to registry. **No platform rewrite. No new product.** The business works.

Every feature request must answer: **Is this a capability?** If yes, extend the graph. If no, question whether it belongs.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Volume C canonical — repo phase plan |
