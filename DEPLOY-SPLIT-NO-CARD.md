# Split deploy without credit card

**Always-on-ish** without Oracle: host **API** on PythonAnywhere (free, no card), **database** on Neon (free, GitHub login), **frontends** on Cloudflare Pages (free, no card).

This is **more manual** than Docker. Expect 2–4 hours the first time.

---

## Architecture

```
Browser → Cloudflare Pages (static React builds)
       → PythonAnywhere (Django REST API)
       → Neon (PostgreSQL)
```

Media uploads: stored on PythonAnywhere disk (limited on free tier) or configure external storage later.

---

## Part 1 — Neon PostgreSQL (free)

1. Sign up: https://neon.tech (GitHub is fine).
2. Create project → database `biruk_academy`.
3. Copy the **connection string** (PostgreSQL). Example shape:

   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

4. Map to Django env (use `psycopg2` — already in `requirements.txt`):

```env
USE_SQLITE=false
DB_HOST=ep-xxx.region.aws.neon.tech
DB_NAME=neondb
DB_USER=...
DB_PASSWORD=...
DB_PORT=5432
```

(Neon may give one URL; parse host/user/password/name or use `DATABASE_URL` if you add `dj-database-url` — optional.)

---

## Part 2 — PythonAnywhere beginner account (free, no card)

1. Sign up: https://www.pythonanywhere.com/registration/register/beginner/
2. **Web** tab → Add new web app → **Manual configuration** → Python 3.10+.
3. **Consoles** → Bash:

```bash
git clone https://github.com/YOUR_USER/YOUR_REPO.git
cd YOUR_REPO/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. Set env vars on PythonAnywhere (Web → your app → **Environment variables** or WSGI file):

```env
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=...
ALLOWED_HOSTS=YOURUSER.pythonanywhere.com
USE_SQLITE=false
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
CORS_ALLOWED_ORIGINS=https://YOUR-DASHBOARD.pages.dev,https://YOUR-WEBSITE.pages.dev
FRONTEND_URL=https://YOUR-DASHBOARD.pages.dev/dashboard
SECURE_SSL_REDIRECT=True
REDIS_URL=
```

(Rate limiting uses LocMem if Redis empty — OK for one worker.)

5. **Migrate:**

```bash
cd ~/YOUR_REPO/backend
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

6. **WSGI** — edit `/var/www/YOURUSER_pythonanywhere_com_wsgi.py`:

```python
import os
import sys
path = '/home/YOURUSER/YOUR_REPO/backend'
if path not in sys.path:
    sys.path.insert(0, path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

7. **Static files mapping** (Web tab):

| URL | Directory |
|-----|-----------|
| `/static/` | `/home/YOURUSER/YOUR_REPO/backend/staticfiles` |
| `/media/` | `/home/YOURUSER/YOUR_REPO/backend/media` |

8. Reload web app. Test: `https://YOURUSER.pythonanywhere.com/api/v1/` (may 404 on root — try login POST with a REST client).

**Free tier limits:** CPU seconds per day, no custom domain on beginner, HTTPS on `*.pythonanywhere.com` only.

---

## Part 3 — Cloudflare Pages (website + dashboard)

Create **two** Pages projects from the same GitHub repo.

### Project 1 — Public website

| Setting | Value |
|---------|--------|
| Root directory | `front-end/school-website` |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Env | `VITE_API_URL=https://YOURUSER.pythonanywhere.com/api/v1` |

### Project 2 — Dashboard

| Setting | Value |
|---------|--------|
| Root directory | `front-end/school-dashboard` |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Env | `VITE_API_URL=https://YOURUSER.pythonanywhere.com/api/v1` |
| Env | `VITE_SHOW_DEMO=false` |

**Dashboard base path:** Vite uses `base: '/dashboard/'`. On Pages you need either:

- Custom domain path routing (advanced), or  
- Deploy dashboard to a **subdomain** (e.g. `dashboard.pages.dev`) and adjust Vite `base` to `/` for that project only (code change), or  
- Use **Cloudflare Tunnel + Docker** instead ([DEPLOY-CLOUDFLARE-TUNNEL.md](./DEPLOY-CLOUDFLARE-TUNNEL.md)) to avoid path issues.

Simplest split setup: set dashboard Pages **custom domain** `dashboard.yourschool.org` and change `vite.config.js` `base: '/'` on a deploy branch (document for your team).

---

## Part 4 — CORS and ALLOWED_HOSTS

After Pages URLs exist, update PythonAnywhere env:

```env
CORS_ALLOWED_ORIGINS=https://xxx.pages.dev,https://yyy.pages.dev
ALLOWED_HOSTS=YOURUSER.pythonanywhere.com
```

Reload PA web app. Rebuild Pages if you change `VITE_API_URL`.

---

## Part 5 — When to choose something else

| Need | Use instead |
|------|-------------|
| Full app under one URL (`/`, `/dashboard/`, `/api/`) | [DEPLOY-CLOUDFLARE-TUNNEL.md](./DEPLOY-CLOUDFLARE-TUNNEL.md) |
| 24/7 Docker on a server | [DEPLOY-ORACLE.md](./DEPLOY-ORACLE.md) (card verify) |
| Classroom only | [DEPLOY-ALTERNATIVES.md](./DEPLOY-ALTERNATIVES.md) Option C |

---

## Backups

- **Neon:** dashboard backups / point-in-time on paid tiers; free tier — export with `pg_dump` from a local machine using Neon connection string.
- **PythonAnywhere:** download `media/` via Files tab; DB on Neon.
