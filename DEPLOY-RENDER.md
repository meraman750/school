# Deploy on Render

Render is a good **middle ground**: simpler than a VPS, always-on URLs, GitHub auto-deploy. You deploy **three things**:

| Render service | What | Free tier |
|----------------|------|-----------|
| **Web Service** | Django API (`backend/`) | Yes (spins down after ~15 min idle) |
| **Static Site** | Public website | Yes |
| **Static Site** | Dashboard | Yes |
| **Database** | Use **[Neon](https://neon.tech)** (free), not Render Postgres | Neon free |

**Card:** Render usually asks for a **credit/debit card** for verification (even on free services). Neon signup is separate (GitHub, often no card).

---

## Architecture

```
biruk-website.onrender.com     ──┐
biruk-dashboard.onrender.com ──┼──► biruk-api.onrender.com (Django)
                                 └──► Neon PostgreSQL
```

---

## Part 0 — Push to GitHub

```powershell
cd C:\Users\hp\OneDrive\Desktop\Biruk\anti
git push origin main
```

---

## Part 1 — Neon database (same as split deploy)

1. [neon.tech](https://neon.tech) → GitHub signup → new project.
2. Copy **host**, **database**, **user**, **password**, port **5432**.
3. Keep for Part 2 env vars (`DB_SSLMODE=require`).

---

## Part 2 — Render account

1. [render.com](https://render.com) → sign up → connect **GitHub**.
2. Authorize access to your repo.

---

## Part 3 — Django Web Service (API)

1. **Dashboard → New + → Web Service**.
2. Select repo `YOUR_REPO`.
3. Settings:

| Field | Value |
|-------|--------|
| **Name** | `biruk-api` |
| **Region** | Closest to users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | **Python 3** |
| **Build Command** | `pip install -r requirements.txt && python manage.py collectstatic --noinput` |
| **Start Command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120` |

4. **Instance type:** Free (if available).

5. **Advanced → Release Command** (runs before each deploy):

```bash
python manage.py migrate --noinput
```

6. **Environment variables** (Environment tab):

| Key | Value |
|-----|--------|
| `PYTHON_VERSION` | `3.12.0` |
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` |
| `SECRET_KEY` | long random string |
| `DEBUG` | `False` |
| `USE_SQLITE` | `false` |
| `DB_HOST` | Neon host |
| `DB_NAME` | from Neon |
| `DB_USER` | from Neon |
| `DB_PASSWORD` | from Neon |
| `DB_PORT` | `5432` |
| `DB_SSLMODE` | `require` |
| `ALLOWED_HOSTS` | `biruk-api.onrender.com` (your actual service hostname) |
| `SECURE_SSL_REDIRECT` | `True` |
| `SECURE_PROXY_SSL_HEADER` | already in production settings via Render proxy |
| `CORS_ALLOWED_ORIGINS` | fill after Part 4 — static site URLs |
| `FRONTEND_URL` | `https://biruk-dashboard.onrender.com/login` (after Part 4) |
| `REDIS_URL` | leave empty (optional: Upstash free Redis later) |
| `VITE_SHOW_DEMO` | N/A on API |

7. **Create Web Service** → wait for first deploy (green **Live**).

8. Note API URL: `https://biruk-api.onrender.com`

9. **Create admin** (Shell tab on the service, or one-off job):

```bash
python manage.py createsuperuser
```

Test: `https://biruk-api.onrender.com/admin/`

### Media uploads on Render (important)

Free web services use an **ephemeral disk** — uploaded files can **disappear on redeploy**. For a pilot, that may be OK. For production media, add **Render Disk** (paid) or S3-compatible storage later.

---

## Part 4 — Static site: public website

1. **New + → Static Site** → same repo.
2. Settings:

| Field | Value |
|-------|--------|
| **Name** | `biruk-website` |
| **Branch** | `main` |
| **Root Directory** | `front-end/school-website` |
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `dist` |

3. **Environment variable:**

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://biruk-api.onrender.com/api/v1` |

4. Deploy → URL: `https://biruk-website.onrender.com`

---

## Part 5 — Static site: dashboard

1. **New + → Static Site** → same repo.
2. Settings:

| Field | Value |
|-------|--------|
| **Name** | `biruk-dashboard` |
| **Root Directory** | `front-end/school-dashboard` |
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `dist` |

3. **Environment variables:**

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://biruk-api.onrender.com/api/v1` |
| `VITE_SHOW_DEMO` | `false` |
| `VITE_BASE` | `/` |
| `VITE_ROUTER_BASENAME` | `/` |
| `VITE_PUBLIC_SITE_URL` | `https://biruk-website.onrender.com` |

4. Deploy → login at `https://biruk-dashboard.onrender.com/login`

---

## Part 6 — Fix CORS on the API

Back on **biruk-api** → **Environment**:

```env
CORS_ALLOWED_ORIGINS=https://biruk-website.onrender.com,https://biruk-dashboard.onrender.com
FRONTEND_URL=https://biruk-dashboard.onrender.com/login
```

**Manual Deploy** or wait for auto redeploy.

---

## Part 7 — Smoke test

- [ ] Website loads  
- [ ] Dashboard `/login` works (no demo list if `VITE_SHOW_DEMO=false`)  
- [ ] First API call after idle may take **30–60 s** (free tier waking up)  
- [ ] No CORS errors in browser DevTools  

---

## Optional: Blueprint (`render.yaml`)

Repo includes `render.yaml` for **Infrastructure as Code**. On Render:

**New + → Blueprint** → connect repo → Render reads `render.yaml`.

You still must set **secret** env vars in the dashboard (Neon password, `SECRET_KEY`).

---

## Render vs other options

| | Render | Cloudflare Tunnel | PythonAnywhere split |
|--|--------|-------------------|----------------------|
| Card | Usually yes | No | No |
| Cold start | Free API sleeps | PC must stay on | PA CPU limits |
| One-click Docker compose | No (multi service) | Yes (local Docker) | No |
| Custom domain | Yes (free SSL) | Yes | PA: paid/custom |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on `collectstatic` | Set `SECRET_KEY` and `DJANGO_SETTINGS_MODULE` before build; or use dummy `SECRET_KEY` only for build |
| 502 on API | Logs tab; often migrate failed or wrong `DB_*` |
| CORS | Origins exact match, `https://`, no trailing slash |
| Dashboard 404 on refresh | Static site should serve SPA; Render static handles this for `dist/index.html` |
| Slow login | Free tier was asleep — normal |
| DisallowedHost | Add exact `*.onrender.com` host to `ALLOWED_HOSTS` |

---

## Custom domain (later)

Each Render service → **Settings → Custom Domains** → add `api.yourschool.com`, `www`, `dashboard`. Update `ALLOWED_HOSTS`, `CORS`, and rebuild static sites with updated `VITE_API_URL` if API domain changes.

---

See also: [DEPLOY-SPLIT-NO-CARD.md](./DEPLOY-SPLIT-NO-CARD.md) (same Neon + static frontends, API on PythonAnywhere instead).
