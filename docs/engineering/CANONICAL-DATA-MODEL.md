# Canonical Data Model

**Status:** canonical Volume B (2026-06-05)  
**Audience:** engineering, product, Cursor  
**Implementation:** `lib/db/src/schema/*`, OpenAPI, services in `artifacts/api-server`  
**Does not replace:** [`data-model.md`](./data-model.md) (Prisma tables) — this doc is **business architecture**, not table layout.

---

## Executive principle

Database schema can change. Prisma can change. Tables can change. **Business architecture should remain stable.**

This document defines the canonical **entities of Livia** — reality, not implementation.

---

## Rule 1 — Business is the root aggregate

Everything inside Livia ultimately revolves around **Business** — not bookings, not customers, not staff, not Liv.

```text
Business
├── Staff
├── Customers
├── Services
├── Bookings
├── Relationships
├── Communications
├── Commerce
├── Trust
├── Capabilities (instances)
├── Experiences (resolved)
├── Events
├── Business Twin (understanding)
└── Liv Context (temporary)
```

**Nothing exists without a Business.** Every entity belongs to one business, or many businesses through explicit relationships. Never orphan data.

---

## The 20 canonical entities

### 1. Business

A real-world organization, practitioner, team, brand, or service provider operating through Livia.

**Owns:** staff, services, customers, bookings, reviews, relationships, trust signals, capability instances, twin understanding scope.

**Does not own:** global registry definitions, platform capability definitions, marketplace catalog.

**States:** Draft → Active → Suspended → Archived

**Repo:** `businesses` table, `POST /businesses`, `lib/policy` vertical assignment at create.

---

### 2. Staff

A human capable of performing work on behalf of a business.

**Properties:** identity, role, capabilities, availability, performance signals, trust signals.

**Staff ≠ User:** A platform user may link to a staff record; they are not the same entity.

**Repo:** `staff` schema, membership model, RBAC on routes.

---

### 3. Customer

A person receiving value from the business.

**Owns:** identity (abstract), relationships, communications history, trust signals, preferences.

**Customer is not:** an email address, phone number, or Instagram handle. Those are **channel identities** attached to a customer.

```text
Customer → Channel Identities (email, phone, IG, …)
```

**Repo:** `customers`, `channel-identities.service.ts`, guest hub for cross-visit continuity.

---

### 4. Service

A commercial offering — template, not instance.

**Owns:** duration, price, description, requirements, capability hooks, trust requirements.

**Rule:** Services are templates. Bookings are instances.

**Repo:** `services` schema, vertical default services in `verticals.ts`.

---

### 5. Booking

A scheduled commitment between customer and business.

**Connects:** customer, service, staff, time, location, commerce.

**Lifecycle:** Draft → Requested → Confirmed → CheckedIn → Completed | Cancelled | NoShow

**Rule:** Booking lifecycle changes **always emit events**.

**Repo:** `bookings` schema, `booking-events.ts`, `event-bus` `booking.*` events.

---

### 6. Relationship

The ongoing connection between business and customer. **One of the most important future entities.**

**Contains:** trust trajectory, communication history, engagement, loyalty, lifecycle stage.

**Owns:** the customer journey. Bookings happen *within* relationships.

**Repo status:** **Partial** — customer history and continuity exist (`booking-continuity.service.ts`, `liv-memory.service.ts`) but no first-class `Relationship` aggregate or API.

**Build priority:** Era 1 Q2 per execution plan.

---

### 7. Conversation

Channel-agnostic collection of communications between participants.

```text
Conversation → Messages → Channels
```

Not: WhatsApp conversation as root entity.

**Repo:** `conversations.service.ts`, multi-channel (WEB, SMS, WA, IG, EMAIL, VOICE).

---

### 8. Message

A single communication event within a conversation.

**Belongs to:** Conversation — not Customer directly.

**Repo:** messages schema, `ai-outbound.service.ts`.

---

### 9. Capability

A reusable **platform** business function.

**Examples:** Bookings, Deposits, Memberships, Reviews, Messaging, Verification.

Capabilities are platform concepts. Businesses **enable** them; they do not create them.

**Repo:** `lib/policy/src/vertical-announcement.ts` (`VerticalCapability`), `lib/entitlements`, `liv-tool-matrix.ts`. No `capabilities` table yet.

---

### 10. Capability Instance

