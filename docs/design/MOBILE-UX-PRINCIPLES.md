# Mobile UX principles (Livia tenant app)

**Updated:** 2026-06-05  
**App:** `artifacts/livia-mobile` (Expo)  
**Guest P7:** [`PUBLIC-B-SURFACE-SPEC.md`](../product/PUBLIC-B-SURFACE-SPEC.md) — **mobile web `/b` is primary** for end customers; tenant Expo app is for operators (P2–P6).

---

## Design intent

Most operators check Livia on a phone between clients. Mobile is not a shrunken dashboard — it is a **ritual-first flagship** with one primary job per persona tab, and **More** for depth.

**P7 (guests):** Do not conflate with livia-mobile. Customers book on `/b` in the mobile browser; operators use Expo. Parity matrix: [`WEB-MOBILE-PARITY.md`](../product/WEB-MOBILE-PARITY.md).

**v1 bar ([`OPERATION-SOLIDIFY.md`](../product/OPERATION-SOLIDIFY.md) Track 3):** If a task is done daily on the shop floor (book, reply, rota, client edit, approve leave), it must be **doable on mobile** unless it requires a large table editor — then one-line web handoff, not a dead end.

---

## Clarity rule (every screen)

Before shipping a screen, answer in the UI (not a manual):

1. **Who is this for?** (owner, staff, client — never ambiguous)
2. **What can I do here on mobile?** (act now vs “finish on web” one line, not a whole page)
3. **Why would I open this?** (audit = trust trail; lifecycle = grow/hand over business — not client lifecycle)

Avoid internal codes (G3, G8) in user-facing copy. Use plain language.

**Demo:** use **More → Demo guide** and sign in per role — “Switch persona” only previews tabs, not real permissions.

**Liv surfaces (platform-wide):**

| Surface | Engine |
|---------|--------|
| Customer SMS/web chat | Claude + `buildLivSystemPrompt` per `businessId` |
| Inbox / staff assist | Same runtime + tools |
| Morning briefing | Liv synthesis from shop facts (`liv-morning-narrative.ts`); persisted per shop/day |
| Ritual header line (web) | Morning briefing `summary` first; stats fallback only if API down |
| Founder Glance line | Liv portfolio sentence from chain rollup facts |

Requires `ANTHROPIC_API_KEY`. Without AI, briefing falls back to stats-only copy marked `stats_fallback`.

**Invites:** one email via Clerk; job in Livia (floor / manager / desk) → membership role — not payroll job titles.

---

## Information hierarchy

| Layer | What belongs here | Examples |
|-------|-------------------|----------|
| **Tab (daily)** | Glance, act, reply | Today, Glance, Floor, Inbox, My chair |
| **More (weekly)** | Roster, services, trust | Staff, Services, Audit, Lifecycle |
| **Stack (task)** | One object, full focus | Booking detail, New booking, Client |
| **Web handoff (rare)** | Multi-column payroll export, franchise legal, bulk import | Only when screen needs wide table + legal attestation |

Rule: if a screen needs more than two form columns or a data table, prefer **mobile-optimised flow first** (wizard, steps, bottom sheet). Web handoff is for **exceptional** complexity — not lazy parity gaps.

---

## Layout

- **Phone:** 16px horizontal padding; cards stack; max one stats row + one list per screen.
- **Tablet (≥600dp):** 24px padding, content capped at ~560px centered — readable without stretching thumb reach. **Split pane** for inbox, proof desk, reception calendar where [`SURFACE-AND-BREAKPOINTS.md`](./SURFACE-AND-BREAKPOINTS.md) specifies.
- **Bottom tabs:** max 5 visible per persona; overflow lives in More (never a sixth tab).
- **Safe area:** tab bar floats above home indicator; scroll content `paddingBottom: 140` on tab screens.

**Canonical surface spec:** [`SURFACE-AND-BREAKPOINTS.md`](./SURFACE-AND-BREAKPOINTS.md).

**Target mocks (W4m):** `docs/design/assets/w4-tenant/{vertical}/presets/{cssPreset}/mobile/*.sample.png` → `.target.png` after founder lock. Same reproducibility rule as web — see [`LIVIA-TARGET-VISUALS.md`](./LIVIA-TARGET-VISUALS.md) §8. Beauty premium-dark first: [`assets/w4-tenant/beauty/presets/premium-dark/mobile/README.md`](./assets/w4-tenant/beauty/presets/premium-dark/mobile/README.md).

---

## Persona tabs (canonical)

See [`product/WEB-MOBILE-PARITY.md`](../product/WEB-MOBILE-PARITY.md). Tab labels use ritual names (Glance, Floor, Queue) aligned with web `persona-rituals.ts`.

---

## Chain / multi-shop

Founder **Glance** tab loads `/api/me/chain-rollup`: pulse badges (OK / Watch / Act), briefing line, tap shop → switch tenant → **Today**.

Single-shop owners never see rollup noise — plain shop list only when `businesses.length < 2`.

---

## Vertical affordances (More, not tabs)

| Vertical | Mobile entry | Web for edits |
|----------|--------------|---------------|
| Shared premises | More → Shared premises | `/premises` |
| Wellness day packages | More → Day packages | `/day-packages` |
| Allied-health care series | Client detail card | Web customer / series editor |
| Medspa clinical queue | More → deep link to Bookings filter | Web medspa tools |

---

## Appearance inheritance

Mobile is **not** a shrunken dashboard, but it **is** the same shop skin as web:

- **Inherits:** preset id, brand accent, vertical vocabulary (`GET /me/tenant-experience` → `resolveMobileSkin()`).
- **Native:** tab shell, morph homes, haptics, sheets — see [`MOBILE-SKIN-INHERITANCE.md`](./MOBILE-SKIN-INHERITANCE.md).
- **Edit on device:** Settings → Shop appearance (preset chips + accent); logo/cover → web.

Use `useMobileSkin()` — not scattered `isConstellation` checks — for chrome and atmosphere.

**Onboarding:** Owners can create a shop and finish blocking acts on mobile (`onboarding-setup`). Preset picker uses the same `PATCH /presentation` as web; `OnboardingGate` sends incomplete owners to setup (demo tenants skip).

---

## Motion & brand

- Shell atmosphere (Constellation map, wellness breath, aurora halo) lives in `TenantPresentationShell` — all tabs inherit.
- Aurora halo on non-constellation heroes only when atmosphere is `aurora-halo` — not on every list.
- Haptics on tab change, pull-to-refresh, destructive actions.
- Persona accent stripe on stack headers via `PersonaScreenHeader`.

---

## Verification

```powershell
pnpm --filter @workspace/livia-mobile run typecheck
pnpm maestro:visual-capture   # simulator + Maestro CLI
```

Manual script: [`testing/MANUAL-WALKTHROUGH-BETA.md`](../testing/MANUAL-WALKTHROUGH-BETA.md) § Mobile.
