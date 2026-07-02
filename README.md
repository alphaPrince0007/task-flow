# TaskFlow — Task Management System

A scalable REST API with JWT authentication and role-based access control (RBAC), plus a clean dashboard UI to exercise it. Built as a small SaaS backend — modular services, a repository layer, validated inputs, centralized errors, and interactive API docs — rather than a throwaway CRUD demo.

**Stack:** Next.js 15 (App Router) · TypeScript (strict) · Prisma ORM · SQLite (Postgres-ready) · JWT (`jose`) · bcrypt · Zod · React Hook Form · Tailwind CSS · Swagger/OpenAPI

---

## Table of contents

1. [Features](#features)
2. [Quick start](#quick-start)
3. [Demo accounts](#demo-accounts)
4. [Environment variables](#environment-variables)
5. [API reference](#api-reference)
6. [Project structure](#project-structure)
7. [Architecture](#architecture)
8. [Database schema](#database-schema)
9. [Security](#security)
10. [Testing](#testing)
11. [Switching to PostgreSQL](#switching-to-postgresql)
12. [Deployment](#deployment)
13. [Scalability notes](#scalability-notes)
14. [AI assistance disclosure](#ai-assistance-disclosure)

---

## Features

**Authentication & authorization**
- Register / login / logout with bcrypt-hashed passwords
- Stateless JWT auth (access + refresh tokens) delivered as **HTTP-only cookies**
- Two roles — `USER` and `ADMIN` — enforced by a single server-side guard
- Edge middleware protects dashboard routes; APIs re-check on every request

**Tasks (CRUD for the secondary entity)**
- Create, read, update, delete
- Pagination, full-text search, status/priority filters, sortable columns
- Ownership rules: users see only their own tasks; admins see all

**Admin**
- List all users with task counts
- Change user roles; delete users (cascades to their tasks)
- Self-protection: an admin can't delete or demote their own account

**Platform**
- Consistent response envelope and HTTP status codes
- Centralized error handling and structured logging
- Interactive Swagger docs at `/api/docs`
- Responsive UI with dark mode, loading skeletons, empty states, and toasts

---

## Quick start

**Prerequisites:** Node.js 18.18+ (Node 20+ recommended).

```bash
# 1. Install dependencies
npm install

# 2. Set up the database (generates the Prisma client, creates the SQLite
#    database, and seeds demo data — all in one command)
npm run setup

# 3. Start the dev server
npm run dev
```

Open **http://localhost:3000**. Log in with a demo account below, or register a new user.

> The `.env` file ships with working development defaults, so the app runs immediately after `npm run setup`. For production, generate your own `JWT_SECRET` (see [Environment variables](#environment-variables)).

**Useful scripts**

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run start` | Serve the production build |
| `npm run setup` | Generate client + create DB + seed (one-shot) |
| `npm run db:seed` | Re-seed demo data (idempotent) |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser) |
| `npm test` | Run the unit test suite |
| `npm run lint` | Lint |

---

## Demo accounts

Created by the seed script:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@taskflow.dev` | `Admin@123` |
| User | `user@taskflow.dev` | `User@123` |

---

## Environment variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Prisma connection string | `file:./dev.db` (SQLite) |
| `JWT_SECRET` | Secret for signing tokens (≥32 chars) | dev placeholder |
| `ACCESS_TOKEN_TTL` | Access-token lifetime | `15m` |
| `REFRESH_TOKEN_TTL` | Refresh-token lifetime | `7d` |
| `NODE_ENV` | Environment | `development` |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The config layer (`src/config/env.ts`) validates these with Zod at startup — if a required value is missing or too weak, the app refuses to boot with a clear message rather than failing mysteriously later.

---

## API reference

Base path: `/api/v1`. Interactive docs (with “Try it out”): **`/api/docs`**.

Every response uses one shape:

```jsonc
// success
{ "success": true, "message": "…", "data": { … } }
// error
{ "success": false, "message": "…", "errors": { "field": ["…"] } }
```

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account, set auth cookies |
| POST | `/auth/login` | Public | Log in, set auth cookies |
| POST | `/auth/logout` | Public | Clear auth cookies |
| GET | `/auth/me` | Auth | Current user's profile |
| PATCH | `/auth/me` | Auth | Update name / email |

### Tasks

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/tasks` | Auth | List (paginate/search/filter/sort) |
| POST | `/tasks` | Auth | Create a task |
| GET | `/tasks/stats` | Auth | Aggregate counts for the dashboard |
| GET | `/tasks/:id` | Owner/Admin | Fetch one task |
| PATCH | `/tasks/:id` | Owner/Admin | Update one task |
| DELETE | `/tasks/:id` | Owner/Admin | Delete one task |

`GET /tasks` query params: `page`, `limit`, `search`, `status`, `priority`, `sortBy` (`createdAt|dueDate|priority|title`), `sortOrder` (`asc|desc`).

### Admin (role = ADMIN)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users with task counts |
| PATCH | `/users/:id/role` | Change a user's role |
| DELETE | `/users/:id` | Delete a user (and their tasks) |

**Status codes used:** 200, 201, 400 (validation), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict), 500.

### Quick cURL example

```bash
# Log in and save cookies, then create a task with that session
curl -s -c cookies.txt -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@taskflow.dev","password":"User@123"}'

curl -s -b cookies.txt -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","priority":"HIGH"}'
```

A ready-to-import **Postman collection** is included at `postman/TaskFlow.postman_collection.json`.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/              # login, register (public, centered layout)
│   ├── (dashboard)/         # dashboard, tasks, profile, admin (protected)
│   ├── api/
│   │   ├── v1/              # versioned REST endpoints
│   │   │   ├── auth/        # register, login, logout, me
│   │   │   ├── tasks/       # CRUD + stats
│   │   │   └── users/       # admin user management
│   │   └── docs/            # Swagger UI + OpenAPI JSON
│   ├── error.tsx            # global error boundary
│   ├── not-found.tsx        # 404
│   └── layout.tsx           # root layout + theme
├── components/
│   ├── ui/                  # design-system primitives (button, input, …)
│   └── dashboard-nav.tsx    # responsive sidebar / drawer
├── features/tasks/          # task form (feature-scoped component)
├── services/                # business logic (auth, task, user)
├── repositories/            # data access (only place that calls Prisma)
├── lib/                     # jwt, password, auth guards, errors, validation, …
├── config/                  # validated env + constants
├── types/                   # shared types & DTOs
└── middleware.ts            # edge route protection

prisma/
├── schema.prisma           # models
└── seed.ts                 # demo data
```

---

## Architecture

Requests flow through clear layers, each with one responsibility:

```
Client (React)
   │  fetch (cookies)
   ▼
Route handler (app/api/**)   ← thin: parse + validate + delegate
   ▼
Service (services/**)        ← business rules, authorization, orchestration
   ▼
Repository (repositories/**) ← all database access (Prisma)
   ▼
PostgreSQL / SQLite
```

**Why this shape?** Route handlers stay thin and readable; business logic is centralized and unit-testable; and because only repositories touch Prisma, the persistence layer can change (swap ORM, add a cache) without rippling through the app. This mirrors how production teams keep controllers, services, and data access separate (SOLID / single-responsibility).

---

## Database schema

```
User                          Task
────                          ────
id            (cuid, PK)      id           (cuid, PK)
name                          title
email         (unique)        description  (nullable)
passwordHash                  status       PENDING | IN_PROGRESS | COMPLETED
role          USER | ADMIN    priority     LOW | MEDIUM | HIGH
createdAt                     dueDate      (nullable)
updatedAt                     userId       (FK → User, cascade delete)
                              createdAt
   1 ─────────────────< many updatedAt
```

Enum-like fields are stored as strings for SQLite portability but are validated strictly with Zod at the application boundary, so invalid values can never reach the database. Indexes exist on `email`, `userId`, `status`, and `priority` to keep list/filter queries fast.

---

## Security

- **Password hashing** — bcrypt (auto-salted, deliberately slow); plaintext is never stored or logged.
- **JWT in HTTP-only cookies** — tokens aren't readable by client-side JS, mitigating XSS token theft. Cookies are `sameSite=lax` (CSRF mitigation) and `secure` in production.
- **RBAC** — a single server-side choke point (`requireAuth` / `requireAdmin`) gates every protected route; the UI never decides access on its own.
- **Input validation** — every request body and query is parsed with Zod; unknown fields are stripped (defends against mass-assignment / privilege escalation via `role`).
- **Ownership checks** — task reads/writes verify ownership; non-owners get `404` (existence isn't leaked).
- **User-enumeration resistance** — login returns one generic message for both "no such user" and "wrong password".
- **Rate limiting** — login/register are throttled per IP (fixed-window) to blunt brute-force attempts.
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and a `Permissions-Policy` are applied globally.
- **No leaked internals** — a centralized handler returns safe messages and never exposes stack traces in production.

> **Dependency note:** `npm audit` reports a few advisories in **transitive dev-only** dependencies (pulled in by `swagger-ui-react`'s build tooling). They aren't in the runtime path. Next.js is pinned to a patched release (`15.5.19`).

---

## Testing

Unit tests cover the security-critical, pure logic:

```bash
npm test
```

- `src/lib/password.test.ts` — hashing, verification, and per-hash salting.
- `src/lib/validation.test.ts` — password/email rules, enum validation, pagination defaults/caps, and the mass-assignment defense (unknown `role` is stripped).

These run without a database. For end-to-end coverage of the routes (register → login → CRUD → RBAC), the included Postman collection exercises the live API, and the Swagger UI lets you drive each endpoint interactively.

---

## Switching to PostgreSQL

SQLite is the default so the project runs with zero setup. To use Postgres (e.g. Neon or Supabase):

1. Set a Postgres URL in `.env`:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/taskflow?schema=public"
   ```
2. In `prisma/schema.prisma`, change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Regenerate and push:
   ```bash
   npm run prisma:generate && npm run prisma:push && npm run db:seed
   ```

No application code changes are required — the repository layer is database-agnostic.

---

## Deployment

Designed to deploy on **Vercel** with a hosted Postgres (Neon/Supabase):

1. Push to GitHub and import the repo in Vercel.
2. Add environment variables (`DATABASE_URL`, `JWT_SECRET`, TTLs) in the Vercel dashboard.
3. Switch the Prisma provider to `postgresql` (above) and set the build command to `npm run build` (it runs `prisma generate`).
4. Run `prisma db push` (or a migration) against the production database once.

Frontend and API deploy together as a single Next.js app.

---

## Scalability notes

The architecture is modular by design — separate auth, user, and task modules with a clean service/repository split. Paths to scale as traffic grows:

- **Stateless auth** — JWTs carry identity/role, so any number of app instances can sit behind a load balancer with no shared session store.
- **Caching** — a Redis layer can cache hot reads (e.g. task lists, user lookups) and back a distributed rate limiter, replacing the in-memory limiter used here.
- **Database** — Postgres read replicas absorb read-heavy load; the existing indexes keep filtered/sorted queries efficient.
- **Async work** — a queue (e.g. BullMQ) can offload email verification, notifications, or audit logging from the request path.
- **Microservices** — because modules are already decoupled behind services, auth or tasks could be extracted into independent services later without rewriting business logic.

---

## AI assistance disclosure

AI tools were used to assist with brainstorming architecture, explaining concepts, generating boilerplate suggestions, and reviewing code. All implementation decisions, integration, debugging, testing, and final code were reviewed and are fully understood by the project author.

---

## License

MIT — for educational/portfolio use.
