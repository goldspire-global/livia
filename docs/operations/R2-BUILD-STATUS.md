# R2 build status — post-R1 program (living doc)

**Authority:** [`product/LIVIA-FINAL-BUILD-PLAN.md`](../product/LIVIA-FINAL-BUILD-PLAN.md) §5  
**Sequencing:** [`product/LIVIA-WIDE-BUILD-PLAN.md`](../product/LIVIA-WIDE-BUILD-PLAN.md) §6  
**Tracker:** [`PLATFORM-BACKLOG.md`](./PLATFORM-BACKLOG.md)  
**Updated:** 2026-05-31 — **R2 closed for engineering exit**

---

## Theme

Guest surfaces complete · P7 hub · support at scale · mobile parity push.

**Honest progress:** ~90% code landed; **R2 exit criteria met** (Wave 17). R2.5 Liv hub AI depth and R3 preset parade remain out of scope.

---

## Exit criteria (R2)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| R2-E1 | W6 guest hub OTP + favorites + book-again | **Done** | OTP polish, favorites, service prefill on book-again, Liv orchestrator chat (rules + Liv fallback) |
| R2-E2 | W5 consent · pay · waitlist · visit all verticals | **Done** | All token surfaces + demo tokens + E2E suite |
| R2-E3 | I4 Context pane + runbook links in Thread | **Done** | `SupportThreadContextPane`, registry, runbook CTA |
| R2-E4 | B1 registry complete + Investigate depth | **Done** | P0 catalog (25), trace lookup, investigate view |
| R2-E5 | Mobile Today v2 + guest deep links | **Done** | `/my-livia`, `/guest-surface`, Today refetch |
| R2-E6 | Proactive Radar feeds (stuck onboarding, zero bookings) | **Done** | `/internal/ops/radar/feeds` |
| R2-E7 | CI guest-token suite | **Done** | `guest-token-api` in CI api gate; `guest-token-suite` + per-surface projects |
| R2-E8 | Support opens tenant from thread (impersonation policy) | **Done** | Thread + context pane open tenant; policy + public `/b` links; no tenant JWT |

---

## Wave log

| Wave | Date | Shipped |
|------|------|---------|
| 17 | 2026-05-31 | **R2 exit** · hub Liv orchestrator chat · support tenant-open in context pane · R2 status closed |
| 16 | 2026-05-31 | Guest waitlist accept polish · demo waitlist token API · `guest-token-api` CI · `guest-token-suite` UI |
| 15 | 2026-05-30 | **R1 closed** · guest hub upcoming/favorites/book-again · `/pay/:token` · owner booking toast · Radar proactive feeds · support context registry · mobile My Livia + guest deep links · Today/bookings 12s refetch |
| 14 | 2026-05-30 | G2 intake/waitlist · B1 registry · F6 Board/Radar |

---

## Deferred (R3 / R2.5+)

1. Full Liv Personal / WhatsApp hub commands (GUEST-CONTINUITY-HUB-SPEC R3)
2. `guest-token-suite` in founder release gate with live dashboard (CI today = API tokens only)
3. Split Aurora demo composite (R2-F cosmetic)
4. Impersonation break-glass JWT (policy allows internal tenant health only today)

---

## Founder UAT (R2 exit)

Staging stack + `/my` full flow (favorites, upcoming, book-again, Liv chat), `/pay/:token`, `/b/.../waitlist/:token`, mobile My Livia, Radar proactive section, support thread → open tenant.
