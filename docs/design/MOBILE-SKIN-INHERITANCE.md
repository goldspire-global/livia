# Mobile skin inheritance (W4 native)

**Status:** canonical (2026-06-05)  
**App:** `artifacts/livia-mobile`  
**Reads with:** [`SKIN-BRAND-INHERITANCE-SPEC.md`](./SKIN-BRAND-INHERITANCE-SPEC.md) · [`EXPERIENCE-ARCHITECTURE.md`](./EXPERIENCE-ARCHITECTURE.md) · [`MOBILE-UX-PRINCIPLES.md`](./MOBILE-UX-PRINCIPLES.md)

---

## 1. Decision

The tenant Expo app **inherits** the same shop appearance as web and `/b` (preset + brand accent). It does **not** copy web layout, CSS, or sidebar IA.

```text
Policy preset + business row (presentationPresetId, brandAccentHex)
  → GET /api/me/tenant-experience
  → resolveTenantPresentationSurface()     # shared hub (colours, morph id)
  → resolveMobileSkin()                    # Layer 5 — native interpreter
  → TenantPresentationShell + morph homes
```

**Owner-facing truth:** Changing **Settings → Appearance** on web or mobile updates how the shop looks to staff on phone, on dashboard, and to clients on `/b/{slug}`.

---

## 2. What inherits vs what stays native

| Inherits (layers 1–3) | Native only (layer 5) |
|------------------------|------------------------|
| `presentationPresetId` / `cssPreset` | Bottom tabs, stack push, sheets |
| `brandAccentHex` | Haptics, pull-to-refresh, thumb zone |
| Vertical vocabulary + module emphasis | One focal action per tab screen |
| Persona tab membership (layer 4) | Constellation orbital map (RN, not CSS) |
| Layout morph **id** (hint) | Morph **components** (`ConstellationTodayHome`, etc.) |

**Rule:** Preset tokens are surface-agnostic. Morph is **module + persona + surface** — see [`SURFACE-AND-BREAKPOINTS.md`](./SURFACE-AND-BREAKPOINTS.md).

---

## 3. `resolveMobileSkin()` contract

**File:** `artifacts/livia-mobile/lib/resolve-mobile-skin.ts`  
**Context:** `PresentationThemeProvider` → `useMobileSkin()`

### Input

Output of `resolveTenantPresentationSurface({ vertical, category, cssPreset, brandAccentHex, colorMode })`.

### Output fields

| Field | Meaning |
|-------|---------|
| `family` | `constellation` \| `beauty-native` \| `wellness-native` \| `aurora-dark` \| `aurora-light` |
| `atmosphere` | Fixed shell behind tabs: `constellation-shell`, `wellness-breath`, `aurora-halo`, `none` |
| `tabBarChrome` | `frosted-glass` (constellation / wellness) or `solid` |
| `transparentScreens` | Scroll surfaces transparent over shell |
| `ritualAccentFromVertical` | Constellation + beauty/wellness → vertical pink/teal on chrome |
| …surface fields | `effectiveCssPreset`, `layoutMorph`, `colorOverrides`, flags |

### Owner Today morph

`resolveMobileOwnerTodayVariant(skin, persona, layoutMorph)`:

| Variant | When |
|---------|------|
| `constellation` | Platform Default, owner/org_admin |
| `beauty-morph` | Beauty vertical-native preset + owner/manager |
| `wellness-morph` | Wellness vertical-native preset + owner/manager |
| `standard` | Staff personas or generic preset |

---

## 4. Skin families → native modules

| Family | Atmosphere component | Owner Today (when applicable) |
|--------|----------------------|-------------------------------|
| `constellation` | `ConstellationShellAtmosphere` | `ConstellationTodayHome` |
| `wellness-native` | `WellnessShellAtmosphere` | `WellnessMorphTodayHome` |
| `beauty-native` | `AuroraHalo` (interim) | `BeautyMorphTodayHome` |
| `aurora-dark` / `aurora-light` | Halo or none | Standard Today stack |

**Visual targets:** `docs/design/assets/w4-tenant/{vertical}/presets/{cssPreset}/mobile/*.target.png` — judged on native criteria, not web screenshots.

---

## 5. Settings on mobile

| Capability | Path |
|------------|------|
| Read skin | `useMobileSkin()` from tenant experience |
| Edit preset + accent | Settings → **Shop appearance** (`MobilePresentationCard`) |
| API | `GET` / `PATCH` `/api/businesses/:id/presentation` (same as web) |
| Logo, cover, `/b` iframe | Web handoff (wide editor + live guest preview) |

Presets UI gated like web: dev, staging API, or `EXPO_PUBLIC_PRESENTATION_PRESETS=true`.

After PATCH, invalidate `tenant-experience` — shell and colours rebind without app store release.

---

## 6. Anti-patterns

- Port web `data-presentation` CSS to React Native verbatim
- Duplicate preset lists outside `@workspace/policy`
- Sixth bottom tab for depth that belongs in More
- Separate “mobile skin” column on `businesses` row (deferred split — see [`SKIN-BRAND-INHERITANCE-SPEC.md`](./SKIN-BRAND-INHERITANCE-SPEC.md) §4.5)

---

## 7. Implementation checklist

- [x] `resolveMobileSkin` + `useMobileSkin`
- [x] `TenantPresentationShell` driven by `atmosphere`
- [x] Native preset picker on mobile Settings (PATCH presentation)
- [x] Beauty-native dedicated shell atmosphere (`BeautyShellAtmosphere`)
- [ ] Constellation-native Inbox / Bookings morph layouts
- [ ] Maestro captures per preset under `w4-tenant/.../mobile/`

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Initial contract + mobile implementation |
