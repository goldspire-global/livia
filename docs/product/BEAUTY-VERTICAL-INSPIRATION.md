# Beauty vertical — inspiration and product research

**Status:** living doc (2026-06-03)  
**Program:** [`BEAUTY-VERTICAL-PROGRAM.md`](./BEAUTY-VERTICAL-PROGRAM.md)  
**Excellence roadmap:** [`vertical-excellence/beauty.md`](./vertical-excellence/beauty.md)  
**Announcement hub:** [`VERTICAL-ANNOUNCEMENT.md`](../engineering/VERTICAL-ANNOUNCEMENT.md)

Captured research for the “yes, this is my studio” bar — aligned with the wellness vertical documentation pass.

---

## 1. Category reality (not hair, not clinical)

Lash, nail, brow, and wax studios optimize for:

| Operator pain | Guest pain |
|---------------|------------|
| **Fill cycles** and no-shows on long sets | Book **fill vs full set** without guessing |
| **Patch tests** and allergy discipline | Trust signal on `/b` |
| **DM → book** without losing lash map context | Link-in-bio at 11pm |
| **Per-artist** prefs and deposits | No account wall; SMS continuity |
| Retail attach (R2) | Aftercare for wax/lash |

Livia must not feel like a barber app with pink chrome or a medspa consent wall.

---

## 2. Reference products (patterns to borrow)

| Product | Steal the pattern | Livia mapping |
|---------|-------------------|---------------|
| **Fresha / Phorest** | Multi-tech calendar, deposits | Platform deposits · pending flow |
| **GlossGenius** | Solo tech, beautiful `/b` | Bloom presets · featured treatments |
| **SuiteCal / Bella Booking** | Lash-specific menu, fill reminders | `BEAUTY_SERVICE_TEMPLATES` · R2 fill-cycle SMS |
| **Booking Pro AI** | Per-client lash prefs, recurring fill billing | R2 client beauty tab |
| **OpenChair (beauty)** | Patch tests, series tracking | `patch-test-guard` · R2 per-service flag |

---

## 3. Wow backlog → capabilities

| Wow moment | Maturity | Policy / surface |
|------------|----------|------------------|
| **Four distinct Today layouts** (not palette-only) | **R3 live** | `BEAUTY_MORPH_BY_CSS` · `BeautyMorphTodayHome` · `owner-home-ritual` |
| Noir **inbox-first** Today (`split-inbox`) | **R3 live** | `beauty-noir-dusk` · inbox hero + floor queue |
| Soft studio **station swimlanes** (`atrium`) | **R3 live** | `beauty-soft-studio` · `BeautyStationSchedule` |
| Editorial **menu-card** Today | **R3 live** | `beauty-editorial` · treatment cards + fill-cycle hint |
| Premium **floor cockpit** (`cockpit`) | **R3 live** | `beauty-premium-dark` · glow queue + KPI strip |
| Treatments in nav + menu onboarding | R1 ✅ | `treatment-menu-setup` |
| Inbox-first shell (sidebar) | R1 ✅ | `beauty-operator-shell` |
| Patch test on `/b` | R1 ✅ | `patch-test-guard` |
| Fill-cycle rebook SMS | R2 | `fill-cycle-rebook` |
| Lash preference on profile | R2 | `lash-preference-profile` |

**Preset → morph (owner Today):**

| Preset | Morph | Target lock |
|--------|-------|-------------|
| `beauty-noir-dusk` | `split-inbox` | DM triage hero |
| `beauty-soft-studio` | `atrium` | Station board |
| `beauty-editorial` | `menu-card` | `dashboard-owner-solo` menu-card |
| `beauty-premium-dark` | `cockpit` | glow-card manager cockpit |

Switch **Settings → Guest look** preset and reload `/dashboard` — layout morph must change, not only colors.

---

## 4. Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | Initial inspiration doc; P0 menu/nav shipped in policy + dashboard |
| 2026-06-03 | R3 wow: four preset Today morphs (wellness-parity layout pass) |
