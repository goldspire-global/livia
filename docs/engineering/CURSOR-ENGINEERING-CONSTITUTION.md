# Cursor & Engineering Constitution

**Status:** canonical (2026-06-05) — audit Part 19 + AGENTS.md cascade  
**Audience:** every engineer and AI agent working on Livia  
**Enforcement:** code review, `pnpm vertical:check`, `pnpm run typecheck`, AGENTS.md

---

## Purpose

The greatest technical threat to Livia is not bugs. It is **architectural drift**.

Intelligent people make locally correct decisions that collectively create global chaos. This constitution prevents that.

---

## Rule 1 — Extend before replace

Default question:

> What existing system should this extend?

Not: *What new system should I create?*

| Forbidden | Required |
|-----------|----------|
| Second experience framework | Extend `resolveTenantExperience()` |
| New Liv chat route with inline tools | Extend `lib/liv-runtime` registry |
| Duplicate vertical lists in React | Extend `@workspace/policy` |

---

## Rule 2 — Every concept has one owner

| Concept | Owner | Repo hub |
|---------|-------|----------|
| Business understanding | Business Twin | `business-twin.service.ts` (target) |
| Capabilities | Capability Graph | `capability-registry.ts` (target), `vertical-announcement.ts` |
| Experience | Experience OS | `tenant-experience.ts` |
| Trust | Trust layer | `liv-mandate.ts`, audit |
| Communications | Relationship layer | `conversations.service.ts` |
| Intelligence interaction | Liv runtime | `lib/liv-runtime` |
| Rules | Policy layer | `@workspace/policy` |
| Change records | Event system | `lib/event-bus` |
| Commerce | Commerce layer | `payment.service.ts` |

No concept may have two competing systems.

---

## Rule 3 — No vertical logic in core systems

**Forbidden** in bookings, customers, payments, communications, Liv runtime:

```typescript
if (businessType === "salon") { ... }
```

**Allowed:**

```text
Vertical Registry → Capability Resolution → Experience Resolution
```

Verticals **configure**. They do not **fork** architecture.

---

## Rule 4 — Mobile is the primary surface

When ambiguity exists about which surface to optimize: **choose mobile**.

Not desktop. Not admin-only. Mobile first for tenant operators.

---

## Rule 5 — Public `/b` is a product

The `/b` experience is the **business front door** — not a booking widget.

Engineering treats it with same rigor as dashboard: perf budgets, preset parity, E2E, accessibility.

---

## Rule 6 — Liv is a platform layer

Liv must not become:

- A chatbot page  
- A feature tab  
- A novelty widget  

Liv orchestrates through **registered tools** with mandate gating and audit.

---

## Rule 7 — Policy-first cascade

```text
lib/policy → API routes/services → codegen → artifacts/* (thin surfaces)
```

Never bypass the hub. Never hand-edit `lib/api-zod` or `lib/api-client-react`.

After policy changes:

1. `pnpm vertical:check` (if vertical/onboarding/presets)  
2. `pnpm vertical:doc-check` (if vertical docs)  
3. `pnpm codegen` (if API contract changed)  
4. `pnpm run typecheck`  

---

## Rule 8 — OpenAPI before implementation

New capabilities follow:

```text
Contract → Implementation → Client
```

Not: implementation first, contract later.

---

## Rule 9 — Events on meaningful change

Every meaningful business mutation emits a typed domain event (or registers why it is analytics-only).

See [`EVENT-TAXONOMY.md`](./EVENT-TAXONOMY.md).

---

## Rule 10 — V1 filter

Before building, ask: **Does this help a business reach First Successful Booking faster?**

If no, check [`LIVIA-MASTER-EXECUTION-PLAN-V3.md`](../product/LIVIA-MASTER-EXECUTION-PLAN-V3.md) for era scheduling. Do not ship V2 work during V1 unless explicitly gated.

---

## Rule 11 — Surface cascade

| If you touched… | Also verify… |
|-----------------|--------------|
| Dashboard UI/copy | Mobile equivalent |
| Mobile screen | Web parity or intentional doc |
| Public `/b` | All verticals with guest surface pattern |
| Policy vertical | `vertical:check`, demo slug, registry row |
| API route | `pnpm codegen` |

See `.cursor/rules/livia-surfaces-cascade.mdc`.

---

## Rule 12 — Minimal correct diff

Match surrounding style. No over-engineering. No unrelated changes. Comments only for non-obvious business logic.

---

## Forbidden patterns (summary)

- ChatGPT wrapper without tools  
- Liv direct database access  
- Twin reasoning inside Liv prompts  
- Duplicate business logic in AI service  
- Feature flags instead of capability resolution  
- Vertical-specific UI forks  
- Orphan data without business_id  
- Secrets in repo  

---

## Agent session protocol

1. Skim [`LIVIA-STATUS.md`](../LIVIA-STATUS.md)  
2. Declare hat (ceo/cpo/cto/coo/cs/cro) for non-trivial work  
3. Read relevant blueprint volume from [`MASTER-BLUEPRINT-INDEX.md`](../product/MASTER-BLUEPRINT-INDEX.md)  
4. Close with `pnpm run typecheck` if code changed  

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Canonical — audit Part 19 + AGENTS.md merge |
