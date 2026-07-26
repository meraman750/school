# Step-by-step: Biruk Academy on Oracle Cloud (free)

This guide follows the **practical recommendation**: GitHub → Oracle Always Free VM → `docker-compose.oracle.yml` (no Celery) → HTTPS → backups.

**Time:** about 1–2 hours the first time.  
**You need:** GitHub account, Oracle Cloud account (card for verification, stay in Always Free), optional domain name.

---

## Part 1 — Push code to GitHub (on your Windows PC)

### 1.1 Create an empty GitHub repository

1. Open [https://github.com/new](https://github.com/new)
2. Name it (e.g. `biruk-academy-sms`)
3. Choose **Private** if you prefer
4. **Do not** add README, .gitignore, or license (you already have them)
5. Click **Create repository**

### 1.2 Push from your project folder

Open **PowerShell**:

```powershell
cd C:\Users\hp\OneDrive\Desktop\Biruk\anti

git status
# Should be on branch main, clean working tree

git remote add origin https://github.com/YOUR_GITHUB_USERNAME/biruk-academy-sms.git
git push -u origin main
```

If GitHub asks you to sign in, use a **Personal Access Token** as the password ([GitHub docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)).

If `origin` already exists:

```powershell
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/biruk-academy-sms.git
git push -u origin main
```

---

## Part 2 — Create Oracle Cloud Always Free VM

### 2.1 Sign up

1. Go to [https://www.oracle.com/cloud/free/](https://www.oracle.com/cloud/free/)
2. Create an account (verification card; use **Always Free** resources only to avoid charges)
3. Sign in to [Oracle Cloud Console](https://cloud.oracle.com/)

### 2.2 Create a VM (Compute instance)

1. **Menu (☰) → Compute → Instances → Create instance**
2. **Name:** `biruk-academy`
3. **Image:** Ubuntu 22.04 (or 24.04)
4. **Shape:** **Ampere** → `VM.Standard.A1.Flex` → **1 OCPU, 6 GB RAM** (enough for Docker stack)
5. **Networking:** use default VCN or create new; assign a **public IPv4**
6. **SSH keys:** paste your public key, or let Oracle generate a key pair (**download the private key**)
7. Click **Create**

Wait until state is **Running**. Note the **Public IP address** (e.g. `129.146.xxx.xxx`).

### 2.3 Open firewall ports (Oracle + Ubuntu)

**A) Security list (Oracle cloud firewall)**

1. **Networking → Virtual cloud networks →** your VCN → **Security Lists → Default Security List**
2. **Add Ingress Rules:**
   - Source `0.0.0.0/0`, TCP **22** (SSH)
   - Source `0.0.0.0/0`, TCP **80** (HTTP)
   - Source `0.0.0.0/0`, TCP **443** (HTTPS)

**B) Ubuntu firewall (on the VM, after SSH)**

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

(If `netfilter-persistent` is missing: `sudo apt install -y iptables-persistent`.)

---

## Part 3 — Connect and install Docker (on the VM)

### 3.1 SSH from Windows

With Oracle-generated key:

```powershell
ssh -i C:\path\to\your-key.key ubuntu@YOUR_PUBLIC_IP
```

### 3.2 Install Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
```

Log out and SSH in again so `docker` works without `sudo`:

```bash
exit
# SSH again
docker --version
docker compose version
```

---

## Part 4 — Clone repo and configure `.env`

### 4.1 Clone

```bash
cd ~
git clone https://github.com/YOUR_GITHUB_USERNAME/biruk-academy-sms.git
cd biruk-academy-sms
```

### 4.2 Create `.env`

```bash
cp .env.production.example .env
nano .env
```

**Phase A — test with IP only (HTTP, before domain):**

Replace values like this (use your VM public IP):

```env
SECRET_KEY=paste-a-long-random-string-at-least-50-characters
ALLOWED_HOSTS=YOUR_PUBLIC_IP,yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=http://YOUR_PUBLIC_IP,https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=http://YOUR_PUBLIC_IP/dashboard

VITE_API_URL=http://YOUR_PUBLIC_IP/api/v1

DB_NAME=biruk_academy
DB_USER=biruk
DB_PASSWORD=choose-a-strong-db-password-here

VITE_SHOW_DEMO=false

SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=31536000

JWT_ACCESS_MINUTES=30
JWT_REFRESH_DAYS=7
```

Generate a secret key on the VM:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

**Phase B — after HTTPS works**, switch to (see Part 6):

```env
FRONTEND_URL=https://yourdomain.com/dashboard
VITE_API_URL=https://yourdomain.com/api/v1
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SECURE_SSL_REDIRECT=True
```

Then **rebuild** frontends (Part 5.2).

Save in nano: `Ctrl+O`, Enter, `Ctrl+X`.

### 4.3 Certbot folders (for later)

```bash
mkdir -p certbot/www certbot/conf
```

---

## Part 5 — Build and start the stack

### 5.1 First deploy

```bash
cd ~/biruk-academy-sms
docker compose -f docker-compose.oracle.yml --env-file .env up --build -d
```

First build can take **15–30 minutes** on a small VM.

Check status:

```bash
docker compose -f docker-compose.oracle.yml ps
docker compose -f docker-compose.oracle.yml logs -f backend
# Ctrl+C to stop following logs
```

### 5.2 Create admin user

```bash
docker compose -f docker-compose.oracle.yml exec backend python manage.py createsuperuser
```

Optional demo seed (**change passwords after**):

```bash
docker compose -f docker-compose.oracle.yml exec backend python manage.py seed_data
```

### 5.3 Smoke test (browser)

- Public site: `http://YOUR_PUBLIC_IP/`
- Dashboard: `http://YOUR_PUBLIC_IP/dashboard/`
- API: `http://YOUR_PUBLIC_IP/api/v1/` (may show 404 on root — normal)

If the dashboard cannot reach the API, check browser **DevTools → Network** for CORS errors and fix `CORS_ALLOWED_ORIGINS` and `VITE_API_URL`, then rebuild:

```bash
docker compose -f docker-compose.oracle.yml --env-file .env up --build -d dashboard website
```

---

## Part 6 — Domain name and HTTPS (Certbot)

Skip if you only use the IP for testing. For production, use a domain.

### 6.1 Point DNS to the VM

At your domain registrar, add:

| Type | Name | Value |
|------|------|--------|
| A | `@` | `YOUR_PUBLIC_IP` |
| A | `www` | `YOUR_PUBLIC_IP` |

Wait up to 30–60 minutes for DNS to propagate.

### 6.2 Update nginx `server_name` (HTTP)

Edit `nginx/nginx.conf` on the VM:

```bash
nano ~/biruk-academy-sms/nginx/nginx.conf
```

Change:

```nginx
server_name localhost;
```

to:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

Add HTTP → HTTPS redirect **after** certificates exist (step 6.4). Restart nginx:

```bash
docker compose -f docker-compose.oracle.yml restart nginx
```

### 6.3 Get Let's Encrypt certificate

Install Certbot on the **host** (not inside a container):

```bash
sudo apt install -y certbot
cd ~/biruk-academy-sms
docker compose -f docker-compose.oracle.yml stop nginx
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
docker compose -f docker-compose.oracle.yml start nginx
```

Certificates are in `/etc/letsencrypt/live/yourdomain.com/`.

Copy into project certbot volume (used by Docker nginx):

```bash
sudo cp -rL /etc/letsencrypt/* ~/biruk-academy-sms/certbot/conf/
sudo chown -R ubuntu:ubuntu ~/biruk-academy-sms/certbot/conf
```

### 6.4 Enable HTTPS in nginx

1. Copy the example SSL server block:

```bash
cp nginx/nginx-ssl.conf.example nginx/nginx-ssl-snippet.conf
nano nginx/nginx-ssl-snippet.conf
# Replace YOUR_DOMAIN with yourdomain.com everywhere
```

2. Edit `nginx/nginx.conf` — **inside** the `http { }` block, **after** the closing `}` of the port 80 server, paste the contents of `nginx-ssl-snippet.conf`.

3. Optional: on the port **80** server, add redirect:

```nginx
location / {
    return 301 https://$host$request_uri;
}
```

(Place **after** the `acme-challenge` location so renewals still work.)

4. Restart:

```bash
docker compose -f docker-compose.oracle.yml restart nginx
```

### 6.5 Update `.env` for HTTPS and rebuild frontends

```bash
nano .env
# Set FRONTEND_URL, VITE_API_URL, CORS, SECURE_SSL_REDIRECT=True as in Part 4.2 Phase B

docker compose -f docker-compose.oracle.yml --env-file .env up --build -d dashboard website backend
```

Test: `https://yourdomain.com/dashboard/`

### 6.6 Renew certificates (cron)

```bash
sudo crontab -e
```

Add:

```cron
0 3 * * * certbot renew --quiet --deploy-hook "cp -rL /etc/letsencrypt/* /home/ubuntu/biruk-academy-sms/certbot/conf/ && docker compose -f /home/ubuntu/biruk-academy-sms/docker-compose.oracle.yml restart nginx"
```

Adjust paths if your home directory differs.

---

## Part 7 — Backups

From repo root on the VM:

```bash
chmod +x scripts/backup-oracle.sh
./scripts/backup-oracle.sh
```

Creates under `backups/`:

- `db-YYYYMMDD-HHMMSS.sql`
- `media-YYYYMMDD-HHMMSS.tar.gz`

**Download to your PC** (from PowerShell):

```powershell
scp -i C:\path\to\your-key.key ubuntu@YOUR_PUBLIC_IP:~/biruk-academy-sms/backups/*.sql .
```

Run backups weekly (cron on VM):

```bash
crontab -e
# 0 2 * * 0 /home/ubuntu/biruk-academy-sms/scripts/backup-oracle.sh
```

---

## Part 8 — Useful commands

| Task | Command |
|------|---------|
| View logs | `docker compose -f docker-compose.oracle.yml logs -f backend` |
| Restart all | `docker compose -f docker-compose.oracle.yml restart` |
| Pull updates | `git pull && docker compose -f docker-compose.oracle.yml --env-file .env up --build -d` |
| Stop all | `docker compose -f docker-compose.oracle.yml down` |

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Cannot SSH | Security list port 22; correct key; instance running |
| Site not loading | Port 80/443 open; `docker compose ps`; nginx logs |
| CORS errors | `CORS_ALLOWED_ORIGINS` exact match (scheme + host, no trailing slash on origin) |
| Dashboard wrong API | Rebuild with correct `VITE_API_URL` in `.env` |
| 502 Bad Gateway | `docker compose logs backend`; DB password in `.env` |
| Redirect loop | `SECURE_SSL_REDIRECT=True` but nginx not sending `X-Forwarded-Proto: https` on SSL block |
| Out of memory | Use 6 GB ARM shape; `docker compose` shows OOM → reduce gunicorn workers to 1 |

---

## Checklist

- [ ] GitHub repo pushed (`main`)
- [ ] Oracle VM running (Always Free shape)
- [ ] Ports 22, 80, 443 open
- [ ] `.env` filled (SECRET_KEY, DB_PASSWORD, URLs)
- [ ] `docker compose -f docker-compose.oracle.yml up --build -d`
- [ ] `createsuperuser` done
- [ ] `VITE_SHOW_DEMO=false`
- [ ] Domain + Certbot + HTTPS
- [ ] Backup script tested

When all boxes are checked, Biruk Academy is live on Oracle Cloud free tier.
