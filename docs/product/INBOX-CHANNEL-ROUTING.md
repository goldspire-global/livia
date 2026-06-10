# Inbox channel routing

**Status:** Shipped (v2)  
**Policy hub:** `lib/policy/src/inbox-channel-routing.ts`  
**API:** `artifacts/api-server/src/services/conversations.service.ts`  
**Surfaces:** dashboard `/inbox`, mobile Inbox + conversation thread

---

## What “one inbox” means

**One inbox** is a single operational queue and guest identity — not a single merged chat thread.

| Layer | Meaning |
|-------|---------|
| **Queue** | Owner sees every guest need in one inbox (filters: needs you, Liv on, channel). |
| **Guest** | One `customerId` with memory, bookings, and channel identities. |
| **Delivery** | Each async channel is its own **thread** (delivery pipe). Replies go on **that thread’s channel**. |

Product line (vertical innovation): *“Answers on SMS/DM where they asked.”* That is **reactive** routing — reply in the thread where the guest wrote.

---

## Data model

```text
Customer (identity hub)
  ├── channel_identities (WA id, IG id, phone, email…)
  ├── lastInboundChannel / lastInboundAt   ← proactive routing hint
  ├── lastOutboundChannel / lastOutboundAt
  ├── preferredModality (guest-controlled where possible)
  └── Conversations (one per business + channel + participant)
        └── conversation_messages (append-only)
```

### Thread key

A conversation is keyed by:

- `businessId`
- `channel` (WEB, SMS, WHATSAPP, INSTAGRAM, MESSENGER, EMAIL, VOICE)
- participant address (`customerPhone` — E.164 for WA/SMS, `meta:{id}` for IG/Messenger)

### Example: Instagram then WhatsApp

1. Mary DMs on **Instagram** → thread A (`channel=INSTAGRAM`).
2. Later she WhatsApps **“running 5 late”** → thread B (`channel=WHATSAPP`), same `customerId` when identities link.
3. Reply in thread A → **Instagram**. Reply in thread B → **WhatsApp**.
4. Liv memory and customer profile span both; threads are not merged.

---

## Routing rules

### Reactive (guest just messaged / staff replying in thread)

**Invariant:** `outbound.channel === conversation.channel`

- Staff compose in thread T → `sendStaffMessage` delivers on T’s channel.
- Liv inbound handlers append USER message and reply on the same channel.
- We **never** auto-switch the send target because the guest messaged elsewhere yesterday.

UI always shows: *“Replies send on {channel}”* and compose placeholder *“Reply on {channel}…”*.

### Proactive (reminders, aftercare, Liv initiates)

Uses `resolveOutboundChannel` in `lib/policy/src/guest-care-automation.ts` with this priority:

1. Guest **`preferredModality`** when set and reachable (not `ANY`).
2. When `preferredModality === ANY` and **`lastInboundChannel` is fresh** (≤ 90 days): route as if the guest preferred that channel — honours *“Where I last messaged you”*.
3. Existing aftercare rules: continuity thread, SMS fallback, email, etc.

Touchpoints update on:

- **Inbound:** `appendMessage` with `role=USER` → `recordCustomerInboundTouch`
- **Outbound:** `appendMessage` with `role=ASSISTANT` → `recordCustomerOutboundTouch`

### Cross-channel operator actions

| Action | Behaviour |
|--------|-----------|
| Open sibling thread | Banner + chips when same `customerId` has other OPEN/HANDED_OFF threads |
| “Continue on WhatsApp” (future) | Explicit template/opt-in — not silent channel hop |
| Auto-merge threads | **Not supported** — breaks delivery audit and Meta/WhatsApp windows |

---

## API

### `GET /businesses/:businessId/conversations/:conversationId`

Returns:

- `conversation` — thread metadata
- `messages` — message list
- `siblingThreads` — other open threads for same `customerId` (different channel)

### `POST .../messages`

Staff reply; always routes via `conversation.channel`.

---

## UI (web + mobile)

| Surface | Behaviour |
|---------|-----------|
| Thread list | Badge *“N channels”* when same guest has multiple active threads |
| Thread detail | Sibling banner with *Open {channel}* switcher |
| Compose | Channel hint + cross-channel education note |

Copy is policy-driven (`@workspace/policy`) — do not hardcode in surfaces.

---

## Identity linking

- **Auto-link** on inbound via `upsertChannelIdentity` + `attachCustomer` (Meta inbound).
- **Merge suggestions** for staff on fuzzy matches (`identity-merge-suggestions.service`).
- Do not silently merge unrelated identities.

---

## Scale notes

- Indexes: `conversations(businessId, status)`, participant lookup per channel.
- Touchpoints: O(1) update on message append — no history scan per send.
- Webhook idempotency: `message_logs.externalMessageId` (Meta/SMS).

---

## Non-goals (current)

- Single merged thread with per-message delivery channel in one row.
- Auto channel-hopping on human reply while viewing another thread.
- Grouped inbox row by `customerId` (list still thread-based; badge hints only).

---

## Verification

- Policy: `lib/policy/src/__tests__/inbox-channel-routing.test.ts`
- E2E: `e2e/tests/inbox-channel-routing.spec.ts` (reply channel hint visible)
- Manual: open demo inbox → select thread → confirm channel hint and compose placeholder.

---

## Cascade checklist

| If you change… | Also update… |
|----------------|--------------|
| Routing rules | `inbox-channel-routing.ts`, this doc |
| Proactive sends | `guest-care-automation.ts`, aftercare service |
| API shape | `openapi.yaml` → `pnpm codegen` |
| Copy | Mobile + dashboard inbox (thin renderers) |
