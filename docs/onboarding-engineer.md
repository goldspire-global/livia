# Engineering onboarding — Livia

Welcome. This is the 30-minute version. For deeper context read `replit.md`, then `docs/launch-plan.md`, then this file's "Things never to do" section.

## What Livia is

Premium AI-native multi-tenant operating system for appointment-based service businesses (beauty/wellness/barber/tattoo/dental). Beachhead: EU/Ireland. The AI character is **Liv** — never marketed at brand level, only disclosed where the EU AI Act and GDPR require.

## Run the repo

```bash
pnpm install
pnpm run typecheck                      # full workspace typecheck
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/bliq-dashboard run dev
pnpm --filter @workspace/bliq-mobile run dev
```

Workflows are managed by Replit; you usually just restart them from the workspace.

### Required env vars

| Var | Where | Purpose |
|-----|-------|---------|
| `DATABASE_URL` | api-server | Neon Postgres connection string |
| `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | api-server | Auth |
| `VITE_CLERK_PUBLISHABLE_KEY` | dashboard | Auth |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` / `EXPO_PUBLIC_DOMAIN` | mobile | Auth + API host |
| `AI_INTEGRATIONS_ANTHROPIC_*` | api-server | Liv (provisioned via Replit AI Integrations) |

### Optional observability env vars (Gate-2 work)

| Var | Where | Purpose |
|-----|-------|---------|
| `SENTRY_DSN_API` | api-server | Server-side error reporting. Omit to disable. |
| `VITE_SENTRY_DSN` | dashboard | Client-side error reporting. Omit to disable. |
| `SENTRY_RELEASE` / `VITE_SENTRY_RELEASE` | both | Release tag (commit hash). Optional. |
| `LOG_LEVEL` | api-server | Pino level — `debug` / `info` (default) / `warn` / `error`. |

Set Sentry secrets via Replit's environment-secrets pane (never hardcoded). Source-map upload to Sentry is a separate follow-up; SDKs work without it.

## Where to start reading

1. `replit.md` — single-page snapshot.
2. `lib/db/src/schema/` — domain model is the truth.
3. `lib/api-spec/openapi.yaml` — API contract is the truth.
4. `artifacts/api-server/src/services/` — business logic.
5. `artifacts/bliq-dashboard/src/pages/` — owner UI.
6. `artifacts/bliq-mobile/app/` — mobile UI.
7. `docs/launch-plan.md` — five lanes / three gates / per-lane backlog.
8. `docs/demo-script.md` — the 90-second walkthrough.

## Brand rules (non-negotiable)

- Aurora tokens for product surfaces (cyan = primary action, violet = AI moment, mint = success). See `replit.md` "Brand — two layers".
- Aurum tokens are **brand-only** — never on action buttons. Sole exception: the celebrate shimmer on booking confirmation.
- Wordmark uses Cormorant Garamond italic *v*. Don't restyle it.
- Voice: precise, calm, slightly poetic. Empty states whisper.

## AI guardrails

- The AI is **Liv**. The product is **Livia**. Marketing surfaces never lead with "AI-powered."
- Disclosure surfaces (required): chat widget first message, ToS, Privacy, public booking page Anthropic AUP line.
- Tool-loop in `artifacts/api-server/src/services/ai-chat.service.ts`. Model: `claude-sonnet-4-6`, max 6 tool hops, two tools (`find_slots`, `create_booking`).

## Observability (Gate 2)

- Logs: structured JSON via `pino-http`. Every request emits `request_id`, `tenant_id` (when in URL), `user_id` (when authed), `method`, `path`, `status`, `responseTime` (ms). Request id is echoed back as `x-request-id` header.
- Errors: Sentry (api-server + dashboard) when DSN is set.
- CI guard: `./scripts/check-codegen.sh` fails if the OpenAPI source and the generated client drift apart. Wired into `.github/workflows/ci.yml`.

## Compliance posture

- EU AI Act Art. 50 — automated-interaction disclosure on every AI surface.
- GDPR Art. 22 — automated-decision-making disclosure in ToS + Privacy.
- Data lives in EU. DPA available on request. SOC 2 Type 1 is on the launch plan.

## Things never to do

- Don't rename the `bliq-mobile` Expo slug or scheme — breaks Google OAuth callback and deep links.
- Don't change `STORAGE_KEY = "bliq_current_business_id"` in mobile `BusinessContext.tsx` — orphans existing devices.
- Don't use Aurum (champagne/cream/bronze) for action buttons.
- Don't surface the name **Olivia** anywhere — repo, copy, UI, tests, comments. (Founder's daughter; private.)
- Don't introduce silent fallbacks. If a required env var is missing, throw at startup.
- Don't bypass the booking conflict-safe transaction in `services/booking.service.ts`.
