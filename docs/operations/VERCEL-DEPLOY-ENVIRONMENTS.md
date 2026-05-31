# Vercel — staging vs production (read this if you got a “Production” email)

**Updated:** 2026-05-31

---

## Why `livia-stg` emailed “Production Deployment”

Vercel uses **Production** for every project’s **production branch** deploy (usually `main`). That is **not** the same as **livia-hq.com production**.

| Vercel term | What it means for `livia-stg` |
|-------------|-------------------------------|
| **Production Deployment** | Latest deploy of `main` on the **staging project** → should only serve `app.staging.livia-hq.com` |
| **Preview Deployment** | PR / other branches on that same project |
| **Production** (domain) | Only if you attached `app.livia-hq.com` to this project — **do not** |

So: **a failed “Production” email on `livia-stg` does not mean we shipped to real customers.** It means the staging app’s main-branch build failed. You have not UAT’d yet; that is expected until the project is configured correctly.

---

## Two dashboard projects (required)

| Vercel project | Root directory | `vercel.json` source | Domain(s) | `VITE_LIVIA_DEPLOY_ENV` |
|--------------|----------------|----------------------|-----------|-------------------------|
| **livia-app** (prod) | `artifacts/livia-dashboard` *or* repo root with root [`vercel.json`](../../vercel.json) | Prod rewrites → `api.livia-hq.com` | `app.livia-hq.com` | `production` or unset |
| **livia-stg** (staging) | **`artifacts/livia-dashboard`** | Use [`vercel.staging.json`](../../artifacts/livia-dashboard/vercel.staging.json) as this project’s `vercel.json` (UI override or copy) | **`app.staging.livia-hq.com` only** | **`staging`** |

### Common misconfig (hits prod API from staging UI)

- **Root Directory** = repo root (`/`) on `livia-stg` → build uses root [`vercel.json`](../../vercel.json) → `/api/*` proxies to **`https://api.livia-hq.com`**.
- Fix: set Root Directory to **`artifacts/livia-dashboard`** and staging rewrites (see [`STAGING-SETUP.md`](./STAGING-SETUP.md)).

---

## Checklist after a failed `livia-stg` email

1. Vercel → **livia-stg** → **Settings → General** → Root Directory = `artifacts/livia-dashboard`.
2. **Environment Variables** (Production + Preview): `VITE_LIVIA_DEPLOY_ENV=staging`, `VITE_API_BASE_URL=https://api.staging.livia-hq.com`, staging Clerk `pk_test_…`.
3. **Domains**: only `app.staging.livia-hq.com` — remove `app.livia-hq.com` if it was added by mistake.
4. **Deployments** → open failed build → read build log (often missing env or wrong root).
5. Redeploy after fix; UAT on **staging** URL only ([`FOUNDER-UAT-CHECKLIST.md`](./FOUNDER-UAT-CHECKLIST.md)).

---

## Do not deploy prod from laptop for routine releases

- **Dashboard:** Git push → Vercel **livia-app** project.
- **API:** Git push → Railway (not `railway up` from root without [`.railwayignore`](../../.railwayignore) — see [`RAILWAY-DEPLOY.md`](./RAILWAY-DEPLOY.md)).

Real **production** customer traffic stays off until you explicitly attach prod domains and sign off Bucket C + launch gates.
