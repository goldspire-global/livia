# Guest hub — My Livia (`/my`) program

**Status:** canonical (2026-06-05) — **GTM Wave 1 P0**  
**Surface:** W6 — `guest.public.hub` · route `/my`  
**Authority:** [`product/GTM-VERTICAL-DEPTH-PROGRAM.md`](../product/GTM-VERTICAL-DEPTH-PROGRAM.md) §4–5  
**Registry:** `lib/policy/src/platform-surface-registry.ts`

---

## What it is

End clients’ **cross-business relationship vault** on Livia: phone OTP sign-in, upcoming visits, favourites, **vertical-tailored manage-visit flows per shop** — not redirects to the public book surface.

**Book (acquisition)** lives on `{slug}.livia-hq.com`. **`/my` (relationship)** is where returning guests reschedule, message, see package credits, proof status, pet/vehicle memory, and rebook rhythm.

**Code today:** `artifacts/livia-dashboard/src/pages/my-livia.tsx` · `guest-hub.service.ts` · `GuestHubShell`

---

## Gap vs rest of Livia (founder UAT notes)

| Area | Today | Target (D1) |
|------|--------|--------|
| **Visit manage** | Redirect to `/b/.../visit` | `/my/{slug}/visit/{id}` vertical morph — **no book-surface redirect** |
| **Visual** | Generic shell | Inherit favourite shop preset accent (read-only) |
| **Shops list** | Flat cards | Sub-segment label, last service, book vs manage CTAs |
| **Upcoming** | Links to `/b` visit | In-hub: running late, reschedule, message shop |
| **Liv** | Rules router to `/b` | Route to shop thread or book subdomain when appropriate |
| **Vertical morph** | None | Beauty fill, wellness pack, proof status, pet card, vehicle card |
| **Mobile** | Web responsive | PWA add-to-home (guest) |

---

## Recommended phases

### P0 — Parity polish (1–2 sessions)

- Guest shell tokens aligned with platform marketing + `/b` (spacing, card radius, primary)
- Shop cards: logo, vertical label, favourite heart, explicit **Book again**
- Empty state copy from `@workspace/policy` (not hardcoded salon)

### P1 — Presentation inheritance

- Rebook opens `{slug}.livia-hq.com` with shop skin
- `/my` header accent from favourite shop preset (read-only)

### P2 — Features

- Waitlist / offer tokens surfaced in hub when API returns them
- Push opt-in for visit reminders (guest notification policy)
- Chain businesses: one hub row per brand vs per location (policy)

### P3 — E2E + screen card

- Screen card `guest.public.hub` in northstar registry
- Playwright: OTP staging path · favourites · upcoming hero link

---

## Cascade (do not bypass)

```text
lib/policy (guest copy, surface registry)
  → api-server guest-hub routes + DTOs
  → livia-dashboard /my + guest components
  → E2E guest-hub spec
```

---

## Related docs

- [`docs/product/LIVIA-PLATFORM-LIFECYCLE.md`](../product/LIVIA-PLATFORM-LIFECYCLE.md) — guest visit links
- [`docs/design/VISUAL-INHERITANCE-AND-BRAND-LOCKS.md`](./VISUAL-INHERITANCE-AND-BRAND-LOCKS.md) — W1–W6 boundaries
- [`docs/design/EXPERIENCE-ARCHITECTURE.md`](./EXPERIENCE-ARCHITECTURE.md) — presentation layers
