# Program engineering exit — R1 · R2 · R3

**Updated:** 2026-05-31  
**Authority:** [`product/PLATFORM-RELEASE-PROGRAM.md`](../product/PLATFORM-RELEASE-PROGRAM.md)

There is **no R4** in the release program. After R3, engineering continues on **R∞ (north star)** — incremental moves from `now/` → `v3/` → `northstar/` without re-architecting.

---

## Release status (in-repo)

| Release | Engineering | Living doc |
|---------|-------------|------------|
| **R1** | **Closed** | [`R1-BUILD-STATUS.md`](./R1-BUILD-STATUS.md) |
| **R2** | **Closed** | [`R2-BUILD-STATUS.md`](./R2-BUILD-STATUS.md) |
| **R3** | **Closed** | [`R3-BUILD-STATUS.md`](./R3-BUILD-STATUS.md) |
| **R∞** | Ongoing | [`LIVIA-EVOLUTION-SCREENS.md`](../design/LIVIA-EVOLUTION-SCREENS.md) |

---

## What “fully done” means

**Done in this repo:** programmatic surfaces, policy hub, guest tokens, support registry, preset promotion matrix, vertical factory, headless lifecycle script, mobile parity audit, v3 evolution asset gate.

**Not done in this repo (founder / field / time):**

- Production `LIVIA_PRESENTATION_PRESETS=true` after founder UAT  
- Gate 2: 10 real Dublin shops, Stripe prod evidence, App Store  
- North-star density on every screen family  
- WhatsApp Liv Personal · custom domains · partner API (G14)

---

## Weekly engineering cadence (R∞)

| Command | Purpose |
|---------|---------|
| `pnpm run typecheck` | Contract health |
| `pnpm vertical:check` | Vertical + preset registry |
| `pnpm r3:exit-verify` | R3 regression bundle |
| `pnpm evolution:v3-check` | Gallery v3 tier assets |
| `pnpm mobile:parity-audit` | Mobile P2 hooks |
| `pnpm exec:hat-work` | Track H work events (non-trivial sessions) |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-31 | R1–R3 engineering exit declared; R∞ cadence documented |
