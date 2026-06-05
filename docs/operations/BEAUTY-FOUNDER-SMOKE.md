# Beauty founder smoke — 5-path walkthrough

**Demo:** `bloom-beauty-dublin`  
**Preset:** `beauty-noir-dusk` (default)  
**Program:** [`BEAUTY-VERTICAL-PROGRAM.md`](../product/BEAUTY-VERTICAL-PROGRAM.md)

Sign-off closes L8 for beauty heartland. Run on local stack (API `:3000`, dashboard `:5173`) or staging.

---

## Preflight

```bash
pnpm demo:provision
```

Log in as `owner-bloom@demo.livia-hq.com`. Confirm preset in Settings → Guest look.

---

## Path 1 — Discover treatments (P0)

| Step | Expect |
|------|--------|
| Open sidebar | **Treatments** nav item visible (not hidden URL only) |
| `/services` | Title uses treatment vocabulary; beauty quick-add chips |
| Add treatment | Category + template (e.g. Lash fill) → saves |
| `/b/bloom-beauty-dublin` | New treatment appears on storefront |

---

## Path 2 — Today + inbox (wow morphs)

| Step | Expect |
|------|--------|
| `/dashboard` with **Noir Dusk** | `data-testid="beauty-morph-today-split-inbox"` — inbox column dominates |
| Settings → switch **Editorial** → reload `/dashboard` | `beauty-morph-today-menu-card` — treatment menu cards |
| Switch **Premium Dark** | `beauty-morph-today-cockpit` — KPI strip + horizontal glow queue |
| Switch **Soft Studio** | `beauty-morph-today-atrium` — station swimlanes |
| `/inbox` | Beauty inbox shell; DM threads |
| Pending copy | Beauty pending labels (not generic salon photos line) |

---

## Path 3 — Schedule + book

| Step | Expect |
|------|--------|
| Nav **Schedule** | Bookings list |
| Open appointment | **Client & treatment** detail copy |
| Guest `/b` | Patch-test guard on lash book |

---

## Path 4 — New signup (heartland)

| Step | Expect |
|------|--------|
| Create beauty business | Onboarding starts at **Build your treatment menu** (a3 not auto-done) |
| Activation card | First step links to `/services` |

---

## Path 5 — Tenant announcement

| Step | Expect |
|------|--------|
| `GET /me/tenant-experience` | `announcement.operatorShell` = `beauty-inbox-nav` |
| Capabilities | `treatment-menu-setup` in ready list |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | Initial smoke paths after wellness-style P0 pass |
| 2026-06-03 | Path 2: four preset Today morph sign-off |
