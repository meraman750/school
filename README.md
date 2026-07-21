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

## Docker (Production)

```bash
cp backend/.env.example backend/.env
docker-compose up --build
```

- Website: `http://localhost/`
- Dashboard: `http://localhost/dashboard`
- API: `http://localhost/api/v1/`

## Modules

| Module | Description |
|--------|-------------|
| Authentication | JWT, RBAC (11 roles), password reset |
| Students | Profiles, admission, guardians, documents |
| Teachers | Profiles, qualifications, leave, performance |
| Parents | Accounts, children, communication |
| Academics | Classes, subjects, exams, grades, timetables |
| Attendance | Student & teacher attendance, analytics |
| Finance | Invoices, payments, scholarships |
| Library | Books, borrowing, fines |
| Transport | Routes, vehicles, assignments |
| Inventory | Assets, supplies, stock |
| HR | Employees, payroll, leave |
| Communication | Announcements, notifications |
| Documents | File management |
| Reports | PDF, Excel, CSV exports |
| Website | Public CMS content |

## Environment Variables

See `backend/.env.example`, `front-end/school-website/.env.example`, and `front-end/school-dashboard/.env.example`.

## License

Proprietary - Biruk Academy Primary School
