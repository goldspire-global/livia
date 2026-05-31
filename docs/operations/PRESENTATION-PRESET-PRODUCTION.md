# Presentation preset production promotion (R3-E1)

**Authority:** [`design/PRESENTATION-PRESETS-AND-ROLLOUT.md`](../design/PRESENTATION-PRESETS-AND-ROLLOUT.md)  
**Code:** `lib/policy/src/presentation-promotion.ts` · `presentationPresetsActive()`

---

## Matrix (9 × 4 = 36)

Each vertical ships **Platform Default** + **3 vertical-native** presets. All rows are **production-ready** when the env gate is on.

| Vertical | Presets |
|----------|---------|
| hair | platform-default + 3 native |
| beauty | platform-default + 3 native |
| body-art | platform-default + 3 native |
| wellness | platform-default + 3 native |
| fitness | platform-default + 3 native |
| medspa | platform-default + 3 native |
| allied-health | platform-default + 3 native |
| pet-grooming | platform-default + 3 native |
| automotive-detailing | platform-default + 3 native |

Generate the live table:

```bash
node --import tsx/esm -e "import { getPresentationPromotionMatrix } from './lib/policy/src/presentation-promotion.ts'; console.table(getPresentationPromotionMatrix())"
```

(Run from `artifacts/api-server` cwd with tsx.)

---

## Environment allowlist

| Variable | Value | Effect |
|----------|-------|--------|
| `LIVIA_PRESENTATION_PRESETS` | `true` | **Production** — enables picker, PATCH `/presentation`, `data-presentation` on `/b` |
| `LIVIA_ENV` / `LIVIA_DEPLOY_ENV` | `staging` | Staging always on |
| `NODE_ENV` | `development` / `test` | Local always on |

**Production promote checklist**

1. Founder UAT on staging — all 9 verticals × default preset on `/b` and dashboard shell  
2. Set `LIVIA_PRESENTATION_PRESETS=true` on Railway **production** (deliberate)  
3. Verify one tenant PATCH + audit row `human.presentation.update`  
4. Roll back by unsetting the variable (tenants keep last saved `presentation_preset_id`)

---

## Audit

Preset changes write `human.presentation.update` on `PATCH /api/businesses/:id/presentation` (see `artifacts/api-server/src/routes/businesses.ts`).

---

## Related

- [`R3-BUILD-STATUS.md`](./R3-BUILD-STATUS.md)  
- Dashboard: Settings → Public appearance · Onboarding chapter “Liv & your link”
