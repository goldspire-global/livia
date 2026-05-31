# Railway deploy — API (livia-api)

**Symptom:** `railway up` fails with **413 Payload Too Large** (~277MB).

**Cause:** CLI uploads the **linked directory** (usually repo root). Without `.railwayignore`, `node_modules` and other artifacts are included.

---

## Recommended: GitHub deploy (production / staging)

1. Railway project → **api-server** service → **Settings → Source** → connect **GitHub** repo `Livia`.
2. Set **Root Directory** to `/` (monorepo root).
3. Set **Build** / **Start** per service (Nixpacks or Dockerfile) — Railway runs install on their builders, not your laptop upload.
4. Push to `main` → auto deploy.

Use `railway logs` and `railway status` locally; avoid `railway up` for routine releases.

---

## If you must use `railway up` locally

From repo root (after `railway link` → **livia-api** / staging):

```bash
railway up
```

Repo includes **`.railwayignore`** at root to drop `node_modules`, mobile, dashboard, e2e, docs, etc. Upload should be source-only (~few MB).

If it still fails: confirm you are linked to **api-server**, not a meta service, and run `git status` — untracked huge folders may need adding to `.railwayignore`.

---

## Env sync (`pnpm railway:sync-env`)

Does **not** read git. Requires a local secrets file:

```bash
pnpm railway:build-prod-env --write
# merges railway.env.example + .env → railway.production.env (gitignored)
# edit railway.production.env if anything is missing
pnpm railway:sync-env
```

Or manually:

```bash
cp railway.production.env.example railway.production.env
# fill secrets
pnpm railway:sync-env
```

**Staging variables:** paste from `railway.env.staging.example` in the Railway dashboard (see [`STAGING-MANUAL-CHECKLIST.md`](./STAGING-MANUAL-CHECKLIST.md)).

---

## Quick checks

| Command | Purpose |
|---------|---------|
| `railway status` | Linked project / service / environment |
| `railway logs` | Tail api-server |
| `pnpm smoke:staging` | Health after deploy |
