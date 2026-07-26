# Split deploy: Neon + PythonAnywhere + Cloudflare Pages (no credit card)

Follow these parts **in order**. Replace placeholders with your real values.

| Part | Time | Result |
|------|------|--------|
| 0 | 5 min | Code on GitHub |
| 1 | 10 min | Neon PostgreSQL |
| 2 | 45–90 min | Django on PythonAnywhere |
| 3 | 30 min | Two Cloudflare Pages sites |
| 4 | 10 min | Connect CORS + test |

---

## Part 0 — Push to GitHub

```powershell
cd C:\Users\hp\OneDrive\Desktop\Biruk\anti
git push origin main
```

Create a repo on GitHub if needed (see `DEPLOY.md`).

---

## Part 1 — Neon database (free, GitHub login)

1. Open **https://neon.tech** → sign up with **GitHub**.
2. **New project** → name e.g. `biruk-academy` → region closest to you.
3. Open the project → **Connection details** → choose **PostgreSQL**.
4. Copy and save:
   - **Host** (e.g. `ep-cool-name-123456.us-east-2.aws.neon.tech`)
   - **Database** (often `neondb`)
   - **User** (often `neondb_owner`)
   - **Password** (shown once — save it)
   - **Port** `5432`

You will use these in Part 2 as `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

**Do not** run migrations from your PC unless you want to test; Part 2 runs them on PythonAnywhere.

---

## Part 2 — PythonAnywhere API (free beginner, no card)

### 2.1 Create account

1. **https://www.pythonanywhere.com/registration/register/beginner/**
2. Choose a username → your API will be  
   `https://YOURUSER.pythonanywhere.com`

### 2.2 Allow Neon (required on free tier)

1. **Account** tab (top right) → **Network** / **Allowlisted IPs** (wording may vary).
2. Add your **Neon host** only (hostname from Part 1, no `https://`):
   - Example: `ep-cool-name-123456.us-east-2.aws.neon.tech`
3. Save.

Without this, Django cannot reach Neon from PythonAnywhere.

### 2.3 Clone the repo

1. **Consoles** → **Bash**:

```bash
cd ~
git clone https://github.com/YOUR_GITHUB_USER/YOUR_REPO.git
cd YOUR_REPO/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.4 Environment variables

Copy `backend/pythonanywhere.env.example` and fill values.

On PythonAnywhere: **Web** tab → your web app (create in 2.5 first if needed) → **Environment variables** section, add each key:

| Variable | Example |
|----------|---------|
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` |
| `SECRET_KEY` | long random string |
| `USE_SQLITE` | `false` |
| `DB_HOST` | Neon host |
| `DB_NAME` | `neondb` |
| `DB_USER` | from Neon |
| `DB_PASSWORD` | from Neon |
| `DB_PORT` | `5432` |
| `DB_SSLMODE` | `require` |
| `ALLOWED_HOSTS` | `YOURUSER.pythonanywhere.com` |
| `SECURE_SSL_REDIRECT` | `True` |
| `CORS_ALLOWED_ORIGINS` | temporary: `https://YOURUSER.pythonanywhere.com` — update in Part 4 |
| `FRONTEND_URL` | temporary — update in Part 4 |
| `REDIS_URL` | leave empty |

Generate secret in Bash:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

### 2.5 Create the web app

1. **Web** tab → **Add a new web app**.
2. **Manual configuration** (not Django wizard).
3. Python **3.10** or **3.11**.

### 2.6 WSGI file

**Web** → **WSGI configuration file** → edit (replace `YOURUSER` and repo path):

```python
import os
import sys

project_home = '/home/YOURUSER/YOUR_REPO/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

Environment variables can also be set here instead of the Web UI:

```python
os.environ['SECRET_KEY'] = '...'
os.environ['USE_SQLITE'] = 'false'
# etc.
```

### 2.7 Migrate and static files

In **Bash** (venv active):

```bash
cd ~/YOUR_REPO/backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=config.settings.production
# export all DB_* and SECRET_KEY same as Web env, or source a file you create:

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

Optional demo data (change passwords after):

```bash
python manage.py seed_data
```

### 2.8 Map static and media URLs

**Web** tab → **Static files**:

| URL | Directory |
|-----|-----------|
| `/static/` | `/home/YOURUSER/YOUR_REPO/backend/staticfiles` |
| `/media/` | `/home/YOURUSER/YOUR_REPO/backend/media` |

Create media folder if missing:

```bash
mkdir -p ~/YOUR_REPO/backend/media
```

### 2.9 Reload

**Web** tab → green **Reload** button.

### 2.10 Test API

Open in browser (adjust path):

