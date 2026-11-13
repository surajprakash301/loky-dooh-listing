# Deploying Loky Media web

This is a single Next.js 16 (App Router) application that serves the public marketplace, the vendor
console, the representative/admin portals and the agency workspace. It needs **Node.js 20+**, a
**PostgreSQL** (Neon) or **MySQL 8** database, and somewhere to keep uploads (local disk or Vercel Blob).

**Fastest path — Vercel + Neon + Vercel Blob:** see [section 6](#6-vercel--neon--vercel-blob-recommended).
Everything there is automated by `npm run deploy:vercel`.

## 1. Prerequisites

| Requirement | Notes |
|---|---|
| Node.js ≥ 20 (22 recommended) | `node --env-file` is used by the DB scripts, so 20.6+ is required. |
| npm ≥ 10 | Ships with Node 20/22. |
| PostgreSQL (Neon, RDS, Supabase…) **or** MySQL 8.x | The dialect is chosen from the `DATABASE_URL` scheme (`postgresql://` or `mysql://`). Create an empty database and a user with full rights on it. |
| Disk or Vercel Blob for uploads | Local disk (`UPLOAD_DIR`) on a VPS/container; Vercel Blob (`BLOB_READ_WRITE_TOKEN`) on Vercel or any other serverless host. Private documents (KYC) get unguessable blob names and are only handed out through `/api/files/[id]` after the auth check. |

## 2. Environment variables

Copy `.env.local.example` to `.env.local` for local work, or set these in your host's dashboard.
They are validated at boot (`src/lib/server/env.ts`); the server refuses to start with a readable error if any is wrong.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | `postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require` (Neon: use the **pooled** connection string for the app) or `mysql://USER:PASSWORD@HOST:3306/DBNAME`. TLS is forced for any non-local Postgres host. |
| `JWT_SECRET` | yes | ≥ 32 random characters. Signs the session cookie. Generate: `openssl rand -base64 48` |
| `ENCRYPTION_KEY` | yes | Exactly 64 hex characters (32 bytes). Encrypts KYC fields at rest. Generate: `openssl rand -hex 32` |
| `UPLOAD_DIR` | no | Where uploaded files are stored on disk. Default `./uploads`. Must be writable and persistent. Ignored when Blob is used. |
| `BLOB_READ_WRITE_TOKEN` | on Vercel | Vercel Blob token. When set, uploads go to Blob instead of disk (Vercel injects it automatically once a Blob store is connected to the project). |
| `FILE_STORAGE` | no | `disk` or `blob`. Defaults to `blob` when `BLOB_READ_WRITE_TOKEN` is present, otherwise `disk`. |
| `BLOB_ACCESS` | no | `public` (default) or `private`; must match the access level the Blob store was created with. |
| `NODE_ENV` | no | Set to `production` on servers (most hosts do this for you). |

Rotating `ENCRYPTION_KEY` after data exists will make previously encrypted fields unreadable — back it up.

## 3. First-time database setup

Run these once against the production database (from your machine or a CI job that has the env vars).
The same scripts work for Postgres and MySQL:

```bash
npm ci
npm run db:sync          # creates all tables from the Sequelize models
npm run db:seed          # categories, staff logins, demo vendors (optional in production — see below)
```

`db:sync` is additive and safe on an empty database. For schema changes later:

- `npm run db:sync -- --alter` — adds/changes columns in place (fine for dev/staging, review before prod).
- `npm run db:sync -- --force` — **drops and recreates every table**. Never run this against production data.

The seed creates the logins listed in `README.md` (`admin / Admin@12345`, etc.). If you seed production,
**change those passwords immediately** or delete the demo users; at minimum keep the `admin` user and
rotate its password from `/admin`.

> The scripts read `.env.local` via `node --env-file`. On a CI runner without that file, export the variables
> and run `npx tsx scripts/db-sync.ts` / `npx tsx scripts/seed.ts` directly.

## 4. Build and run (Node server)

```bash
npm ci
npm run typecheck && npm run lint   # optional gate
npm run build
npm run start                       # listens on $PORT or 3000
```

The build does not need database access; pages that read data render on demand at request time.
Serve behind a reverse proxy (Nginx/Caddy) that terminates TLS and forwards to port 3000.

### Process manager example (PM2)

```bash
npm i -g pm2
pm2 start npm --name loky-web -- start
pm2 save && pm2 startup
```

### systemd example

```ini
[Unit]
Description=Loky Media web
After=network.target

[Service]
WorkingDirectory=/srv/loky-media-web
EnvironmentFile=/srv/loky-media-web/.env.production
ExecStart=/usr/bin/npm run start
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

## 5. Docker

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
VOLUME ["/app/uploads"]
EXPOSE 3000
CMD ["npm", "run", "start"]
```

```bash
docker build -t loky-web .
docker run -d --name loky-web -p 3000:3000 \
  -e DATABASE_URL='mysql://user:pass@db-host:3306/loky' \
  -e JWT_SECRET="$(openssl rand -base64 48)" \
  -e ENCRYPTION_KEY="$(openssl rand -hex 32)" \
  -e UPLOAD_DIR=/app/uploads \
  -v loky-uploads:/app/uploads \
  loky-web
```

Run the one-time DB setup from the same image: `docker run --rm --env-file .env.production loky-web npx tsx scripts/db-sync.ts`.

## 6. Vercel + Neon + Vercel Blob (recommended)

Frontend and server code run on Vercel, the database is a Neon Postgres project, uploads live in a
Vercel Blob store. `vercel.json` pins functions to Singapore (`sin1`) so they sit next to Neon's
`aws-ap-southeast-1` region.

### 6a. Automated (one command)

```bash
npx vercel login          # opens a browser, once
npx neonctl auth          # opens a browser, once
npm run deploy:vercel     # everything below, end to end
```

`scripts/deploy-vercel-neon.sh` creates (or reuses) the Neon project `loky-media`, creates the tables
and seeds the demo data, links/creates the Vercel project `loky-media-web`, creates the Blob store
`loky-uploads`, generates `JWT_SECRET` / `ENCRYPTION_KEY`, sets every env var on *production* and
*preview*, and runs `vercel deploy --prod`. The generated secrets and both Neon connection strings are
written to `.vercel/deploy-state.env` (gitignored) — back that file up. Re-running the script reuses
them. Variables: `SEED=0` skips the demo seed, `NEON_REGION`, `PROJECT`, `NEON_PROJECT`, `BLOB_STORE`.

If the Blob store cannot be connected from the CLI, the script stops and tells you to connect it once in
the dashboard (Storage → store → *Connect Project*); re-run afterwards.

### 6b. Manual (dashboard)

1. **Neon** — [console.neon.tech](https://console.neon.tech) → *New project* → name `loky-media`, region
   Singapore. Copy both connection strings: the **pooled** one (host contains `-pooler`) for the app,
   the direct one for scripts.
2. **Tables + seed** — from your machine:
   ```bash
   DATABASE_URL='postgresql://…direct…?sslmode=require' JWT_SECRET='…' ENCRYPTION_KEY='…' npx tsx scripts/db-sync.ts
   DATABASE_URL='postgresql://…direct…?sslmode=require' JWT_SECRET='…' ENCRYPTION_KEY='…' npx tsx scripts/seed.ts   # optional
   ```
3. **Vercel** — *Add New → Project* → import `surajprakash301/loky-dooh-listing`. Framework is detected
   as Next.js; leave build settings alone.
4. **Blob** — in the project: *Storage → Create → Blob* → name `loky-uploads` → *Connect*. This injects
   `BLOB_READ_WRITE_TOKEN`.
5. **Environment variables** (Settings → Environment Variables, production + preview):
   `DATABASE_URL` (pooled Neon string), `JWT_SECRET` (`openssl rand -base64 48`),
   `ENCRYPTION_KEY` (`openssl rand -hex 32`), `FILE_STORAGE=blob`.
6. *Deploy*. Afterwards every push to `main` redeploys automatically; pull requests get preview URLs
   that share the same Neon database.

### Limits to know on Vercel

- **Upload size** — Vercel caps function request bodies at 4.5 MB; `next.config.ts` sets the server-action
  limit to 4 MB accordingly. Larger creatives/videos need a client-side upload to Blob (`@vercel/blob/client`),
  which is not wired yet.
- **Login rate limiting** is in-memory per function instance (`src/lib/server/rate-limit.ts`); on serverless it
  only limits within one warm instance. Move it to Upstash/Redis for a hard limit.
- **Agency OTP** is still shown on the verify page (no SMS/email provider exists yet) — fine for a demo, not for
  public launch.
- Neon's free tier suspends idle computes; the first request after a pause takes ~1 s longer.

### Other serverless / container hosts

Railway / Render / Fly.io work with either database: attach Postgres or MySQL, mount a volume at `/app/uploads`
(or set `BLOB_READ_WRITE_TOKEN` to keep using Vercel Blob), set the env vars, and use the Dockerfile above or their
Node buildpack (`npm run build` → `npm run start`).

## 7. Post-deploy checklist

- [ ] `https://<domain>/` loads the marketplace home; `/listing` shows seeded or real billboards.
- [ ] `/login` works for an admin; change all seeded passwords.
- [ ] Upload a billboard photo from the vendor console and confirm it is served from `/api/files/<id>` after a restart (persistence).
- [ ] `/vendor/dashboard`, `/admin`, `/rep`, `/agency` are reachable only for their roles (edge guard in `src/proxy.ts`).
- [ ] Back up `ENCRYPTION_KEY` and `JWT_SECRET` in your secrets manager.
- [ ] Schedule database backups (Neon keeps point-in-time history; MySQL needs a dump job) and back up the uploads volume or Blob store.

## 8. Updating a running deployment

```bash
git pull
npm ci
npm run db:sync -- --alter   # only if the release changes models; review the diff first
npm run build
pm2 restart loky-web         # or restart the container / service
```

## 9. Running the E2E suites against a deployment

The browser tests in `e2e/` drive a real Chrome against a running server (default `http://localhost:3000`).
They create and mutate data, so point them at staging, not production:

```bash
E2E_BASE_URL=https://staging.example.com npm run e2e:all
```

Other knobs: `E2E_HEADLESS=0` opens a visible browser; `E2E_CHROME=/path/to/chrome` overrides the Chrome binary
(defaults to the Google Chrome install on macOS).

See `README.md` for the individual suites and `docs/ARCHITECTURE.md` for how the layers fit together.
