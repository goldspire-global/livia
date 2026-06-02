# W2 Gateway — platform skins

**Routes:** `/demo`, `/demo/wedge/:vertical`, `/sign-in`, `/sign-up`, `/onboarding` (portal shell)

## Demo only

| File | Route |
|------|-------|
| `demo/g1-wedge-web.target.png` | `/demo` — **locked** |
| `demo/g1-wedge-mobile.target.png` | `/demo` (mobile) — **locked** |
| `demo/g2-wedge-story.target.png` | `/demo/wedge/:vertical` beats 1–3 — **locked** |
| `demo/g3-demo-enter.target.png` | Beat 4 / role pick — **locked** (tap role → demo) |
| `demo/DEMO-FLOW.md` | G1→G2→G3→W4 flow + inheritance |

**Founder lock 2026-06-02:** G1 (web + mobile), G2 story, G3 enter, sign-in gateway (web + mobile).

This skin **does not** apply to tenant `/dashboard` or `/b`.

## Sign-in

See [`LIVIA-TARGET-VISUALS.md`](../../LIVIA-TARGET-VISUALS.md) §4 — gateway shell with **adaptive preview** of tenant preset after identify.

| File | Notes |
|------|-------|
| `sign-in/gateway-default.target.png` | **Locked** — Liv colleague story; `w2.gateway.sign-in.web` (1280×800) |
| `sign-in/gateway-default-mobile.target.png` | **Locked** — same story stacked; `w2.gateway.sign-in.mobile` (390×844) |
| `sign-in/preview-beauty-soft-studio.target.png` | Adaptive preset preview after identify (deferred) |
