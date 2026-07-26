# Deployment guide — Biruk Academy SMS

## Before you deploy

1. **Create a GitHub repository** (empty, no README if you push this repo as-is).
2. **Generate secrets**
   - `SECRET_KEY`: 50+ random characters (never commit the real value).
   - `DB_PASSWORD`: strong database password.
3. **Do not use demo passwords in production.** If you run `seed_data`, change every user password immediately or create real admin accounts and disable demos.

---

## Push to GitHub

From the repo root (`anti/`):

```bash
git remote add origin https://github.com/YOUR_ORG/YOUR_REPO.git
git checkout main
git pull origin main
git merge feature/academics-grade-materials
git push -u origin main
```

If `main` does not exist yet:

```bash
git checkout -b main
git push -u origin main
```

Optional: push the feature branch and open a PR instead of merging locally.

---

## Production deploy (Docker)

### 1. Configure environment

```bash
cp .env.production.example .env
```

Edit `.env` and set at minimum:

| Variable | Example |
|----------|---------|
| `SECRET_KEY` | (random) |
| `ALLOWED_HOSTS` | `school.example.com` |
| `CORS_ALLOWED_ORIGINS` | `https://school.example.com` |
| `FRONTEND_URL` | `https://school.example.com/dashboard` |
| `VITE_API_URL` | `https://school.example.com/api/v1` |
| `DB_PASSWORD` | (strong) |
| `VITE_SHOW_DEMO` | `false` |
| Email SMTP settings | for password reset |

### 2. Build and run

**Oracle Always Free (recommended):** see **[DEPLOY-ORACLE.md](./DEPLOY-ORACLE.md)** and use `docker-compose.oracle.yml`.

**Generic production:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env up --build -d
```

On startup the backend container runs **migrations** and **collectstatic** automatically.

### 3. Create admin user (first time)

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

Optional demo data (development only):

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_data
```

Then change all passwords.

### 4. HTTPS

- Point DNS to your server.
- Terminate TLS at nginx (add a `443` server block + certificates, e.g. Certbot) **or** use a cloud load balancer with HTTPS.
- Keep `SECURE_SSL_REDIRECT=True` and ensure nginx sends `X-Forwarded-Proto: https` (already configured in `nginx/nginx.conf` for `/api/`).

### 5. Backups

- Volume `postgres_data`: schedule `pg_dump` backups.
- Volume `media_files`: backup uploaded documents and academic files.

---

## Development vs production Compose

| File | Use |
|------|-----|
| `docker-compose.yml` | Local dev (published DB/Redis ports, bind mounts) |
| `docker-compose.prod.yml` | Production (no public DB/Redis, no source bind mount) |

---

## Local development (no Docker)

See root `README.md`. Dashboard demo buttons: set `VITE_SHOW_DEMO=true` in `front-end/school-dashboard/.env`.

---

## Post-deploy smoke test

- [ ] `https://yourdomain/` — public website loads  
- [ ] `https://yourdomain/dashboard/` — login (no demo account list)  
- [ ] `https://yourdomain/api/v1/auth/login/` — returns 405/400 on GET (API up)  
- [ ] Admin **Activity** tab shows school actions (not sign-in/out)  
- [ ] Finance / teacher / student roles behave as expected  
- [ ] Forgot-password email (if SMTP configured)  

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| CORS errors | `CORS_ALLOWED_ORIGINS` matches exact browser origin (scheme + host) |
| Redirect loop | `SECURE_SSL_REDIRECT` + missing `X-Forwarded-Proto` behind proxy |
| 502 from nginx | `docker compose logs backend` — migrations or DB connection |
| Dashboard calls wrong API | Rebuild dashboard with correct `VITE_API_URL` build arg |
| Rate limit too weak | `REDIS_URL` set in production (uses Redis cache for ratelimit) |
