# Screen Riot

Monorepo for a film funding platform. Three applications:
- **web** — Next.js (public site + dashboard)
- **api** — NestJS (REST API, auth, Stripe, Prisma/PostgreSQL, S3)
- **admin** — Vite + React (admin panel)

Database: **PostgreSQL** via Prisma. Local storage: **MinIO** (S3 compatible).

## Requirements

- **Node.js** ≥ 20  
- **pnpm** 9.x  
- **Docker** (for Postgres + MinIO in development)

## Quick start (local development)

```bash
git clone <GITHUB_REPO_URL>
cd screenriot
pnpm install
cp .env.example .env
# edit .env if needed (DATABASE_URL, JWT_SECRET, STRIPE_*, S3_*, etc.)
pnpm run dev:all
```

After startup:

- **Web app (Next.js):** http://localhost:3000  
- **API (NestJS):** http://localhost:3001  
- **Swagger:** http://localhost:3001/docs  
- **Admin panel (Vite):** http://localhost:3002  
- **MinIO S3 endpoint:** http://localhost:9000  
- **MinIO Console:** http://localhost:9001  
- **Health check:** `pnpm run health`

## GitHub & repository

- The project lives in a GitHub **Organization** repository under the `screenriot-collab` account (see `docs/DEPLOYMENT_DISCUSSION.md`, section 1).
- The following **local-only** files are not committed and stay on the developer machine:
  - `.claude/` — Claude Code local settings,
  - `CLAUDE.md` (and `apps/*/CLAUDE.md`) — Claude Code project instructions,
  - `docs/` — architecture notes, deployment discussion, work plan.
- Main branches:
  - `dev` — main development branch (CI: lint + build),
  - `stage` — staging environment (automatic deploy),
  - `prod` — production (protected, deploy to production only).
- Workflow: new work happens on a `feature/<short-description>` branch off `dev`, opened as a PR into `dev` once CI is green.

Initial push:

```bash
git init
git remote add origin <GITHUB_REPO_URL>
git checkout -b dev
git add .
git commit -m "chore: bootstrap Screen Riot monorepo"
git push -u origin dev
```

## Film detail page (design alignment)

Film detail — open gaps vs design: **[apps/web/docs/FILM_DETAIL_ALIGNMENT.md](apps/web/docs/FILM_DETAIL_ALIGNMENT.md)** (remaining API/UI items).

## MinIO (local S3)

- **S3 API endpoint (from host):** `http://localhost:9000`  
- **Console UI:** `http://localhost:9001`  
- **Default credentials:** `minioadmin` / `minioadmin` (see `.env.example`)  
- **Default bucket:** `screenriot`

Environment for `apps/api` (local):

- `S3_ENDPOINT=http://localhost:9000`
- `S3_ACCESS_KEY=minioadmin`
- `S3_SECRET_KEY=minioadmin`
- `S3_BUCKET=screenriot`

From inside Docker containers the endpoint is `http://minio:9000`.

**Port 9000 already in use** (another project’s MinIO): in your local `.env` only, set `MINIO_API_PORT=9002`, `MINIO_CONSOLE_PORT=9003`, and `S3_ENDPOINT=http://localhost:9002`, then `docker compose up -d --force-recreate minio`. Production uses its own `S3_*` in the host environment (R2/S3), not these ports.

**Posters/videos 404 locally:** files may have been uploaded to the wrong MinIO instance; re-upload poster/teaser/avatar after MinIO is reachable on the port in `S3_ENDPOINT`.

## Scripts (from repo root)

| Command                | Description                                      |
|------------------------|--------------------------------------------------|
| `pnpm run dev:all`     | Start Docker (postgres, minio) + all apps       |
| `pnpm run dev`         | Start only apps (Docker already running)        |
| `pnpm run dev:api`     | Start only API (NestJS, port 3001)              |
| `pnpm run dev:down`    | Stop Docker containers                          |
| `pnpm run health`      | Health check (GET /health)                      |
| `pnpm run build`       | Build all apps                                  |
| `pnpm run lint`        | Lint all apps (web, api, admin)                 |
| `pnpm run db:generate` | Generate Prisma client                          |
| `pnpm run db:migrate`  | Run DB migrations                               |
| `pnpm run db:push`     | Sync Prisma schema to DB (no migration files)   |
| `pnpm run db:studio`   | Open Prisma Studio                              |

## Environment

All env variables are loaded from the root `.env` file (see `.env.example`).  
API reads `PORT` (default **3001**). Web app uses `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).

For full functionality and deployment you will need:

- **PostgreSQL** (local Docker or managed: Neon/Supabase) — `DATABASE_URL`.  
- **S3-compatible storage** (local MinIO, staging/production Cloudflare R2 or AWS S3):
  - `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`.
- **Accounts for external services** (used in CI/CD and environments):
  - GitHub (organization + private repo),
  - Vercel (web + admin),
  - Render (api),
  - Neon (PostgreSQL),
  - Cloudflare R2 (media),
  - Mailtrap / SendGrid / SES (email),
  - Stripe (payments and webhooks).

Details about variables and services are documented (for developers) in `docs/PROJECT_ARCHITECTURE.md` and `docs/DEPLOYMENT_DISCUSSION.md` (these docs are local-only and are not pushed to GitHub).

## Project structure

```text
apps/
  web/     - Next.js web app (port 3000)
  api/     - NestJS API (port 3001)
  admin/   - Vite admin panel (port 3002)
prisma/    - database schema and migrations
docs/      - architecture, work plan (local only, gitignored)
scripts/   - dev-all.js, health-check.js
```

## CI

GitHub Actions workflow lives in `.github/workflows/ci.yml` and, on every push/PR to `dev`, `stage`, or `prod`, runs:

- `pnpm install`
- `pnpm run lint`
- `pnpm run build`

This ensures all three apps (web, api, admin) lint and build successfully before merging. Future test suites can be wired into the same workflow via `pnpm run test`.
