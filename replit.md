# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Bliq Application

Multi-tenant, AI-native operating system for appointment-based service businesses.

### Artifacts

- `artifacts/api-server` — Express 5 + Drizzle + Postgres REST API. Mounted at `/api`. Auth via Clerk (`@clerk/express`).
- `artifacts/bliq-dashboard` — React + Vite owner dashboard mounted at `/`. Auth via `@clerk/clerk-react`. Public booking page at `/b/:slug` lives outside auth guard.
- `artifacts/mockup-sandbox` — design preview sandbox.

### Packages

- `lib/db` — Drizzle schema (12 tables), DB client, enums, status-transition helpers.
- `lib/api-spec` — OpenAPI source, `pnpm codegen` regenerates `lib/api-zod` (Zod schemas) and `lib/api-client-react` (React Query hooks).

### Key Design Decisions

- Booking creation is conflict-safe: wrapped in a Drizzle transaction with `pg_advisory_xact_lock` keyed by `businessId:staffId`, then conflict check + insert. This prevents double-booking under concurrent requests.
- Slot generation is timezone-aware via `artifacts/api-server/src/lib/tz.ts` (uses `Intl.DateTimeFormat` longOffset to convert IANA tz local time to UTC). Day boundaries and weekday selection use the business timezone.
- Centralized error middleware in `app.ts` returns JSON `{error: "..."}` for unknown routes (404) and uncaught exceptions (500).
- Clerk dev keys: `proxyUrl` only set in production builds (`import.meta.env.PROD`). In dev, the dashboard talks to Clerk directly.
- Generated React Query hooks use `{ query: UseQueryOptions<...> }` shape — pass enabled flags via `query: { enabled: ... } as any` cast.

### Env vars

- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — server (api-server)
- `VITE_CLERK_PUBLISHABLE_KEY` — dashboard
- `DATABASE_URL` — Postgres
