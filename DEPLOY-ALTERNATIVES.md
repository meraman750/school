# Deployment alternatives (no Oracle / no VPS card)

Use this doc if **Oracle Cloud is not an option** (credit card, region limits, etc.).

| Option | Card needed? | Always online? | Full Docker stack? | Best for |
|--------|--------------|----------------|--------------------|----------|
| **[A. Cloudflare Tunnel + Docker (PC)](./DEPLOY-CLOUDFLARE-TUNNEL.md)** | No (Cloudflare free) | Only while PC + Docker run | Yes | Demo, pilot, small school on one computer |
| **[B. Cloudflare Pages + Neon + PythonAnywhere](./DEPLOY-SPLIT-NO-CARD.md)** | No | Yes (API on PA free tier) | No (manual setup) | Light production without Docker |
| **C. Local / school LAN only** | No | On LAN only | Optional | Classroom, office testing |
| **D. Render (recommended paid-ish free tier)** | Usually **yes** | Yes (API may sleep) | API + static sites | **[DEPLOY-RENDER.md](./DEPLOY-RENDER.md)** |
| **E. Railway / Fly.io** | Usually **yes** | Yes | Partial | See Render doc for comparison |
| **F. Oracle / GCP / AWS free VM** | Yes (verify) | Yes | Full Docker | [DEPLOY-ORACLE.md](./DEPLOY-ORACLE.md) |

---

## Quick pick

- **“Simple cloud, GitHub deploy”** → **[DEPLOY-RENDER.md](./DEPLOY-RENDER.md)** (API on Render + Neon + static frontends)
- **“API always up, no Docker, no card”** → **Option B** ([DEPLOY-SPLIT-NO-CARD.md](./DEPLOY-SPLIT-NO-CARD.md))
- **“Only inside the school building”** → **Option C** below

---

## Option C — Local / LAN only (simplest)

No cloud account.

**Backend**

```powershell
cd backend
cp .env.example .env
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

**Dashboard** (second terminal)

```powershell
cd front-end\school-dashboard
cp .env.example .env
# VITE_API_URL=http://YOUR_PC_LAN_IP:8000/api/v1
npm install
npm run dev -- --host 0.0.0.0
```

Other devices on the same Wi‑Fi open `http://YOUR_PC_LAN_IP:5173/dashboard/` (or the port Vite prints).

**Website:** same pattern under `front-end/school-website`.

**Limits:** PC must stay on; not reachable from the public internet unless you add Option A on top.

---

## Option D — Paid-ish free tiers (card often required)

| Provider | Notes |
|----------|--------|
| [Render](https://render.com) | Free web service **sleeps**; Postgres often paid; Docker supported |
| [Railway](https://railway.app) | Limited monthly credit; card for verification |
| [Fly.io](https://fly.io) | Small free allowance; card required |
| [Google Cloud e2-micro](https://cloud.google.com/free) | Always-free VM in some regions; **card required** |

These can host Django + Postgres but need env/CORS/`VITE_API_URL` wiring similar to production `.env`.

---

## Option E — Oracle / VPS (card for verification)

Full guide: **[DEPLOY-ORACLE.md](./DEPLOY-ORACLE.md)** with `docker-compose.oracle.yml`.

---

## Environment reminders (all public options)

Whatever host you use, production needs:

```env
VITE_SHOW_DEMO=false
VITE_API_URL=https://YOUR_PUBLIC_HOST/api/v1
CORS_ALLOWED_ORIGINS=https://YOUR_PUBLIC_HOST
FRONTEND_URL=https://YOUR_PUBLIC_HOST/dashboard
ALLOWED_HOSTS=YOUR_PUBLIC_HOST
SECRET_KEY=<long random>
```

Rebuild frontends after changing `VITE_API_URL`.

---

## Related files

| File | Purpose |
|------|---------|
| `docker-compose.oracle.yml` | Full stack, no Celery (PC or VM) |
| `docker-compose.prod.yml` | Same + Celery (optional) |
| `.env.production.example` | Template |
| `DEPLOY.md` | Generic production checklist |
