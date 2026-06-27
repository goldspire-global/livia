# Inngest production runbook

**Owner:** founder + engineering  
**Wedge workflows:** booking-reminder, weekly-digest, liv-was-wrong, no-show-recovery, booking-continuity, liv-learning-on-usage

**Verify anytime:** `pnpm inngest:prod:verify`

---

## Prerequisites

1. [Inngest Cloud](https://app.inngest.com/) app created (app id in code: **`livia`**)
2. Railway **production** `@workspace/api-server` env:
   - `INNGEST_EVENT_KEY` — from Inngest → app → **Manage → Event Keys**
   - `INNGEST_SIGNING_KEY` — from Inngest → app → **Signing Key**
   - `WORKFLOWS_DISABLED` — **unset** or `false` (was `true` on Railway until 2026-06-27)
3. API deployed with workflow bundle (`artifacts/api-server/src/workflows/index.ts`)
4. Serve URL registered in Inngest dashboard

---

## Railway CLI (production)

From repo root (linked service: `@workspace/api-server`):

```powershell
# Check current state
pnpm inngest:prod:verify

# After copying keys from Inngest Cloud:
railway variables --set "INNGEST_EVENT_KEY=inn_..." --environment production
railway variables --set "INNGEST_SIGNING_KEY=signkey-..." --environment production
railway variables --set "WORKFLOWS_DISABLED=false" --environment production

# Redeploy so env is picked up
railway up --environment production
```

**Do not commit keys.** Use Railway dashboard if you prefer UI over CLI.

---

## Inngest Cloud dashboard

1. **Apps → Create** (or open existing `livia` app)
2. **App → Sync → Serve URL:** `https://api.livia-hq.com/api/inngest`
3. Confirm **Synced** and **~31 functions** (count may drift with releases)
4. **Events → Send test event:**
   - Name: `support/liv_error.reported`
   - Data: `{ "businessId": "<demo-id>", "ticketId": "prod-smoke-1", "description": "Inngest prod smoke test" }`
5. **Runs** — confirm `liv-was-wrong-triage` completed (or failed with known missing biz — still proves pipe)

---

## Local dev (reference)

```bash
pnpm dev:api:restart
# .env: INNGEST_DEV=1
npx inngest-cli@latest dev -u http://127.0.0.1:3000/api/inngest --no-discovery
```

Open http://127.0.0.1:8288 — do **not** register `:5173` (Vite dashboard).

**Trigger limit:** functions may have at most **10 event triggers** each. Multi-source fan-in (e.g. briefing refresh) uses internal events from `publishDomainEvent`.

---

## Deploy checklist

1. Deploy API with latest workflow bundle
2. Set Railway env keys + `WORKFLOWS_DISABLED=false`
3. Register Serve URL in Inngest Cloud
4. `pnpm inngest:prod:verify` → all pass
5. Send test event; confirm run in Inngest dashboard
6. Optional: create booking within 25h on pilot shop → `booking-reminder-t24` scheduled

---

## Rollback

```powershell
railway variables --set "WORKFLOWS_DISABLED=true" --environment production
```

API keeps serving; workflows no-op (cron fallbacks where implemented).

---

## Monitoring

- Failed runs → Inngest dashboard + Sentry + internal ops
- Partner-visible: reminder SMS/email delivery logs (Resend/Twilio)
- Internal: `GET /api/internal/ops/platform-health` includes `inngestEnabled` when configured
