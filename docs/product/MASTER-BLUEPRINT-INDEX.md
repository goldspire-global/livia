# Livia Master Blueprint — canonical index

**Status:** canonical (2026-06-05) — **supersedes scattered audit PDFs as repo authority**  
**Origin:** Deep Audit Report V1 (21 parts) + Master Blueprint Volumes A–H + Constitution Draft 0.1  
**Audience:** founder, engineering, product, design, Cursor, future team, investors  
**When docs disagree on architecture or V1 scope:** this index and the linked volume win.

---

## What this is

The Master Blueprint is Livia's **constitutional product architecture**: not a feature list, but the operating model for how a People Business OS is designed, built, and proven. It answers three questions at once:

1. **What is Livia becoming?** A People Business Operating System — not appointment software.
2. **What must V1 prove before we earn V2?** Trust enough to run daily operations; sacred metric = first successful booking.
3. **How does every future feature attach?** Through canonical entities, capabilities, events, twin understanding, Liv orchestration, and resolved experience.

The PDFs in the founder's Downloads folder are the **source manuscripts**. The markdown volumes in this repo are the **living canonical copies** — expanded with repo paths, gap status, and build sequencing.

---

## Volume map

| Vol | Title | Canonical doc | Repo hub |
|-----|-------|---------------|----------|
| **0** | Constitution | [`LIVIA-CONSTITUTION.md`](./LIVIA-CONSTITUTION.md) | Beliefs + non-negotiables |
| **A** | V1 Product Definition | [`V1-PRODUCT-DEFINITION.md`](./V1-PRODUCT-DEFINITION.md) | Proof scope + exit criteria |
| **B** | Canonical Data Model | [`../engineering/CANONICAL-DATA-MODEL.md`](../engineering/CANONICAL-DATA-MODEL.md) | 20 entities + ownership |
| **C** | Capability Graph | [`../engineering/CAPABILITY-GRAPH-SPEC.md`](../engineering/CAPABILITY-GRAPH-SPEC.md) | `lib/policy`, entitlements |
| **D** | Business Twin | [`BUSINESS-TWIN-SPEC.md`](./BUSINESS-TWIN-SPEC.md) | liv-presence, signals, memory |
| **E** | Liv Runtime | [`LIV-RUNTIME-SPEC.md`](./LIV-RUNTIME-SPEC.md) | `lib/liv-runtime` |
| **F** | Experience OS | [`../design/EXPERIENCE-OS-SPEC.md`](../design/EXPERIENCE-OS-SPEC.md) | tenant-experience, presets |
| **G** | Vertical Registry | [`VERTICAL-REGISTRY-MASTER.md`](./VERTICAL-REGISTRY-MASTER.md) | `verticals.ts`, coverage registry |
| **H** | Event Taxonomy | [`../engineering/EVENT-TAXONOMY.md`](../engineering/EVENT-TAXONOMY.md) | `lib/event-bus`, domain-events |

**Execution layer (not a volume letter):**

| Doc | Role |
|-----|------|
| [`REPO-VS-BLUEPRINT-GAP-MATRIX.md`](./REPO-VS-BLUEPRINT-GAP-MATRIX.md) | Live repo vs blueprint — maturity scores + gaps |
| [`LIVIA-MASTER-EXECUTION-PLAN-V3.md`](./LIVIA-MASTER-EXECUTION-PLAN-V3.md) | 24-month build plan — eras, quarters, gates |
| [`GTM-VERTICAL-DEPTH-PROGRAM.md`](./GTM-VERTICAL-DEPTH-PROGRAM.md) | GTM Wave 1 — nine verticals, one bar; subdomain + `/my` |
| [`VERTICAL-INNOVATION-PROGRAM.md`](./VERTICAL-INNOVATION-PROGRAM.md) | Per-vertical + sub-segment innovation matrix |
| [`../engineering/CURSOR-ENGINEERING-CONSTITUTION.md`](../engineering/CURSOR-ENGINEERING-CONSTITUTION.md) | Rules for engineers and AI agents |

---

## Platform stack (canonical order)

Every meaningful feature flows through this stack. Lower layers constrain higher layers.

