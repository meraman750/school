# Biruk Academy Primary School - School Management System

Production-ready school management platform with Django REST API, public website, and internal dashboard.

## Architecture

```
anti/
├── backend/                 # Django REST API
├── front-end/
│   ├── school-website/      # Public website (/)
│   └── school-dashboard/    # Management dashboard (/dashboard)
├── nginx/                   # Production reverse proxy
└── docker-compose.yml
```

## Tech Stack

**Backend:** Django, DRF, PostgreSQL, JWT, Celery, Redis  
**Frontend:** React, Vite, TanStack Query, Tailwind CSS, Framer Motion, Recharts

## Quick Start (Development)

### Backend

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

API: `http://localhost:8000/api/v1/`  
Admin: `http://localhost:8000/admin/`

**Demo credentials:** `admin@birukacademy.edu` / `Admin@123`

### Public Website

```bash
cd front-end/school-website
cp .env.example .env
npm install
npm run dev
```

URL: `http://localhost:3000`

### Management Dashboard

```bash
cd front-end/school-dashboard
cp .env.example .env
npm install
npm run dev
```

URL: `http://localhost:3001/dashboard/`

Set `VITE_SHOW_DEMO=true` in `.env` to show demo account shortcuts on the login page.

## Docker

**Local / dev:** `docker-compose.yml` (exposes Postgres and Redis on localhost)

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

**Production:** see **[DEPLOY.md](./DEPLOY.md)** — use `docker-compose.prod.yml` and root `.env` from `.env.production.example`.

- Website: `http://localhost/`
- Dashboard: `http://localhost/dashboard/`
- API: `http://localhost/api/v1/`

## Modules

| Module | Description |
|--------|-------------|
| Authentication | JWT, RBAC (11 roles), password reset |
| Students | Profiles, admission, guardians, documents |
| Teachers | Profiles, qualifications, leave, performance |
| Academics | Classes, subjects, exams, grades, timetables |
| Library | Books, borrowing, fines |
| Documents | File management |
| Reports | PDF, Excel, CSV exports |
| Website | Public CMS content |

## Environment Variables

See `backend/.env.example`, `front-end/school-website/.env.example`, `front-end/school-dashboard/.env.example`, and **`.env.production.example`** for Docker production.

## Deployment

Full checklist: **[DEPLOY.md](./DEPLOY.md)**

## License

Proprietary - Biruk Academy Primary School
