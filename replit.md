# Livia

Premium AI-native multi-tenant operating system for appointment-based service businesses (beauty/wellness/barber/tattoo/dental). Beachhead: EU/Ireland. AI character is **Liv**.

## Run & Operate

- `pnpm run typecheck` — full typecheck across all packages.
- `pnpm run build` — typecheck + build all packages.
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks + Zod schemas from OpenAPI.
- `pnpm --filter @workspace/db run push` — push DB schema (dev only).

**Required env vars:** `CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` (api), `VITE_CLERK_PUBLISHABLE_KEY` (web), `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` + `EXPO_PUBLIC_DOMAIN` (mobile), `DATABASE_URL`, `AI_INTEGRATIONS_ANTHROPIC_*` (provisioned via Replit AI Integrations).

**Optional Gate-2 env vars:** `SENTRY_DSN_API`, `VITE_SENTRY_DSN`, `SENTRY_RELEASE` / `VITE_SENTRY_RELEASE`, `LOG_LEVEL`. Sentry SDKs no-op cleanly when DSN is unset.

**Optional Closed-Beta comms env vars (Task #28):** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_DEFAULT_FROM`, `RESEND_API_KEY`, `RESEND_DEFAULT_FROM` (default `Livia <onboarding@resend.dev>`), `PUBLIC_BASE_URL`, `INTERNAL_CRON_SECRET`, `TWILIO_SKIP_SIGNATURE_VALIDATION`. All transports degrade to PENDING-only writes when secrets are absent — no boot failure.

## Stack

pnpm workspace monorepo · TypeScript 5.9 · Node 24 · Express 5 · PostgreSQL + Drizzle ORM · Zod (`zod/v4`) + `drizzle-zod` · Orval API codegen · Vite (web) · Expo (mobile) · Clerk auth · Anthropic Claude (AI).

## Where things live

- `artifacts/api-server` — Express REST API at `/api`. Auth via `@clerk/express`.
- `artifacts/livia-dashboard` — React + Vite owner dashboard. Auth via `@clerk/clerk-react`. Public booking + chat at `/b/:slug`.
- `artifacts/livia-mobile` — Expo iOS/Android. Auth via `@clerk/clerk-expo`. Scheme `livia-mobile://` (legacy `bliq-mobile://` retained as second scheme entry through one release for in-flight OAuth flows).
- `artifacts/livia-marketing` — public marketing site (livia.io v1) at `/livia-marketing/`. Lead form posts to `POST /api/public/marketing/leads`.
- `artifacts/mockup-sandbox` — design preview sandbox (canvas iframes).
- `lib/db` — Drizzle schema (15 tables incl. `marketing_leads` + `conversations`), DB client, enums, status-transition helpers.
- `lib/api-spec` — OpenAPI source. `pnpm codegen` regenerates `lib/api-zod` and `lib/api-client-react`.
- `lib/integrations-anthropic-ai` — Anthropic SDK wrapper wired via Replit AI Integrations.
- `lib/integrations-resend` — fetch-based Resend client + 3 HTML templates (booking confirmation/reminder/cancellation).
- `lib/integrations-twilio` — sendSms, search/purchase/release LocalNumbers, validateTwilioSignature (HMAC-SHA1), TWIML_EMPTY_RESPONSE.

## Architecture decisions

- **Booking creation is conflict-safe:** Drizzle transaction + `pg_advisory_xact_lock` keyed by `businessId:staffId`, then conflict check + insert. Prevents double-booking under concurrency.
- **Slot generation is timezone-aware** via `artifacts/api-server/src/lib/tz.ts` (Intl longOffset → IANA → UTC). Day boundaries + weekday selection use the business timezone, not the server's.
- **AI chat (`services/ai-chat.service.ts`):** Claude tool-loop, `claude-sonnet-4-6`, `MAX_TOOL_HOPS=6`. Two tools: `find_slots` + `create_booking`. System prompt blends business name/category/`aiTone`/`aiGreeting`/`aiKnowledge` + enumerated services. Gated by `business.aiEnabled !== "false"`.
- **API field-name conventions:** Staff/Customer use `displayName` (not `name`); Service uses `priceMinor`; Booking uses `startAt`/`endAt`; list responses use `.data[]`. Generated React Query hooks expose options via `{ query: UseQueryOptions<...> }` — pass enabled via `query: { enabled: ... } as any`.
- **Mobile mutations** use a `data` key: `useCreateBooking({ businessId, data })`.

## Brand — two layers

**Aurora (product surface).** Cinematic midnight base + violet→cyan→mint gradient. Cyan `#06b6d4` is the primary action colour; violet `#8b5cf6` signals automated/Liv moments; mint `#10b981` for success. Tokens live in `artifacts/livia-dashboard/src/index.css` (`--color-aurora-*`) and `artifacts/livia-mobile/constants/colors.ts` (`aurora` export). Utilities `.aurora-gradient`, `.aurora-gradient-text`, `.aurora-glass`, `.aurora-glow` — use sparingly.

**Aurum (wordmark accent).** Champagne/cream/bronze chrome **reserved for the Livia wordmark and the italic *v* only**. Tokens: `--color-aurum-champagne #d9c39a`, `--color-aurum-cream #f6f3ec`, `--color-aurum-bronze #8a7549`. Mobile tokens exported from `colors.ts` as `aurum`. **Never use Aurum on action buttons or section headings.** The one sanctioned exception is the celebrate shimmer (`.celebrate-shimmer`) on booking confirmation.

**Type.** Display = Plus Jakarta Sans. Body/UI = Geist. Data = JetBrains Mono. **Wordmark = Cormorant Garamond** (italic *v*). Radius `0.75rem` (12px).

**Logo mark:** `artifacts/livia-dashboard/src/components/brand/LiviaMark.tsx` exports `LiviaMark`/`LiviaWordmark`. The marketing artifact has its own `LiviaMark.tsx`. No `Bliq*` aliases remain.

**Voice.** Precise, calm, slightly poetic. Empty states whisper, success toasts confirm, AI suggestions invite without pressuring.

**Tagline:** *For barbershops, tattoo studios, dental practices — and every appointment in between.*

## AI character

The AI is **Liv** — the brand's quiet helper. Liv has a name and a personality but is never marketed as the product. The product is Livia; Liv is what's under the hood.

## Compliance guardrails

- **Brand layer is silent on "AI"** — no "AI-powered" badges in marketing. Disclosure happens where it legally must:
  - Chat widget first message + persistent footer (EU AI Act Art. 50 — automated interaction disclosure).
  - Outbound SMS prefix + outbound email block when Liv authors them (Art. 50). Twilio/Resend transports landed in Task #28 — disclosure is applied in `services/ai-outbound.service.ts` *before* persistence so it cannot be bypassed by transport choice.
  - Privacy policy + Terms (GDPR Art. 22 — automated decision-making).
  - Anthropic AUP compliance copy on the public booking page.
- **Disclosure copy is centralised** in the shared `@workspace/ai-disclosure` package (`lib/ai-disclosure/src/index.ts`) and treated as legal text — never paraphrased, never per-business overridable. Both api-server (`src/lib/ai-disclosure.ts` is a thin re-export) and the dashboard `chat-widget.tsx` import from this package, so drift between customer view and Inbox view is structurally impossible. Outbound SMS/email always go through `services/ai-outbound.service.ts` (`sendAiSms`, `sendAiEmail`) which apply the disclosure before persistence; transport is pluggable (Task #28 wires Twilio/Resend).
- **One name to never surface anywhere** in repo, copy, comments, UI, or commits: **Olivia** (founder's daughter — kept private).

## Product surfaces

- **Dashboard (`artifacts/livia-dashboard/src/pages/`):** dashboard (Cockpit), bookings, customers, services, staff, availability, time-off, inbox (AI conversations), settings (General / AI Assistant / Demo & Data), onboarding, sign-in/up, public-booking (`/b/:slug`).
- **Mobile (`artifacts/livia-mobile/app/`):** dashboard, bookings, customers, more (tab), booking detail/new, customer detail, staff list/detail, services, sign-in, onboarding.
- **AI Inbox (shipped May 5):** customers chat → Liv books → owner sees the thread, can take over. Schema in `lib/db/src/schema/conversations.ts`. Public chat: `POST /api/public/b/:slug/chat`. Owner views: `GET /api/businesses/:id/conversations[/:cid]` + `PATCH` for take-over/close. Widget: `components/chat-widget.tsx`. Inbox UI: `pages/inbox.tsx` (polls 10s list / 5s thread, per-IP rate-limited).
- **Cockpit (graduated May 5):** live timeline spine (8am–8pm @ 96px/hour), greedy interval-packing into lanes, current-time marker, action queue + staff-on-shift derived from `summary.upcomingBookings`. Layout `max-width: 1600px`. *Known follow-up: `enrichBooking` in `dashboard.service.ts` is N+1 — batch when latency regresses.*
- **Demo data:** `POST /api/dev/seed` (3 demo businesses, idempotent), `DELETE /api/dev/seed` (wipes calling user's businesses, cascades). Both 403 in production. Reusable component: `components/demo-data-controls.tsx`.

## Auth (Clerk)

- App titles set via provider-level `localization` in `App.tsx` ("Sign in to Livia"). Per-component `localization` does NOT override the provider.
- Aurora theme: `colorPrimary: "#06b6d4"`, `fontFamily: Geist`, `borderRadius: "0.75rem"`.
- Use `signInFallbackRedirectUrl` / `signUpFallbackRedirectUrl` (deprecated `fallbackRedirectUrl` is wrong).
- `proxyUrl` set only in production builds (`import.meta.env.PROD`).
- **Mobile sign-in is fully custom** (not Clerk hosted UI): 3 modes (sign-in / sign-up / verify-OTP), Google OAuth via `useOAuth({ strategy: "oauth_google" })` with `WebBrowser.maybeCompleteAuthSession()` at module scope. Redirect URI generated per-platform via `AuthSession.makeRedirectUri({ scheme: "livia-mobile", path: "oauth-callback" })` — never hardcoded. **External config required before next mobile build ships:** add `livia-mobile://oauth-callback` to Clerk dashboard + Google OAuth allowed redirect URIs (alongside the existing `bliq-mobile://` entries — do NOT remove old until Task #38 follow-up).

## Per-shop comms (Task #28, Closed Beta)

- **Schema:** `businesses.twilioPhoneNumber`, `businesses.twilioPhoneSid`, `businesses.resendFromAddress` — every send resolves these per business, falling back to platform defaults.
- **Boot:** `src/lib/transports.ts::initTransports()` is called from `src/index.ts` and wires the live Twilio/Resend clients into `ai-outbound.service.ts` *only if* both creds are present. Missing creds → transports stay no-op and rows persist with status=PENDING (no boot failure, no silent send).
- **Routes:** `routes/communications.ts` (provisioned-number CRUD, search/buy/release, test-send), `routes/sms-webhook.ts` (Twilio inbound — HMAC validated unless `TWILIO_SKIP_SIGNATURE_VALIDATION=true`, returns empty TwiML), `routes/internal-cron.ts` (24h-before reminder sweep, gated by `INTERNAL_CRON_SECRET` Bearer).
- **Booking lifecycle hooks:** `services/booking-emails.service.ts` is invoked fire-and-forget from `bookings.service.ts` on createBooking + updateBookingStatus(CANCELLED). Reminders run via the cron route.
- **Settings UI:** `components/communications-controls.tsx` mounted as a Card inside the AI tab in `pages/settings.tsx` — owner sees provisioned number, can search by area code → buy → release, edits from-address, and test-sends.

## Observability (Gate-2 floor, Task #25)

- **Sentry**: api-server (`@sentry/node`) + dashboard (`@sentry/react`). Init gated by DSN env vars. Express error handler wired via `Sentry.setupExpressErrorHandler` before the JSON 500 responder. Mobile Sentry deferred — needs Expo native plugin + dev-client rebuild.
- **Structured request logging** via `pino-http`: `request_id` (echoed back in headers), `tenant_id`, `user_id`, `method`, `path`, `status`, `responseTime`. 5xx→error, 4xx→warn.
- **OpenAPI guard:** `scripts/check-codegen.sh` fails on diff in `lib/api-client-react`/`lib/api-zod`/`lib/api-spec`. Wired into `.github/workflows/ci.yml`.
- Source-map upload to Sentry deferred (needs `SENTRY_AUTH_TOKEN`).

## Gotchas

- **Always `pnpm run typecheck` before declaring done** — generated hooks + Zod schemas have strict shapes that ripple.
- **Naming history:** repo was rebranded `bliq` → `livia` in Task #38. Mobile `app.json` keeps `scheme: ["livia-mobile", "bliq-mobile"]` until Clerk + Google OAuth allow lists are pruned; `BusinessContext` runs a one-shot `bliq_current_business_id` → `livia_current_business_id` AsyncStorage migration. `BliqEvent` type renamed to `LiviaEvent`.
- **Aurum is brand-only**, never use champagne for action buttons. Cyan is the primary action colour.
- **`shadow*` / `pointerEvents` deprecation warnings** from React Native Web are expected until Expo upstream ships fixes.

## Pointers

- **Roadmap source of truth:** `docs/launch-plan.md` (5 lanes / 3 gates / weekly review).
- **Operating cadence:** `docs/operating-cadence.md`.
- **Engineer onboarding:** `docs/onboarding-engineer.md` — read first before any PR.
- **Demo script:** `docs/demo-script.md` (90-second founder-narratable walkthrough).
- **Skills used here:** `pnpm-workspace`, `clerk-auth`, `database`, `deployment`, `artifacts`, `react-vite`, `expo`, `canvas`, `mockup-sandbox`, `stripe` (for the Task #32 follow-up).
