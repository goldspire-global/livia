# Vertical announcement — platform defaults and welcome handshake

**Status:** canonical (2026-06-03)  
**Hub:** `lib/policy/src/vertical-announcement.ts`  
**Reads with:** [`COMPOSABLE-EVOLUTION.md`](./COMPOSABLE-EVOLUTION.md) · [`TENANT-EXPERIENCE-CONTRACT.md`](../product/TENANT-EXPERIENCE-CONTRACT.md)

---

## Problem

Verticals are not identical. The platform cannot hard-code “what wellness contains” in every consumer. Each vertical **announces** what it ships; the platform **welcomes** it only when shared defaults are satisfied, then **flows** the merged bundle downward.

---

## Model

```text
PLATFORM_DEFAULT_VERTICAL_ATTRIBUTES   ← grows slowly over years (human + Liv proposals)
        │
        ▼
VerticalAnnouncementPackage          ← per vertical: defaults + extensions + capabilities
        │
        ▼ validateVerticalAnnouncement()
        │
        ▼ welcomeVerticalAnnouncement()
        │
GET /api/me/tenant-experience        ← announcement on bundle
        │
        ▼
Thin surfaces (dashboard, mobile, /b) ← read capabilities; never invent vertical rules
```

### Platform default attributes (v1)

| Key | Meaning |
|-----|---------|
| `pack.registered` | `defineVerticalPack()` in `verticals.ts` |
| `vocabulary.core` | `businessVocabulary()` |
| `playbook.linked` | Vertical playbook |
| `onboarding.extras` | `getVerticalOnboardingExtras()` |
| `presentation.handshake` | 4 presets + distinct morphs where required |
| `continuity.template` | `CONTINUITY_TEMPLATES[vertical]` |
| `guestSurfaces.catalog` | `guestSurfacesForVertical()` |
| `bookingExperience.copy` | `verticalOperationalCopy` + pending labels |
| `coverage.registry` | `VERTICAL_COVERAGE_REGISTRY` row |
| `guest.publicExperience` | `guest-public-experience.ts` — `/b` + visit copy |

Missing any key fails `pnpm vertical:check` (`validateVerticalAnnouncement`).

**Full build loop:** [`VERTICAL-COMES-TOGETHER.md`](./VERTICAL-COMES-TOGETHER.md).

### Beauty example (2026-06-03)

- `operatorShell`: `beauty-inbox-nav`
- Capabilities: `treatment-menu-setup`, `patch-test-guard`, …
- Extensions: `extensions.beauty.operatorNav`, `menuSetupRequired`
- Hub: `lib/policy/src/beauty-operator-shell.ts`

### Capability maturity

| Maturity | Platform behaviour |
|----------|-------------------|
| `platform-default` | Always on |
| `R1` | Shipped — surfaces should render |
| `R1.1` | Shipped with honest limitation label (e.g. schedule-derived room board) |
| `R2` | Deferred — show in `deferredCapabilities`; no fake production UI |

---

## Wellness example

Wellness extends the base package with:

- `operatorShell: wellness-full-nav`
- `roomBoard.mode: schedule-derived` + footnote until resource API
- R2 capabilities: voucher ledger on Today, gift on `/b`, membership minutes, DK locale pack

Inspiration and founder smoke: [`WELLNESS-VERTICAL-INSPIRATION.md`](../product/WELLNESS-VERTICAL-INSPIRATION.md) · [`WELLNESS-FOUNDER-SMOKE.md`](../operations/WELLNESS-FOUNDER-SMOKE.md).

---

## Evolving defaults

1. New vertical-specific behaviour starts in `extensions` or `capabilities` on one vertical.
2. When a second vertical needs the same key, promote it to `PLATFORM_DEFAULT_VERTICAL_ATTRIBUTES` and update all announcements.
3. Liv / ops telemetry may **propose** new default keys — promotion stays a human-reviewed hub change.

---

## Verify

```bash
pnpm vertical:check   # includes vertical-announcement.test.ts
```