- `https://YOURUSER.pythonanywhere.com/admin/` → Django admin login
- API root may 404; test login with **Postman** or curl:

```bash
curl -X POST https://YOURUSER.pythonanywhere.com/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@birukacademy.edu","password":"YOUR_PASSWORD"}'
```

If you seeded with demo admin, change password first in admin.

**Error log:** Web tab → **Log files** → `error.log`.

---

## Part 3 — Cloudflare Pages (two projects, free)

Sign up: **https://dash.cloudflare.com** (no card for Pages).

Connect **GitHub** → authorize → select your repo.

### 3.1 Project A — Public website

| Setting | Value |
|---------|--------|
| Project name | `biruk-website` (example) |
| Production branch | `main` |
| Root directory | `front-end/school-website` |
| Build command | `npm ci && npm run build` |
| Build output | `dist` |

**Environment variables (Production):**

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOURUSER.pythonanywhere.com/api/v1` |

Deploy → note URL: `https://biruk-website.pages.dev` (yours will differ).

### 3.2 Project B — Dashboard

| Setting | Value |
|---------|--------|
| Project name | `biruk-dashboard` |
| Root directory | `front-end/school-dashboard` |
| Build command | `npm ci && npm run build` |
| Build output | `dist` |

**Environment variables (Production):**

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOURUSER.pythonanywhere.com/api/v1` |
| `VITE_SHOW_DEMO` | `false` |
| `VITE_BASE` | `/` |
| `VITE_ROUTER_BASENAME` | `/` |
| `VITE_PUBLIC_SITE_URL` | `https://biruk-website.pages.dev` |

These two basename vars deploy the dashboard at the **root** of `biruk-dashboard.pages.dev` (not `/dashboard/`).

Deploy → note URL: `https://biruk-dashboard.pages.dev`.

### 3.3 SPA routing

The repo includes `public/_redirects` for Cloudflare Pages (`/* → /index.html`). No extra step if the file is in the build.

---

## Part 4 — Connect frontends to API (CORS)

On **PythonAnywhere**, update environment variables:

```env
CORS_ALLOWED_ORIGINS=https://biruk-website.pages.dev,https://biruk-dashboard.pages.dev
FRONTEND_URL=https://biruk-dashboard.pages.dev/login
```

Use your **exact** Pages URLs (no trailing slash on origins).

**Web** → **Reload**.

On **Cloudflare Pages**, if you change `VITE_API_URL`, trigger **Retry deployment** on both projects.

---

## Part 5 — Smoke test checklist

- [ ] `https://biruk-website.pages.dev` loads public site  
- [ ] `https://biruk-dashboard.pages.dev/login` shows login (**no** demo account list if `VITE_SHOW_DEMO=false`)  
- [ ] Login works (admin user from `createsuperuser` or seed)  
- [ ] Browser DevTools → Network: API calls go to `YOURUSER.pythonanywhere.com`, not CORS errors  
- [ ] Upload / finance / activity features you care about  

---

## Part 6 — Backups

- **Neon:** project dashboard → backups (tier-dependent) or `pg_dump` from your PC using Neon connection string.
- **Media on PA:** **Files** tab → download `/home/YOURUSER/YOUR_REPO/backend/media`.
- **Code:** GitHub.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `OperationalError` connecting to DB | Neon host allowlisted on PA; `DB_SSLMODE=require`; correct password |
| CORS error in browser | `CORS_ALLOWED_ORIGINS` must match Pages URL exactly (`https://…`) |
| 502 / 500 on PA | Read `error.log`; often missing env var or migration not run |
| Dashboard blank / 404 on refresh | `_redirects` in `public/`; redeploy Pages |
| Login 401 | User exists on Neon DB via migrate; wrong password |
| PA CPU limit | Free tier daily CPU cap — upgrade or optimize traffic |

---

## Limits (free tiers)

- **PythonAnywhere beginner:** no custom domain on API, CPU quota, `YOURUSER.pythonanywhere.com` only.
- **Neon:** storage/connection limits on free tier.
- **Cloudflare Pages:** generous free bandwidth.

For a **single URL** with `/`, `/dashboard/`, and `/api/` together without split hosting, use **[DEPLOY-CLOUDFLARE-TUNNEL.md](./DEPLOY-CLOUDFLARE-TUNNEL.md)** instead.

---

## Quick reference — your URLs

Fill in after deploy:

| Service | URL |
|---------|-----|
| API | `https://YOURUSER.pythonanywhere.com/api/v1/` |
| Website | `https://____________.pages.dev` |
| Dashboard | `https://____________.pages.dev/login` |
| Neon | console.neon.tech |
