# Liv learning program

**Status:** shipped (2026-06-26) — Era 1 learning loop operating platform-wide  
**Policy hub:** `lib/policy/src/liv-learning-program.ts`  
**Cascade:** policy → API services → domain events → Inngest → surfaces (dashboard, mobile, guest Liv, internal ops)

---

## What this is

Liv learning is the **institutional memory loop** — not scripted twin rules pretending to discover things. Liv observes real usage, stores owner-confirmed knowledge, and changes behaviour on the next conversation.

```text
OBSERVE   domain events + audit + staff corrections
REMEMBER  liv_entity_memory (structured liv.learn:* rows)
INFER     hypothesis pass (LLM over aggregated facts, evidence-gated)
CONFIRM   owner / staff actions → procedural memory
BEHAVE    ranked memory injected into all Liv prompts
```

---

## Triggers (usage-based)

Learning passes are **not calendar-only**. They fire when:

| Trigger | When |
|---------|------|
| `milestone_completed_bookings` | 5th, 10th, 25th, or 50th completed visit |
| `correction_recorded` | Owner files liv_error (≥3 completed visits) |
| `override_recorded` | 2+ staff fixes of Liv bookings in 30 days |
| `nightly_cron` | 08:00 UTC fallback (`liv-hypothesis-daily`) |

Usage events debounce 2h per tenant (`liv-learning-on-usage` Inngest workflow).

---

## Platform surfaces

| Surface | Learning consumption |
|---------|---------------------|
| Guest `/b` Liv chat | `buildLivLearningPromptBlock` + customer memory |
| Staff inbox Liv | learning block + twin + business memory |
| Owner / advisor Liv | full learning block |
| Owner intelligence (web + mobile) | hypotheses + twin confirm |
| Morning briefing | refreshes on learning domain events |
| Internal ops liv_error bundle | incident + correction memory (`learningMemory` rows) |

---

## Dual cortex (engineers do not opt in)

Liv awareness is **automatic** — no per-feature “should Liv know?” decisions.

```text
STRUCTURAL cortex   propagation + capability graph + tool matrix → PLATFORM AWARENESS prompt block
OBSERVATORY cortex  every domain-bus event → liv_signals (observatory) + learning passes (policy-ranked)
EXPERIENTIAL cortex corrections / hypotheses → liv.learn:* memory (this doc)
```

| Hub | Role |
|-----|------|
| `liv-platform-awareness-program.ts` | What the platform **is** (capabilities, tools, routes) |
| `liv-observatory-program.ts` | What tenants **do** (auto-capture on domain events) |
| `liv-learning-program.ts` | What owners **confirm** (durable procedural memory) |

**Engineer contract:** register in policy/propagation + emit domain events on mutations. Liv syncs itself.

---

## Adding new platform behaviour (automatic)

When you ship a feature:

1. Register capability in **propagation** (`capability-routing`, vertical manifest) — required for CI anyway.
2. Emit a **domain event** on mutations — observatory maps it automatically (`liv-observatory-program.ts`).
3. Do **not** add Liv-specific strings in `ai-chat.service.ts`.

If the event is new, add its key to `DOMAIN_BUS_EVENT_KEYS` (sync test enforces parity with `eventRegistry`).

---

## Honest limits (deferred)

| Capability | Status |
|------------|--------|
| Cross-tenant benchmarks (Bet 8) | Policy gate only (`liv-peer-learning-program.ts`); needs opt-in + k≥10 |
| Auto-rollback of bookings | Correction pauses conversation; booking rollback is human-approved class (F03) |
| Per-tenant model fine-tuning | Deferred; memory + prompts are the learning mechanism |

---

## Key files

| Layer | Path |
|-------|------|
| Policy | `lib/policy/src/liv-learning-program.ts` |
| Platform awareness | `lib/policy/src/liv-platform-awareness-program.ts` |
| Observatory | `lib/policy/src/liv-observatory-program.ts` |
| Triggers | `artifacts/api-server/src/services/liv-learning-triggers.service.ts` |
| Hypothesis | `artifacts/api-server/src/services/liv-hypothesis.service.ts` |
| Corrections | `artifacts/api-server/src/services/liv-correction.service.ts` |
| Overrides | `artifacts/api-server/src/services/liv-override-learning.service.ts` |
| Memory | `artifacts/api-server/src/services/liv-memory.service.ts` |
| Workflows | `liv-was-wrong`, `liv-hypothesis-daily`, `liv-learning-on-usage` |
| Migration | `lib/db/migrations/sql/060-liv-learning-loop.sql` |

---

## Verification

```bash
pnpm propagation:check   # includes liv-learning propagation tests
pnpm run typecheck
```

Apply migration `060-liv-learning-loop.sql` before enabling in an environment.

**Closeout (2026-06-26):** Policy hub, services, workflows, prompt injection, owner-intel UI (web + mobile read), internal ops bundle, and propagation gates are in place. New platform behaviour auto-feeds learning when it emits domain events or uses the correction/override paths — register surfaces in `propagation/` when adding UI.
