# Beauty & nails — W4 target visuals

**Policy presets:** `beauty-noir-dusk` (default), `beauty-soft-studio`, `beauty-editorial`, `beauty-premium-dark`, plus `platform-default`.

## Approved targets (founder)

| Preset | Dashboard solo | Inbox (owner) | Dashboard manager | Settings (owner) |
|--------|----------------|---------------|-------------------|------------------|
| **noir-dusk** | `presets/noir-dusk/dashboard-owner-solo.target.png` | — | — | `presets/noir-dusk/settings-appearance-owner.target.png` |
| **soft-studio** | `presets/soft-studio/dashboard-owner-solo.target.png` | — | `dashboard-manager.target.png` | `settings-appearance-owner.target.png` |
| **editorial** | `presets/editorial/dashboard-owner-solo.target.png` | `inbox-owner.target.png` | `dashboard-manager.target.png` | `settings-appearance-owner.target.png` |
| **premium-dark** | `presets/premium-dark/dashboard-owner-solo.target.png` | `inbox-owner.target.png` | `dashboard-manager.target.png` | `settings-appearance-owner.target.png` |

**Editorial (founder lock 2026-06-02):** menu-card owner home, handoff-grid manager, editorial inbox; W5 keeps `book-mobile.target.png`.

**Premium-dark (founder lock 2026-06-02):** glow-card owner home, manager cockpit, premium inbox; W5 keeps `book-mobile.target.png`.

**Mobile W4m (founder lock 2026-06-02 — approved):** [`noir-dusk/mobile`](presets/noir-dusk/mobile/README.md) (4) · [`editorial/mobile`](presets/editorial/mobile/README.md) (4) · [`premium-dark/mobile`](presets/premium-dark/mobile/README.md) (7) — all `*.target.png`.

Re-sync from Cursor exports: `node scripts/organize-beauty-target-visuals.mjs`

## Settings surface (owner)

**Job:** configure shop + **pick skin** + preview `/b` — not day-to-day ops.

| Tier | Tabs / blocks |
|------|----------------|
| **Primary** | Appearance — 4 preset cards + live mobile `/b` preview |
| **Primary** | Shop — name, slug, booking link, timezone |
| **Deferred** | Liv, Comms, Policy, Billing — disclosures / other tabs |

Same tab structure for every skin; only `data-presentation` tokens change.

## Inheritance

`html[data-presentation]` from `applyPresentationTheme` → all W4 routes + W5 `/b` for that tenant.

**One preset per shop** — Settings → Appearance changes dashboard and `/b` together ([`SKIN-BRAND-INHERITANCE-SPEC.md`](../../SKIN-BRAND-INHERITANCE-SPEC.md) §4.4). Canonical demo **Bloom** seeds **`beauty-noir-dusk`** (this folder’s `noir-dusk/` targets), not soft-studio.

**W5 `/b` targets:** [`../../w5-public/beauty/README.md`](../../w5-public/beauty/README.md) — `book-mobile.target.png` per preset.
