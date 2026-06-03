# Liv setup copilot — configure the shop through conversation

**Status:** canonical product spec (2026-06-02)  
**Audience:** founder, product, engineering, design  
**Origin:** product working session — Liv as OS configuration layer, not only ops/inbox assistant  
**Authority:** [`LIV-OPERATING-SYSTEM.md`](./LIV-OPERATING-SYSTEM.md) · [`EXPERIENCE-ARCHITECTURE.md`](../design/EXPERIENCE-ARCHITECTURE.md) · [`TENANT-EXPERIENCE-CONTRACT.md`](./TENANT-EXPERIENCE-CONTRACT.md)

---

## 1. Thesis

**Livia** is an operating system; **Liv** is its intelligence layer. Today Liv is strongest on **operations** (book, inbox, drift, briefing). Owners still **configure** the OS mostly through Settings forms and onboarding deep-links (`a6_liv` → Settings → Liv).

**Setup copilot** closes that gap: the same Liv character helps owners **style the shop**, **finish onboarding**, and **change policy** through conversation — with the same tool registry, policy resolver, audit trail, and confirm ladder as booking tools.

**Category line:** Forms are the compiler; Liv is the fast path for people who run the business by talking, not by hunting tabs.

**Anti-pattern:** A chat sidebar that mutates CSS or bypasses `@workspace/policy`. Every write is a **registered tool** hitting the same APIs as Settings → Appearance / Policy / Liv.

---

## 2. Two Liv modes (one runtime)

| Mode | Job | Frequency | Tool profile |
|------|-----|-----------|--------------|
| **Ops copilot** | Run the day — book, inbox, drift, voice | High | Scheduling, messaging, briefing (mostly **live** today) |
| **Setup copilot** | Shape the shop — skin, brand, hours, Liv voice, policy | Low | Configure tools (**planned** — this doc) |

Same `businessId` runtime, same voice register ([`brand-of-livia-and-liv.md`](../company/brand-of-livia-and-liv.md)). Filter tools by `surfaceId`, persona, and `livMode: "setup" | "ops"`.

Internal Liv already follows **propose → human commits** ([`LIV-OPERATING-SYSTEM.md`](./LIV-OPERATING-SYSTEM.md) §5). Tenant setup uses the same ladder at medium/high risk.

---

## 3. What setup copilot may configure

Aligned with the five-layer experience model ([`EXPERIENCE-ARCHITECTURE.md`](../design/EXPERIENCE-ARCHITECTURE.md)):

| Layer | Owner intent (examples) | Liv may | Liv may not |
|-------|----------------------|---------|-------------|
| **Presentation** | “Bold barber look, not spa-soft” | List allowed presets for vertical → preview → apply after confirm | Invent preset IDs; change routes |
| **Brand** | “Warmer accent, here’s our logo” | Patch logo/cover/accent via API | Raw CSS |
| **Liv persona** | “Professional but warm; only book colour when I’m free” | Patch `aiTone`, greeting, knowledge, booking flags | Free-text policy bypass |
| **Operational policy** | “48h cancel; deposit for new clients” | Explain jurisdiction default → typed patch | Legal advice; silent money rules |
| **Hours / profile** | “Closed Mondays; add our city” | Propose validated patches | Guess regulatory fields |
| **Onboarding acts** | Finish blocking setup in one thread | Complete `a2`, `a5`, `a6`, `a8` when tools succeed | Skip go-live consent |
| **Channels** | “Connect WhatsApp” | Start OAuth / settings handoff | Store tokens in chat |
| **Team** | “Add Lara Tue–Sat for colour” | Invite + assign (confirm card) | Grant owner to wrong person |

**Hard rule:** **Vertical** (capability pack) is not a Liv toggle — admin migration only.

**Public parity:** `/b/{slug}` uses the same preset + brand as dashboard ([`TENANT-EXPERIENCE-CONTRACT.md`](./TENANT-EXPERIENCE-CONTRACT.md)). Apply skin only after owner confirms preview ([`PUBLIC-SKIN-LIVE-UPDATE.md`](../design/PUBLIC-SKIN-LIVE-UPDATE.md) spirit).

---

## 4. UX ladder (all configure writes)

```text
suggest → preview (dashboard + /b) → explicit confirm → apply → invalidate tenant-experience
```

| Risk | Example tools | Confirm |
|------|---------------|---------|
| Low | `get_tenant_experience`, `list_presentation_presets`, `explain_operational_policy` | None |
| Medium | `preview_presentation`, `patch_liv_persona`, `patch_brand_assets` | Inline preview + “Apply” |
| High | `apply_presentation_preset`, `propose_policy_patch`, `invite_staff` | Confirmation card + audit |

Every apply: `appendHumanAudit` + eval trace (same as ops tools). Settings forms remain the **power-user and a11y** path; chat is not a prison.

---

## 5. Surfaces

| Surface | `surfaceId` (target) | Entry |
|---------|----------------------|--------|
| Dashboard owner setup | `tenant.owner.setup` | Persistent Liv entry on Settings, Appearance, onboarding `a6_liv` |
| Onboarding portal | `tenant.onboarding.setup` | Optional “Talk to Liv” beside form path |
| Mobile owner | `tenant.owner.setup.mobile` | Slim: skin preview link + Liv persona; defer heavy policy to web |

