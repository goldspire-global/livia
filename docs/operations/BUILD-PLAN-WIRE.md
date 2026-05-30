# Build plan wire — redesign session → R1/R2/R3

**Source:** [`cursor_redesigning_livia_interface_for.md`](../../../Downloads/cursor_redesigning_livia_interface_for.md) (exported 2026-05-30)  
**Design locks:** [`PLATFORM-SURFACES-CONCEPTS-DEEP.md`](../design/PLATFORM-SURFACES-CONCEPTS-DEEP.md) v5  
**Build handoff:** [`PLATFORM-SURFACES-BUILD-SPEC.md`](../design/PLATFORM-SURFACES-BUILD-SPEC.md)  
**Live progress:** [`R1-BUILD-STATUS.md`](./R1-BUILD-STATUS.md)

---

## Founder locks (from redesign session — build, don’t re-litigate)

| Surface | Lock | Release | Staging URL |
|---------|------|---------|-------------|
| **M1 Home** | **M1-R2** One thread (story scroll) | R1 F2 | [staging.livia-hq.com](https://staging.livia-hq.com/) |
| **M2 Pricing** | **M2-A** Aurora glass tiers, €, no “Most Popular” | R1 F2 | `/pricing` |
| **G1 Demo** | **G1-A** Grid → per-wedge story → enter demo | R1 F3 | `app…/demo`, `/demo/wedge/:v` |
| **I2 Exec** | Ship Lane collapse/expand + **Hats River** tab | R1 F5 | ops / internal |
| **I4 Support** | **Thread** primary; Board + Radar as routes | R1 F6 / R2 depth | internal `/support/*` |
| **Gateway sign-in** | Email/password, aurora editorial | R1 F5 | `app…/sign-in` |
| **Tenant signup** | Platform Default preset (not vertical parade) | R1 D-R1 | `app…/sign-up` → onboarding |
| **Public /b** | Brand × vertical guest templates | R1 G + D5 | `app…/b/{slug}` |
| **Guest hub /my** | Phone OTP vault (shell → full) | R2 G6 | `app…/my` |

**Skin rule:** Marketing pages share **M0 Aurora Editorial** tokens. Internal shares **I0 ops amber**. Never mix tenant preset chrome on W1/W2/W3.

---

## Hierarchy — what “totality” means

```text
MASTER: LIVIA-FINAL-BUILD-PLAN.md
│
├── R1 (~8–12 wks) — SHIP TO STAGING FOR FOUNDER E2E
│   ├── E1–E14 exit criteria (see R1-BUILD-STATUS)
│   ├── Track F — marketing + gateway + internal chrome  ← redesign session
│   ├── Track G — guest /b + proof + phone normalize
│   ├── Track D — presentation_preset_id + platform default
│   └── Solidify 0–6 — mobile/inbox/kernel (parallel)
│
├── R2 (~6 mo post-R1)
│   ├── W6 guest hub complete (Liv orchestrator, favorites, book-again)
│   ├── I4 support Context pane + Investigate
│   ├── surfaceId registry full
│   └── Mobile parity push
│
└── R3 (~12–18 mo)
    ├── 36-preset parade staging→prod
    ├── Gate 2 field proof (10 Dublin shops)
    ├── pnpm vertical:check
    └── Full headless lifecycle CI
```

**Your E2E test gate:** R1 exit **14/14** on staging only. R2/R3 are post-sign-off waves.

---

## URL → world → build track (quick reference)

| URL | World | Track | R1? |
|-----|-------|-------|-----|
| staging.livia-hq.com | W1 Marketing | F | ✅ M1–M5 |
| app…/sign-in, /sign-up | W2 Gateway | F | ✅ |
| app…/demo, /demo/wedge/* | W2 Gateway G1-A | F3 | ✅ |
| app…/dashboard, /inbox, … | W4 Tenant | D + Solidify | partial |
| app…/b/* | W5 Guest | G | ✅ |
| app…/my | W6 Hub | G6 | shell (R2 full) |
| ops internal | W3a/b | F5–F6 | partial |
| mobile | W4 | Solidify T3 | partial |

---

## Redesign session → implementation map

| Session artifact | Repo path | Build status |
|------------------|-----------|--------------|
| Concept catalog A/B/C | `docs/design/PLATFORM-SURFACES-UX-REDESIGN.md` | ✅ spec |
| Founder locks v5 | `docs/design/PLATFORM-SURFACES-CONCEPTS-DEEP.md` | ✅ locked |
| Build spec + inheritance | `docs/design/PLATFORM-SURFACES-BUILD-SPEC.md` | ✅ |
| PNG mocks | `docs/design/assets/platform-surfaces/` | ✅ key screens |
| Dev gallery | `/experience/platform-surfaces` (:5173) | ✅ |
| M1-R2 home React | `editorial-story.tsx` + home | **wiring wave 7** |
| M2-A pricing | `pricing.tsx` | partial → wave 7 |
| G1-A wedge | `wedge-demo-stories.ts`, `WedgeStory.tsx` | ✅ |
| I2 Ship Lane | `ShipLanePanel`, `FounderCockpitView` | ✅ partial |
| I4 Thread | `SupportSurfaceNav`, queue views | partial |

---

## Agent execution order (R1 closeout → R2 start)

1. **F2** M1-R2 home + M2-A pricing polish (marketing staging visible)
2. **F4** M5 vertical pages → `dashboardWedgeUrl()` CTAs
3. **E4** `pnpm test:e2e:verticals` green
4. **G5** public book mobile pass
5. **F8** headless marketing→demo→tenant
6. **E7–E9** tenant default UAT, support thread, exec hats polish
7. **Backlog sync** — PLATFORM-BACKLOG checkboxes
8. **Founder ping** — R1 exit 14/14
9. **R2** guest hub depth, support investigate, mobile parity (continues after your E2E)

---

## Wave log pointer

See [`R1-BUILD-STATUS.md`](./R1-BUILD-STATUS.md) § Wave log — updated each merge.
