# Vertical starter pack — opt-in create seed

**Status:** shipped (2026-06-07)  
**Hub:** `lib/policy/src/vertical-starter-packs.ts`  
**API:** `POST /api/businesses` · `POST /api/onboarding/preview`  
**Surfaces:** dashboard `onboarding-create-business-step` · mobile `app/onboarding.tsx`

---

## Product rule

| Owner choice on create | Result |
|------------------------|--------|
| **Unchecked** (default) | Empty menu, no staff row, no retail. Onboarding `a3_service_menu` stays open. |
| **Checked** (`starterPack: true`) | Full vertical template menu + owner staff template. Beauty also seeds mini store. Completes `a3` + `a4`. |

All **9** `BusinessVertical` values share the same pattern — beauty is the only vertical that also seeds retail on `/b`.

---

## Cascade

```text
lib/policy/vertical-starter-packs.ts
  → getVerticalStarterPackServices / getVerticalStarterPackOffer
  → API seedVerticalStarterPack (artifacts/api-server)
  → onboarding preview starterPackServices
  → dashboard + mobile checkbox (policy copy, not hardcoded beauty)
```

**Legacy path:** `seedDefaults: true` seeds the compact `resolveOnboardingDefaults()` pack (dev/scripts only). Default is **false** — empty studio.

---

## Onboarding state

| Moment | Function |
|--------|----------|
| After `POST /businesses` (no seed) | `afterBusinessCreatedStateForVertical` — only `a1` complete |
| After `starterPack` or `seedDefaults: true` | `mergeOnboardingAfterMenuSeed` — adds `a3`, `a4`, `servicesConfirmed` |

---

## Verification

```bash
node --import tsx/esm lib/policy/src/__tests__/vertical-starter-packs.test.ts
node --import tsx/esm artifacts/api-server/src/services/__tests__/onboarding-program.test.ts
pnpm run typecheck
```
