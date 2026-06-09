# Beauty vertical — excellence spec (V2 heartland)

**Status:** canonical product research (2026-06-03)  
**Demo:** `bloom-beauty-dublin` · owner `owner-bloom@demo.livia-hq.com`  
**Program status:** [BEAUTY-VERTICAL-PROGRAM.md](../BEAUTY-VERTICAL-PROGRAM.md)  
**Playbook:** [vertical-playbooks/beauty.md](../vertical-playbooks/beauty.md)

---

## 1. The “yes, this is for my business” bar

A lash/nail/brow owner who signs up today should feel, within **15 minutes**:

1. **I can build my menu** — categories (Lashes, Nails, Brows, Wax), fill vs full set, durations that match reality, photos on `/b`.
2. **My studio rules are enforced** — patch test, deposits on long services, cancellation window — without spreadsheets.
3. **DMs and bookings are one thread** — Instagram/WhatsApp → inbox → book without re-typing lash map notes.
4. **Clients rebook on rhythm** — 2-week lash fill, 3-week nail maintenance — Liv nudges, not generic “come back sometime.”
5. **It looks like my brand** — Bloom on `/b`, not Livia; preset matches my studio aesthetic.

**Today (honest, 2026-06-05):** Menu discoverability and P1 patch/fill shipped; **GTM Wave 1** requires all sub-segments in §2.1 onboardable with innovation P0 from [`VERTICAL-INNOVATION-PROGRAM.md`](../VERTICAL-INNOVATION-PROGRAM.md). Remaining gaps: fill vs full classifier, combos, contraindication profile, `/my` relationship shell.

---

## 2. How beauty businesses actually operate

### 2.1 Sub-segments (same vertical, different physics)

| Sub-segment | Unit | Typical services | Revenue rhythm | Failure mode if software is generic |
|-------------|------|------------------|----------------|-------------------------------------|
| **Lash studio** | Station / bed | Classic set, hybrid, volume, fill 2–3wk | High repeat, fill cycles | Treating fill like new booking; losing curl/length prefs |
| **Nail salon** | Station | Mani, gel, BIAB, pedi, nail art | Retail attach, loyalty | No combo services (mani+pedi); wrong chair duration |
| **Brow bar** | Station | Lamination, tint, shape, henna | Fast turnover, add-on to lash | Shared 30min slot for 90min lamination |
| **Waxing** | Room/station | Brazilian, half leg, face | Patch test + contraindications | No skin/medication questions |
| **Facial / skin** | Room | Express, LED, peel (non-med) | Series packages | Confusing with medspa clinical stack |
| **Spray tan / PMU-light** | Booth | Tan, lip blush (light) | Seasonal peaks | Wrong consent depth (medspa vs beauty) |
| **Multi-service studio** | Mixed stations | All of above | Inbox-first, tech specialists | One flat “Service” list with no categories |

### 2.2 Operator day (solo owner + 2 techs)

| Time | Real work | What exceptional software does |
|------|-----------|--------------------------------|
| Before open | Confirm today’s stack; check patch tests expiring | Dashboard: “2 clients need patch test before colour/lash” |
| Morning | DM triage (“can I get a fill Friday?”) | Inbox → quote slot → book in thread |
| Midday | Walk-in / gap fill | Optional waitlist for cancelled fills |
| Between clients | Retail sell, restock | Light retail note on client (R2) |
| Evening | Set tomorrow’s priorities | Fill-due list: clients past rebook window |
| Weekly | Menu/pricing tweaks, Instagram | **Menu editor** discoverable; pin 4 hero services on `/b` |

### 2.3 Client journey (2026 expectations — research)

Industry tools (Fresha, GlossGenius, Bella Booking, SuiteCal, Booking Pro AI) consistently ship:

- **Service-aware booking:** fill vs full set, different duration/price; AI/rules suggest full set if last visit > X weeks.
- **Deposits:** higher on 2h+ services; optional on quick brow wax.
- **Patch test / allergy:** digital record on profile; block book if expired.
- **Preferences on profile:** lash map notes (curl, length, fan style), nail shape, adhesive sensitivity.
- **Automated rebook:** SMS at optimal fill interval; one-tap rebook link.
- **Aftercare:** wax/lash/brow instructions post-visit (SMS link, not PDF email).
- **No account wall:** guest book + SMS continuity.
- **24/7 book:** ~70% of beauty bookings initiated outside business hours (SuiteCal 2026 lash benchmark).

---

## 3. Current Livia audit (2026-06-03)

### 3.1 P0 shipped (wellness-parity pass, 2026-06-03)

| Item | Status |
|------|--------|
| Treatments in sidebar nav | ✅ `persona-rituals.ts` + beauty labels |
| Menu onboarding not auto-done | ✅ `afterBusinessCreatedStateForVertical("beauty")` |
| Beauty `/services` UI | ✅ templates, category, treatment vocabulary |
| Vertical announcement | ✅ `beauty-inbox-nav`, `treatment-menu-setup` |
| Booking / pending copy | ✅ `booking-experience-copy.ts` beauty pack |

