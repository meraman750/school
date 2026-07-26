# Deploy with Cloudflare Tunnel (no credit card)

Expose your **full Docker stack** (website + dashboard + API + Postgres) from **Windows** using:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (free)
- [Cloudflare](https://dash.cloudflare.com/sign-up) account (free, **no card** for Tunnel)

Your PC must stay on with Docker running while people use the site.

---

## What you get

- Public **HTTPS** URL (Cloudflare terminates SSL)
- Same app as production: `docker-compose.oracle.yml`
- **No Oracle / AWS / Render**

---

## Part 1 — Install Docker Desktop (Windows)

1. Install Docker Desktop and enable **WSL 2** if prompted.
2. Open PowerShell:

```powershell
docker --version
docker compose version
```

---

## Part 2 — Configure `.env` (temporary HTTP localhost first)

```powershell
cd C:\Users\hp\OneDrive\Desktop\Biruk\anti
copy .env.production.example .env
notepad .env
```

Start with **HTTP** and placeholders (you will update after you know your tunnel URL):

```env
SECRET_KEY=paste-50-char-random-string
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost
FRONTEND_URL=http://localhost/dashboard

VITE_API_URL=http://localhost/api/v1

DB_NAME=biruk_academy
DB_USER=biruk
DB_PASSWORD=choose-a-strong-password

VITE_SHOW_DEMO=false
SECURE_SSL_REDIRECT=False
```

Generate a secret (PowerShell):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

---

## Part 3 — Start Docker stack

```powershell
cd C:\Users\hp\OneDrive\Desktop\Biruk\anti
docker compose -f docker-compose.oracle.yml --env-file .env up --build -d
```

Wait for the first build (can take 20–40 minutes).

Create admin:

```powershell
docker compose -f docker-compose.oracle.yml exec backend python manage.py createsuperuser
```

Test locally:

- http://localhost/
- http://localhost/dashboard/

If the dashboard cannot login, check CORS and `VITE_API_URL`, then rebuild:

```powershell
docker compose -f docker-compose.oracle.yml --env-file .env up --build -d dashboard website
```

---

## Part 4 — Cloudflare Quick Tunnel (fastest demo URL)

**No domain required.** URL changes each time you restart the tunnel (fine for demos).

1. Download **cloudflared** for Windows:  
   https://github.com/cloudflare/cloudflared/releases  
   (e.g. `cloudflared-windows-amd64.exe` → rename to `cloudflared.exe` and add to PATH, or run from a folder)

2. In a **new** PowerShell window:

```powershell
cloudflared tunnel --url http://localhost:80
```

3. Copy the **https://….trycloudflare.com** URL it prints.

4. Update `.env` — replace `YOUR_TUNNEL_HOST` with hostname only (no `https://`):

```env
ALLOWED_HOSTS=localhost,127.0.0.1,YOUR_TUNNEL_HOST
CORS_ALLOWED_ORIGINS=https://YOUR_TUNNEL_HOST
FRONTEND_URL=https://YOUR_TUNNEL_HOST/dashboard
VITE_API_URL=https://YOUR_TUNNEL_HOST/api/v1
SECURE_SSL_REDIRECT=True
```

5. Rebuild frontends and restart backend:

```powershell
docker compose -f docker-compose.oracle.yml --env-file .env up --build -d dashboard website backend
docker compose -f docker-compose.oracle.yml restart nginx
```

6. Open in browser: `https://YOUR_TUNNEL_HOST/dashboard/`

Keep **both** running:

- Docker Desktop + containers
- The `cloudflared` PowerShell window

---

## Part 5 — Named tunnel (stable URL, still free)

For a **fixed** hostname (recommended if you use this more than a few days):

1. Log in:

```powershell
cloudflared tunnel login
```

2. Create a tunnel:

```powershell
cloudflared tunnel create biruk-academy
```

Note the tunnel **UUID**.

3. Create `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: biruk-academy
credentials-file: C:\Users\YOUR_USER\.cloudflared\UUID.json

ingress:
  - hostname: biruk.YOUR_SUBDOMAIN.cfargotunnel.com
    service: http://localhost:80
  - service: http_status:404
```

(Cloudflare dashboard can assign a **free tunnel subdomain** under Zero Trust → Networks → Tunnels → Public Hostname.)

4. Route DNS in Cloudflare dashboard (follow prompts after `tunnel create`).

5. Run:

```powershell
cloudflared tunnel run biruk-academy
```

6. Set `.env` to your stable `https://…` hostname and rebuild as in Part 4 step 5.

Official docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/

---

## Part 6 — HTTPS and Django

Cloudflare sends HTTPS to users; your nginx listens on **HTTP** locally. That is normal.

With `SECURE_SSL_REDIRECT=True`, Django trusts HTTPS because nginx sets `X-Forwarded-Proto` (already in `nginx/nginx.conf` for `/api/`).

---

## Part 7 — Stop / start

```powershell
# Stop app
docker compose -f docker-compose.oracle.yml down

# Stop tunnel: Ctrl+C in cloudflared window

# Start again
docker compose -f docker-compose.oracle.yml --env-file .env up -d
cloudflared tunnel --url http://localhost:80
# or: cloudflared tunnel run biruk-academy
```

---

## Limitations

| Topic | Note |
|-------|------|
| Uptime | Site down when PC sleeps or Docker stops |
| Performance | Depends on your internet upload speed |
| Backups | Run `scripts\backup-oracle.sh` in Git Bash or WSL, or manual `pg_dump` via Docker |
| Quick tunnel URL | Changes every time unless you use a **named tunnel** |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `502` on tunnel URL | Is nginx up? `docker compose ps` — port 80 on localhost? |
| CORS error | `CORS_ALLOWED_ORIGINS` must be exactly `https://your-host` (no path) |
| Blank dashboard API | Wrong `VITE_API_URL` → rebuild `dashboard` image |
| Docker slow on Windows | Allocate more RAM/CPU in Docker Desktop settings |

---

## Next step

For **always-on without your PC**, use **[DEPLOY-SPLIT-NO-CARD.md](./DEPLOY-SPLIT-NO-CARD.md)** (PythonAnywhere + Neon + Cloudflare Pages) or accept a **card-verified** VPS in **[DEPLOY-ORACLE.md](./DEPLOY-ORACLE.md)**.