**Onboarding today:** `a6_liv` deep-links to `/settings?tab=liv` (forms). **Target:** primary path “Talk to Liv” with form escape hatch ([`LIVIA-PLATFORM-LIFECYCLE.md`](./LIVIA-PLATFORM-LIFECYCLE.md) §3.3).

**Reuse:** Dashboard `public-appearance-panel` APIs and preview iframes — no duplicate preset catalog in prompts ([`artifacts/livia-dashboard/src/components/settings/public-appearance-panel.tsx`](../../artifacts/livia-dashboard/src/components/settings/public-appearance-panel.tsx)).

---

## 6. Tool registry (planned rows)

SSOT when implemented: `lib/liv-runtime/src/registry.ts` + [`liv-tool-matrix.ts`](../../lib/policy/src/liv-tool-matrix.ts) + [`LIV-TOOL-REGISTRY-MATRIX.md`](./LIV-TOOL-REGISTRY-MATRIX.md).

| Tool id | Risk | Release phase |
|---------|------|---------------|
| `get_tenant_experience` | low | I-A |
| `list_presentation_presets` | low | I-A |
| `preview_presentation` | low | I-A |
| `apply_presentation_preset` | medium | I-A |
| `patch_brand_assets` | medium | I-A |
| `patch_liv_persona` | medium | I-A |
| `explain_operational_policy` | low | I-B |
| `propose_policy_patch` | high | I-B |
| `patch_business_hours` | medium | I-B |
| `confirm_public_link` | medium | I-B (onboarding) |
| `start_channel_connect` | low | I-C (handoff) |
| `invite_staff` / `assign_service` | high | I-C |

Ops tools (`find_slots`, `send_message`, …) stay disabled in `livMode: "setup"` unless user explicitly switches context.

---

## 7. Event hooks

| Event | Setup copilot behaviour |
|-------|-------------------------|
| `onboarding.act.completed` | Coach next blocking act in thread ([`LIV-OPERATING-SYSTEM.md`](./LIV-OPERATING-SYSTEM.md) §7) |
| `presentation_preset.changed` | Summarise what changed on `/b`; optional gentle public refresh banner (Track D) |
| Procedural memory | “Always Lara for colour” → suggest-only rule until owner pins (R3) |

---

## 8. Build program — Track I

**Program owner:** [`PLATFORM-EVOLUTION-AND-OPS-PROGRAM.md`](./PLATFORM-EVOLUTION-AND-OPS-PROGRAM.md) §7f  
**Release:** **R2** (after R1 founder sign-off); Phase I-A can start in parallel with Track D Appearance polish  
**Depends on:** Track D2 (`presentation_preset_id` + PATCH), tenant-experience resolver, liv-runtime registry, mandate gating  
**Estimate:** ~8–12 eng-days (I-A through I-C)

### Phase I-A — Skin + Liv persona (demo slice)

- Register configure tools; `surfaceId` `tenant.owner.setup`
- Wire Appearance PATCH paths; preview dashboard + `/b`
- Entry: Settings → Appearance “Ask Liv” + onboarding `a6_liv` optional thread
- E2E: preset change with confirm + audit row

### Phase I-B — Onboarding + policy

- Onboarding thread completes blocking acts where tools succeed
- `explain_operational_policy` / `propose_policy_patch` (typed, not `aiKnowledge` soup)
- Hours + public link confirm

### Phase I-C — Team + channels

- Invite/assign with confirm cards
- Channel connect handoff (OAuth URLs, not token in chat)

**Exit:** Owner can say “make it bolder” and see dashboard + booking page update after one confirm; onboarding completable via Liv or forms; matrix rows 🔨→✅.

---

## 9. Verification

| Gate | Command / doc |
|------|----------------|
| Policy hub | No preset list duplicated in UI — `GET /me/tenant-experience` |
| Registry | New tools in `liv-tool-matrix.ts` + matrix doc |
| Audit | Configure tool calls in audit + eval traces |
| Parity | Web setup path; mobile honest handoff per [`WEB-MOBILE-PARITY.md`](./WEB-MOBILE-PARITY.md) |
| Marketing honesty | Only claim configure-via-Liv when matrix row ✅ |

---

## 10. Related

- [`LIV-OPERATING-SYSTEM.md`](./LIV-OPERATING-SYSTEM.md) — OS thesis, owner tools, events
- [`LIV-TOOL-REGISTRY-MATRIX.md`](./LIV-TOOL-REGISTRY-MATRIX.md) — ship status table
- [`LIVIA-PLATFORM-LIFECYCLE.md`](./LIVIA-PLATFORM-LIFECYCLE.md) — W4 owner setup table
- [`PRESENTATION-PRESETS-AND-ROLLOUT.md`](../design/PRESENTATION-PRESETS-AND-ROLLOUT.md) — preset catalog
- [`../engineering/agent-runtime.md`](../engineering/agent-runtime.md) — per-tenant runtime
- [`V2-ENGINEERING-CLOSED.md`](./V2-ENGINEERING-CLOSED.md) — “Liv learns” = configured per request until procedural memory ships

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-02 | Initial spec — setup vs ops modes, tools, Track I phases, integrated into build plans |