```text
Business (root aggregate)
  ↓
Capabilities (what is possible — Capability Graph)
  ↓
Events (what changed — Event Taxonomy)
  ↓
Business Twin (what it means — Facts → Recommendations)
  ↓
Liv Runtime (what to do — tools, never direct DB)
  ↓
Experience OS (how it appears — Role + Device + Context)
```

**Policy** (`@workspace/policy`) is the hub that *defines* verticals, capabilities, onboarding, presets, vocabulary, and guest surfaces. It does not execute — the API server orchestrates.

---

## Relationship to existing docs

| Older doc | Relationship |
|-----------|--------------|
| [`PEOPLE-BUSINESS-CATEGORY-MANIFESTO.md`](./PEOPLE-BUSINESS-CATEGORY-MANIFESTO.md) | **Category language** — still authoritative for GTM category; blueprint adds architecture volumes |
| [`LIV-OPERATING-SYSTEM.md`](./LIV-OPERATING-SYSTEM.md) | **Engineering companion** to Volume E — implementation detail; Volume E is product/architecture authority |
| [`EXPERIENCE-ARCHITECTURE.md`](../design/EXPERIENCE-ARCHITECTURE.md) | **Five-layer resolution** — still authoritative for preset rollout; Volume F adds role/device/context model |
| [`LIVIA-FINAL-BUILD-PLAN.md`](./LIVIA-FINAL-BUILD-PLAN.md) | **R1–R3 scope locks** — still valid for surface locks; execution sequencing moves to V3 plan |
| [`PLATFORM-EVOLUTION-AND-OPS-PROGRAM.md`](./PLATFORM-EVOLUTION-AND-OPS-PROGRAM.md) | **Engineering tracks A–H** — operational; blueprint V3 plan aligns quarterly work to tracks |
| [`SYSTEMS-COMPLETENESS-AUDIT.md`](./SYSTEMS-COMPLETENESS-AUDIT.md) | **Cross-functional inventory** — updated to reference gap matrix |

---

## Maturity snapshot (2026-06-05)

From [`REPO-VS-BLUEPRINT-GAP-MATRIX.md`](./REPO-VS-BLUEPRINT-GAP-MATRIX.md):

| Layer | Status | Headline |
|-------|--------|----------|
| Policy + Vertical Registry | **Strong** | 9 code verticals, CI `vertical:check`, packs via `defineVerticalPack()` |
| Experience OS | **Strong** | `resolveTenantExperience()`, presets, surface morph — uneven on device/persona |
| Liv Runtime | **Strong** | Tool registry, mandate gating, vertical packs — V1 modes thin vs spec |
| V1 Activation | **Strong** | `test-booking` onboarding gate wired; no funnel analytics product |
| Event Taxonomy | **Partial** | Dual systems: `event-bus` typed + flat `events` table |
| Capability Graph | **Partial** | Declarative lists + entitlements — no tenant capability instances |
| Business Twin | **Partial** | Distributed across presence/signals/memory — no twin service |
| Trust Layer | **Partial** | Audit + mandate — no earned-trust engine |
| Comms / Relationship | **Strong core** | Unified inbox; WA/IG/customer push partial |

**Honest truth:** Vision and architecture are ahead of market proof. V1 must close the activation loop before V2 layers earn build time.

---

## How to use this (by role)

| Role | Read order |
|------|------------|
| **Founder** | Constitution → V1 Definition → Gap Matrix → Master Execution Plan V3 |
| **Product** | V1 Definition → Vertical Registry → Experience OS → Business Twin |
| **Engineering** | Engineering Constitution → Data Model → Capability Graph → Event Taxonomy → Gap Matrix |
| **Design** | Experience OS → Vertical Registry (experience packs) → V1 public `/b` section |
| **Cursor agent** | Engineering Constitution → Gap Matrix → relevant volume for the task |

**Before any build session:** skim [`../LIVIA-STATUS.md`](../LIVIA-STATUS.md) for current buckets, then check whether the work serves V1 proof or is explicitly scheduled in V3 plan Era 2+.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Initial canonical index — audit PDFs ingested, repo-mapped, V3 execution plan |