Business-specific configuration of a platform capability.

**Example:** Capability = Deposits → Instance = "Northside Tattoo deposit settings"

**Repo status:** **Missing** as explicit entity — configuration scattered in business settings, Stripe connect state, feature entitlements.

**Build priority:** Capability Graph Phase 2.

---

### 11. Trust Profile

Trust representation of an entity (business, customer, or staff).

**Contains:** identity verification, proof, reputation, behaviour signals.

**Repo status:** **Partial** — `liv-mandate.ts` trustScore, reviews, audit; no unified Trust Profile aggregate.

---

### 12. Review

Customer-generated trust signal.

**Belongs to:** Relationship — not merely Business.

**Repo:** reviews schema, public display on `/b`.

---

### 13. Portfolio Item

Evidence of work performed — trust, not mere media.

**Repo:** portfolio support in public/guest flows; depth varies by vertical.

---

### 14. Commerce Record

A financial event: deposit, payment, refund, invoice, subscription.

**Rule:** Commerce records **always emit events**.

**Repo:** `payment.service.ts`, Stripe integration, `event-bus` payment-related events partial.

---

### 15. Event

A meaningful change within the platform. **Sacred.**

See [`EVENT-TAXONOMY.md`](./EVENT-TAXONOMY.md).

**Repo:** Dual — `lib/event-bus` (typed) + `events` table (audit/analytics literals).

---

### 16. Experience

The resolved presentation layer for a user in context.

**Generated from:** Business + Role + Device + Capabilities + Presentation + Context.

**Not stored** — resolved at runtime.

**Repo:** `resolveTenantExperience()`, `tenant-experience.service.ts`, dashboard `use-surface-class.ts`.

---

### 17. Business Twin

Platform's understanding of a business: facts, signals, observations, insights, recommendations.

**Never owns data** — references and interprets.

**Repo status:** **Partial** — distributed across `liv-presence.service.ts`, `liv-signals.service.ts`, `liv-memory.service.ts`, `morning-briefing.service.ts`. No `business-twin` module.

---

### 18. Liv Context

Temporary understanding available to Liv for the current interaction.

**Generated from:** Twin outputs, capabilities, trust, relationships, recent events, current experience state.

**Repo:** `ai-chat.service.ts` context assembly, `liv-memory.service.ts`.

---

### 19. Policy

Rules governing behaviour: cancellation, deposit, trust, capability policies.

**First-class citizens** — not hardcoded in services.

**Repo:** `@workspace/policy` — authoritative hub.

---

### 20. Workflow

Orchestrated series of actions on entities.

**Examples:** new client, deposit, review request, retention.

Workflows operate on entities; they do not replace them.

**Repo:** Inngest workflows, `notification-orchestrator.service.ts`.

---

## Ownership matrix

| Entity | Domain owner |
|--------|--------------|
| Business | Business domain |
| Staff | People domain |
| Customer | Relationship domain |
| Service | Service domain |
| Booking | Scheduling domain |
| Relationship | Relationship layer |
| Conversation / Message | Relationship layer |
| Capability | Capability Graph |
| Capability Instance | Capability Graph |
| Trust / Review | Trust layer |
| Commerce Record | Commerce layer |
| Event | Event system |
| Experience | Experience OS |
| Business Twin | Twin layer |
| Liv Context | Liv runtime |
| Policy | Policy layer |
| Workflow | Workflow engine |

---

## Feature readiness gate

Every future feature must answer:

1. Which canonical entity **owns** this?  
2. Which canonical entity **changes**?  
3. Which **event** emits?  
4. Which layer **understands** it (Twin domain)?  
5. Which **experience** presents it (role/device)?  

If these cannot be answered, the feature is not ready to build.

---

## Repo gap summary

| Entity | Repo status |
|--------|-------------|
| Business, Staff, Customer, Service, Booking | ✅ Strong |
| Conversation, Message | ✅ Strong |
| Event | ⚠️ Partial (dual systems) |
| Experience | ✅ Strong |
| Policy | ✅ Strong |
| Capability | ⚠️ Declarative only |
| Capability Instance | ❌ Missing |
| Relationship | ⚠️ Partial |
| Trust Profile | ⚠️ Partial |
| Business Twin | ⚠️ Distributed |
| Liv Context | ✅ Adequate for V1 |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Volume B canonical — repo mapping + gap table |
