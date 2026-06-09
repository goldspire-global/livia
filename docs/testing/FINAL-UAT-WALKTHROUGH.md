# Final UAT walkthrough — dual entry (guest + operator)

**Engineering gate (run before manual UAT):**

```powershell
cd "C:\Users\eamon\Personal Projects\apps\Livia"

# Terminals (leave running):
#   T1: pnpm dev:api          → :3000
#   T2: pnpm dev:dashboard    → :5173
#   T3: pnpm --filter livia-mobile start   → Expo (optional for native)

pnpm uat:deep-gate
```

Pass criteria: migrations, typecheck, Clerk hygiene, API smokes, Playwright `dual-entry-uat` + `innovation-p0` + `guest-hub-smoke` all green.

---

## Official demo users (Clerk — operators only)

Password for all: `LIVIA_DEMO_PASSWORD` (default **`LiviaDemo2026!`**)

| Role | Email | Landing | Use for |
|------|-------|---------|---------|
| **Org admin** | `org-admin@demo.livia-hq.com` | `/chain` | Multi-shop portfolio |
| **Owner (Conor)** | `owner-conorcuts@demo.livia-hq.com` | `/dashboard` | Single-shop hair |
| **Manager** | `manager@demo.livia-hq.com` | `/inbox` | Approvals, inbox |
| **Staff (Lara)** | `staff-lara@demo.livia-hq.com` | `/my-day` | Chair / day view |
| **Staff (Mo)** | `staff-mo@demo.livia-hq.com` | `/my-day` | Junior stylist |
| **Reception** | `desk@demo.livia-hq.com` | `/bookings` | Front desk |

**Per-vertical showcase owners** (one per demo shop):

| Vertical | Slug | Owner email |
|----------|------|-------------|
| Hair | `luxe-salon-spa` | `owner-luxe@demo.livia-hq.com` |
| Beauty | `bloom-beauty-dublin` | `owner-bloom@demo.livia-hq.com` |
| Wellness | `harbour-wellness-cork` | `owner-harbour@demo.livia-hq.com` |
| Body art | `ink-anchor-galway` | `owner-ink@demo.livia-hq.com` |
| Medspa | `clarity-medspa-dublin` | `owner-clarity@demo.livia-hq.com` |
| Allied health | `motion-physio-cork` | `owner-physio@demo.livia-hq.com` |
| Fitness | `peak-fitness-dublin` | `owner-peak@demo.livia-hq.com` |
| Pet grooming | `paws-parlour-dublin` | `owner-paws@demo.livia-hq.com` |
| Auto detailing | `shine-studio-belfast` | `owner-shine@demo.livia-hq.com` |

Fastest sign-in: http://localhost:5173/demo → pick persona card (issues Clerk ticket).

**Clerk cleanup** (removes stray synthetic users, keeps table above):

```powershell
pnpm demo:clerk-prune -- --execute
pnpm demo:clerk-rebuild
pnpm demo:repair
```

---

## Guest (Mary) — no Clerk, no password

| Field | Value |
|-------|--------|
| **Name** | Mary McNamara |
| **Phone** | `+353 87 100 0001` |
| **OTP (staging)** | Shown in UI as magic/dev code when `guestHub.otpMode` is relaxed |

**Web:** http://localhost:5173/my  
**Mobile:** Open Livia app → **My bookings & visits** → same OTP flow

Mary’s vault links all **9 showcase shops** after `pnpm demo:provision`.

---

## Path A — Guest on mobile (native)

1. Open **Livia** app (Expo dev build or simulator).
2. **Gateway:** tap **My bookings & visits** (not staff sign-in).
3. Enter `+353 87 100 0001` → OTP → **My Livia** hub.
4. **Channel:** pick how Liv reaches you (Text, WhatsApp, In-app, etc.).
5. Tap an **upcoming visit** → manage, message studio, running late.
6. Open **Ink Anchor** relationship → design proofs (body-art).
7. **Book again** on any linked shop.
8. **Sign out of My Livia** → returns to gateway; staff link if you also work at a studio.

Returning guest: if hub session saved, app skips gateway → My Livia directly.

---

## Path B — Operator on mobile

1. Gateway → **I work at a studio** → sign in.
2. Use demo email + `LiviaDemo2026!` or Google (if configured).
3. Land on persona tabs: **Today**, **Bookings**, **Inbox**, **More**.
4. Confirm vertical skin (wellness atrium, beauty morph, etc.) — not generic salon copy.
5. **Notification bell** on dashboard (push registration on device).

---

## Path C — Guest on web (parity)

1. http://localhost:5173/my → phone OTP.
2. **How Liv reaches you** card → save channel.
3. `/my/ink-anchor-galway` → proofs / relationship.
4. `/book/bloom-beauty-dublin` → public book (no login).
5. Proof link: `GET /api/demo/guest-surfaces/ink-anchor-galway/proof` → open path in browser.

---

## Path D — Operator on web

1. http://localhost:5173/demo → **Owner** or vertical owner.
2. `/dashboard` — vertical ritual (hair colour day, wellness morph, bay board, …).
3. `/inbox` — Liv thread; send reply (auto-release on HANDED_OFF).
4. `/settings` → **Booking rules** → **Aftercare & follow-up** policy.
5. Complete a booking → **Aftercare** panel on booking detail.
6. `/services` → edit **Aftercare instructions** on a service.

---

## Liv + Livia “alive” checks

| Check | Pass |
|-------|------|
| Guest message from visit page hits studio inbox | Message appears in `/inbox` for that tenant |
| Aftercare policy `liv_draft` | Draft on completed booking; send uses guest channel |
| Tenant vocabulary | Wellness dashboard does not say “salon” |
| Guest hub isolated | `GET /api/me/tenant-experience` with hub token → 401 |
| Notifications | Bell visible; demo booking may trigger in-app row |

---

## Ports

| Service | URL |
|---------|-----|
| API | http://127.0.0.1:3000 |
| Dashboard | http://localhost:5173 |
| Marketing | http://localhost:5174 |
| Internal ops | http://localhost:5175 (`INTERNAL_OPS_SECRET`) |

---

## If something fails

Note: **screen**, **persona** (guest vs `owner-harbour@…`), and **`x-request-id`** from Network tab.

Re-sync demo:

```powershell
pnpm demo:repair
pnpm uat:deep-gate -- --skip-clerk
```

---

**You can start manual UAT when `pnpm uat:deep-gate` exits 0.**