**Still works from before:** featured pins, `/b`, patch-test guard, presets, Bloom demo.

### 3.1b Open UX gaps

| Issue | Impact |
|-------|--------|
| Studio setup hub route | No single “studio checklist” surface |
| Per-service patch flag | Guard vertical-wide only |
| Fill-cycle SMS | Hair-shaped continuity |

### 3.2 Policy / data gaps

| Capability | Status | Notes |
|------------|--------|-------|
| Vertical-wide `patch_test` guard | ✅ | Not per-service; not stored on client profile |
| Fill vs full set service type | ❌ | No enum; no rebook interval |
| Deposit per service | 🟡 | Platform deposits exist; not service-level rules UI |
| Client preference fields (lash map) | ❌ | Notes freeform only |
| Patch test expiry date | ❌ | Guard is attestation at book time only |
| Retail attach | ❌ | R2 |
| Multi-service add-ons (e.g. brow + lash) | ❌ | Single service per book |
| Station resource scheduling | 🟡 | `requiredResourceId` in schema; no beauty UX |
| Aftercare SMS sequences | ❌ | Hair-shaped continuity only |
| Fill-cycle rebook copy | ❌ | Program gap L1 |

### 3.3 Surfaces

| Surface | Gap |
|---------|-----|
| W4 owner | No “Studio setup” hub linking menu + hours + `/b` preview + patch-test policy |
| W4 manager | Bloom manager UAT not signed with beauty presets |
| W5 `/b` | Patch test block only; no “last visit” / fill recommendation |
| Mobile operator | Menu edit deferred to web — OK if web path is obvious |

---

## 4. Exceptional operator experience (target)

### 4.1 P0 — Unlock “this is my studio” (1–2 sprints)

**Must ship before claiming beauty heartland complete.**

1. **Treatments in primary nav**  
   - Add `/services` to `NAV_POOL` for owner/manager (ritual name from vocabulary: **Treatments** or **Menu**).  
   - Beauty sidebar: icon + `beautyNav` styling; badge when menu &lt; 3 active services.

2. **Blocking onboarding act: “Build your menu”**  
   - **Done (2026-06-07):** `a3_service_menu` not auto-completed on create; opt-in `starterPack` seeds template menu.  
   - Block app unlock until ≥1 active service OR explicit starter pack / demo seed.  
   - Inline panel: “Add your first treatment” not just “Edit full menu”.

3. **Beauty-native services page**  
   - Vertical copy: Treatment, not Service; icon Sparkles or Hand — not Scissors.  
   - Placeholders: “Lash fill”, “Gel manicure”, “Brow lamination”.  
   - **Category** required: Lashes | Nails | Brows | Wax | Facial | Other.  
   - **Quick-add templates** from policy: 12 beauty presets (fill 60m, classic set 120m, etc.).

4. **Studio setup hub (beauty-only route or dashboard module)**  
   - Checklist: Menu ≥3 · Hours · Liv · Public link · Test book · Patch-test policy toggle.  
   - Live `/b` iframe (already in settings — surface here first for beauty).

5. **Settings → Booking rules → Patch test**  
   - Tenant toggle: require patch test for categories [Lashes, Brows, Colour] or per-service flag (P0: category-level).

### 4.2 P1 — Wedge depth (competitive with Fresha/GlossGenius)

1. **Service model extensions** (`lib/policy` + API + OpenAPI + codegen)  
   - `serviceKind`: `full_set | fill | maintenance | consult | other`  
   - `rebookIntervalDays` (e.g. 14 lash, 21 nail)  
   - `requiresPatchTest: boolean`  
   - `depositPolicy`: inherit | required | waived  
   - `bufferAfterMinutes` prominent in UI (lash cleanup time)

2. **Client profile — beauty tab**  
   - Patch test date + result  
   - Lash preferences (curl, length, style notes)  
   - Allergy / adhesive sensitivity flag  
   - Last service per category + “due for fill” badge

3. **Continuity SMS — beauty pack**  
   - Confirm: treatment name + tech + aftercare link  
   - Rebook: “You’re due for your 2-week lash fill” with `/b` deep link  
   - Aftercare: wax/lash/brow templates in `continuity-templates.ts`

4. **Inbox → book**  
   - Pre-fill service from thread context (Liv proposes fill vs full set from last visit)  
   - Attach reference photo to booking notes

5. **Public `/b`**  
   - Category sections on storefront  
   - Guard: if `requiresPatchTest` and client unknown → block + “book patch test first” service  
   - Featured treatments (existing 4-pin) with beauty card layout

6. **Manager floor**  
   - Station view: who’s on bed 1/2/3 (resource-backed)  
   - Running late → SMS (exists — ensure beauty copy)

### 4.3 P2 — Delight / differentiation

