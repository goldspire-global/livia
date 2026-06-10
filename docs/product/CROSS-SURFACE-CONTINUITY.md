# Cross-surface continuity (web ↔ mobile)

**Status:** canonical (2026-06-06)  
**Surfaces:** `artifacts/livia-dashboard` (W4 web) · `artifacts/livia-mobile` (W4m) · `/my` guest vault (W6)

---

## Principle

**One business row, one API, many renderers.** Operators and guests should move between phone and laptop without re-entering data or fighting divergent state.

| Sync model | Examples |
|------------|----------|
| **Immediate (API)** | Onboarding acts, presentation preset, bookings, inbox threads, customer profile, Liv memory |
| **Poll / invalidation** | Today summary (~30s mobile), dashboard widgets (TanStack staleTime) |
| **Push** | Inbox handoff, pending booking, chain alert → native deep link |
| **Web handoff** | Logo upload, wide tables, legal attestations, live `/b` iframe preview |

---

## Operators (Clerk)

1. **Create business** on web *or* mobile → same `POST /businesses`, same `onboardingState`.
2. **Blocking acts** (`a2`–`a8`) writable on mobile `onboarding-setup` or web wizard — `PATCH` business + act completion APIs.
3. **`OnboardingGate`** (web + mobile) sends owners to setup until `isOnboardingAppUnlocked`.
4. **Presentation preset** — `PATCH /businesses/:id/presentation` from either surface; mobile `PresentationThemeProvider` refetches tenant-experience.
5. **Continue cards** — `CrossSurfaceContinueCard` (mobile → web URL) · web onboarding `cross-surface-continue-card` (deep link `livia://onboarding-setup`).

---

## Guests (Mary / My Livia)

- **Phone OTP** — `guest_identities` + `guest_shop_links`; not Clerk.
- **Demo Mary** — `+353871000001` seeded via `seedDemoGuestHub()` on provision/sync. Upcoming visits are **curated** (≤8, one per shop, spread across weeks) — not raw operator live-day noise.
- **Web** `/my` and **mobile** `/my-livia` consume the same `GET /api/public/guest-hub/me` token.

---

## Vertical mobile “wow” (native-only)

| Vertical | Native affordance |
|----------|-------------------|
| Beauty | Split-inbox morph home, handoff strip, haptic confirm on booking actions |
| Wellness | `WellnessBreathField` shell + My Day breath rail |
| Hair / platform | Constellation shell, orbital map, KPI orbit chips |
| All | Push → booking/inbox deep links, pull-to-refresh without phantom reload |

Full matrix: [`WEB-MOBILE-PARITY.md`](./WEB-MOBILE-PARITY.md) · skin: [`MOBILE-SKIN-INHERITANCE.md`](../design/MOBILE-SKIN-INHERITANCE.md).

---

## Demo repair

```bash
curl -X POST https://api.staging.livia-hq.com/api/demo/sync
curl -X POST https://api.staging.livia-hq.com/api/demo/sync-guest-hub
```

Re-seeds Mary vault links without full world wipe.
