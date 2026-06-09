# Liv Runtime Specification

**Status:** canonical Volume E (2026-06-05)  
**Audience:** founder, engineering, product, AI engineers, Cursor  
**Companion (implementation detail):** [`LIV-OPERATING-SYSTEM.md`](./LIV-OPERATING-SYSTEM.md)  
**Repo hub:** `lib/liv-runtime`, `artifacts/api-server/src/lib/liv-runtime-deps.ts`, `ai-chat.service.ts`

---

## Executive finding

Most companies add AI. Livia is built around **intelligence**.

Liv's purpose is not chat. Liv's purpose is **business assistance**.

```text
What does the business need? → Then determine whether AI helps.
```

---

## First principle

**Liv is not a chatbot.** This rule must never be broken.

| Liv is not | Liv is |
|------------|--------|
| ChatGPT inside Livia | Operating Intelligence |
| FAQ engine | Setup + operations + navigation (V1) |
| Marketing gimmick | Governed tool orchestrator |

Liv helps businesses: launch, operate, understand, improve, grow.

Liv does **not** own data, business logic, or understanding. Liv **orchestrates**.

---

## Architecture position

```text
Business → Capabilities → Events → Business Twin → Liv → User
```

Liv sits **above** the platform feature layer — not inside individual features.

---

## Six internal layers

| Layer | Responsibility | Owner |
|-------|----------------|-------|
| **1. Context** | What is happening right now? | Runtime (temporary) |
| **2. Understanding** | What does it mean? | **Business Twin** — Liv never creates this |
| **3. Reasoning** | What should happen next? | Runtime |
| **4. Recommendations** | Suggested actions/config | Runtime |
| **5. Actions** | Execute via tools only | Runtime |
| **6. Learning** | Improve from outcomes | Runtime (future) |

### Context sources

Business, role, device, capabilities, Twin outputs, recent events, relationships, trust, commerce, current page/task.

Context is **curated** — not entire platform history.

---

## Tool system

Liv acts **only through registered tools**. Never directly through entities or SQL.

```text
User intent → Liv understands → checks capability + permissions → calls tool → returns result
```

### Example tool sets (by capability)

| Capability | Tools |
|------------|-------|
| Bookings | `create_booking`, `cancel_booking`, `reschedule_booking`, `check_availability` |
| Messaging | `send_message`, `create_campaign`, `schedule_message` |
| Reviews | `request_review`, `respond_to_review` |

**Repo:** `lib/liv-runtime/src/registry.ts` — 15+ tools with risk levels, profiles, entitlements. `execute-tool.ts` enforces capability tokens.

---

## Permissions model

Derived from: role, capabilities, policies, trust.

Example: receptionist asks to delete customer → Liv checks permissions → refuses if not allowed.

**Repo:** `liv-mandate.ts`, `mandate-gated-tool.service.ts`, autonomy rungs R0–R4.

---

## Liv modes (evolution)

| Mode | V1 | Future |
|------|-----|--------|
| **Guide** | ✅ Primary — setup, training, navigation | |
| **Operator** | Partial — booking/message actions | Full transactional |
| **Advisor** | — | Recommendations from Twin |
| **Analyst** | — | Twin interpretation, trends |

Same Liv. Different behaviour per context — not different Liv products.

---

## Memory model

| Memory type | Owner |
|-------------|-------|
| Platform / business understanding | Business Twin |
| Conversation thread | Conversation layer |
| Lightweight interaction prefs | Liv runtime |

Liv is not the database.

---

## Personality

**Attributes:** helpful, professional, competent, calm, direct, proactive.

**Not:** funny, chaotic, overly human, gimmicky.

**Forbidden:** Beauty Liv, Tattoo Liv, Clinic Liv. Allowed: **Liv + context** → vertical awareness without fragmentation.

---

## Recommendations (future standard)

Every recommendation contains:

```yaml
recommendation: string
reason: string
evidence: object
expected_outcome: string
confidence: high | medium | low
```

---

## Escalation

Escalate when: uncertain, policy conflict, compliance risk, trust risk. AI should not guess.

**Repo:** `resolveLivDecision()` in mandate service; audit chain for tool calls.

---

## V1 focus (non-negotiable)

Liv V1 = **business launch assistant**:

- Create services  
- Connect payments  
- Publish booking page  
- Add staff  

Examples: "Help me add staff." / "How do I connect Stripe?" / "How do I publish my booking page?"

That is enough to prove value.

---

## Repo status (2026-06-05)

| Area | Status |
|------|--------|
| Tool registry + execution | ✅ Strong |
| Vertical pack prompt loading | ✅ Strong |
| Mandate gating + audit | ✅ Strong |
| Runtime profiles | ⚠️ `tenant_public`, `tenant_staff`, `livia_internal` — not full mode matrix |
| Tool matrix completeness | ⚠️ Several `planned`/`partial` in `liv-tool-matrix.ts` |
| Twin consumption | ⚠️ Briefing/signals partial — not structured Twin API |
| Wellness-specific tools | ⚠️ Registered; thinner execution vs core booking |

**Assessment:** EXISTS_STRONG for V1 spine; gap is Twin integration and mode depth.

---

## Evolution roadmap

```text
Phase 1: Assistant (V1) ← current
Phase 2: Operator
Phase 3: Advisor
Phase 4: Analyst
Phase 5: Business Partner
```

---

## Anti-patterns (forbidden)

- ChatGPT wrapper with no tools  
- Tool-free Liv (prompt-only side effects)  
- Direct database access from Liv  
- Duplicate business logic in prompts  
- Twin duplication inside Liv prompts  
- Hardcoded vertical intelligence in `ai-chat.service.ts`  

---

## Integration summary

| System | Question |
|--------|----------|
| Business Twin | What do we know? |
| Liv | What should we do? |
| Capability Graph | What is possible? |
| Experience OS | How should this appear? |

---

## Final rule

Liv should not ask *what do you want me to do?* when the platform already knows. Long-term goal: **proactive intelligence**, not reactive conversation.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-05 | Volume E canonical — repo status + V1 boundary |