1. **Fill intelligence** — suggest full set if last fill &gt; 4 weeks (policy rule, Liv explains in inbox).  
2. **Recurring fill plans** — optional Stripe subscription for VIP fill cadence (Booking Pro AI pattern).  
3. **Retail attach** — quick-add product on checkout (R2).  
4. **Instagram portfolio import** — hero on `/b` (brand import).  
5. **Multi-treatment cart** — brow tint + lash fill same visit (stacked duration).  
6. **Tech commission report** — light, not payroll.  
7. **AI receptionist** — after Liv mandate mature; beauty-trained on menu.

### 4.4 Never (beauty vertical)

- Clinical diagnosis or treatment advice (medspa lane).  
- Full EMR / HIPAA charting.  
- Colour formula gram tracking (hair lane / Vish integration).  
- Inventory warehouse / SKU costing.

---

## 5. Exceptional guest (P7) experience

| Moment | Target behaviour |
|--------|------------------|
| Land on `/b` from Instagram | Studio name, hero photo, 4 pinned treatments, category browse |
| Pick treatment | See fill vs full set descriptions; duration honest |
| Patch test | Clear gate; book 15min patch test service if needed |
| Pay deposit | Shown only when policy requires; amount stated upfront |
| Confirm SMS | Branded; aftercare link; add to calendar |
| Visit token | Tomorrow: time, tech, address, “what to expect” |
| Rebook | One tap at day 12 for 14-day fill cycle |
| Reschedule | `/visit/{token}` — no login |

**Research anchor:** Clients expect mobile self-serve, deposits, personalized reminders, real-time availability — Livia must not feel like a generic Calendly with pink chrome.

---

## 6. Policy & schema requirements

New or extended policy modules (hub-first):

```text
lib/policy/src/
  beauty-service-templates.ts    # preset menu items per sub-segment
  beauty-client-fields.ts        # patch test, preferences (guest + owner visibility)
  beauty-booking-rules.ts        # fill vs full set inference, rebook windows
  booking-guards.ts              # extend per-service patch test
  continuity-templates.ts        # beauty SMS pack
  onboarding-program.ts          # blocking a3 for beauty (vertical override)
```

DB/API (extend `services` + `clients` or JSON profile):

- `services`: `serviceKind`, `rebookIntervalDays`, `requiresPatchTest`, `depositRequired`, `category` (required enum).  
- `client_profiles` or `business_clients`: `patchTestCompletedAt`, `beautyPreferences` JSON.

Registry: update `VERTICAL_COVERAGE_REGISTRY` V2 notes when P0 ships.

---

## 7. Navigation & information architecture

**Owner nav order (beauty-specific proposal):**

1. Today (`/dashboard`)  
2. Inbox (`/inbox`) — attention badge  
3. The floor (`/bookings`)  
4. **Treatments (`/services`)** ← **missing today**  
5. Clients (`/customers`)  
6. Team (`/staff`)  
7. Studio (`/settings` or `/studio-setup`) — appearance, `/b`, Liv, patch test  
8. Liv command (`/toolkit`)

**Activation checklist (replace generic):**

- Build menu (3+ treatments)  
- Set patch-test rule  
- Pin hero treatments on `/b`  
- Send test book link to yourself  
- Connect SMS/WhatsApp  

---

## 8. Demo & UAT (Bloom)

Founder must pass **new** menu discovery test:

1. Log in as Bloom owner **without** knowing URL.  
2. Within 2 minutes, add “Volume lash fill — 75 min — €65” from UI.  
3. See it on `/b/bloom-beauty-dublin` without deploy.  
4. Book as guest; patch-test gate on lash category.  
5. See fill-due suggestion on client profile (P1).

Update [FOUNDER-UAT-CHECKLIST.md](../../operations/FOUNDER-UAT-CHECKLIST.md) when P0 lands.

---

## 9. Implementation phases (engineering)

| Phase | Scope | Exit criterion |
|-------|--------|----------------|
| **P0** | Nav + onboarding + beauty services UI + studio setup | Owner can add treatment without docs/support |
| **P1** | Service model + client patch test + beauty SMS + `/b` categories | Competitive with GlossGenius core |
| **P2** | Fill intelligence + recurring plans + retail | Design-partner “wow” |
| **P3** | AI receptionist + multi-treatment cart | Scale |

**Cascade:** policy → API → codegen → dashboard + mobile labels → demo seed categories → E2E `founder-uat-p0` menu path.

---

## 10. Competitive reference (2026)

| Competitor | Strength Livia should respect |
|------------|------------------------------|
| Fresha / Phorest | Multi-staff calendar, deposits, marketplace discovery |
| GlossGenius | Solo tech UX, beautiful `/b`, card on file |
| SuiteCal | Lash-only templates, fill vs full, deposits in base tier |
| Bella Booking | Service-specific cancellation, fill history |
| Booking Pro AI | Per-artist prefs, recurring fill billing |
| OpenChair (beauty lane) | Treatment rooms, patch tests, series tracking |

**Livia differentiator (keep):** People-business OS — same inbox + Liv + policy hub across hair/beauty/medspa; **not** another isolated lash app. Beauty excellence must **not** break composable cascade.

---

## 11. Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | P0 implementation synced with program + inspiration + smoke docs |
| 2026-06-03 | Initial excellence spec from repo audit + 2026 market research |
