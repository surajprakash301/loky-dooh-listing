# Deploying Loky Media web

This is a single Next.js 16 (App Router) application that serves the public marketplace, the vendor
console, the representative/admin portals and the agency workspace. It needs **Node.js 20+**, a
**MySQL 8** database and a writable directory for uploads.

## 1. Prerequisites

| Requirement | Notes |
|---|---|
| Node.js ≥ 20 (22 recommended) | `node --env-file` is used by the DB scripts, so 20.6+ is required. |
| npm ≥ 10 | Ships with Node 20/22. |
| MySQL 8.x | Any managed MySQL works (PlanetScale*, AWS RDS, Azure Database for MySQL, DigitalOcean, Railway). Create an empty database and a user with full rights on it. |
| Disk or object storage for uploads | Default adapter writes to `UPLOAD_DIR` on local disk. On serverless hosts mount a volume or swap the adapter in `src/services/files.ts` for S3/R2. |

\* PlanetScale does not support foreign keys by default — enable them on the branch, or use another provider.

## 2. Environment variables

Copy `.env.local.example` to `.env.local` for local work, or set these in your host's dashboard.
They are validated at boot (`src/lib/server/env.ts`); the server refuses to start with a readable error if any is wrong.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | `mysql://USER:PASSWORD@HOST:3306/DBNAME`. Append `?ssl=true` style options if your provider needs TLS (mysql2 URL options are passed through). |
| `JWT_SECRET` | yes | ≥ 32 random characters. Signs the session cookie. Generate: `openssl rand -base64 48` |
| `ENCRYPTION_KEY` | yes | Exactly 64 hex characters (32 bytes). Encrypts KYC fields at rest. Generate: `openssl rand -hex 32` |
| `UPLOAD_DIR` | no | Where uploaded files are stored. Default `./uploads`. Must be writable and persistent. |
| `NODE_ENV` | no | Set to `production` on servers (most hosts do this for you). |

Rotating `ENCRYPTION_KEY` after data exists will make previously encrypted fields unreadable — back it up.

## 3. First-time database setup

Run these once against the production database (from your machine or a CI job that has the env vars):

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

## 6. Vercel (or other serverless hosts)

The app deploys to Vercel as a standard Next.js project — import the repo, set the three required env vars,
deploy. Two caveats:

1. **Uploads** — serverless filesystems are ephemeral, so `UPLOAD_DIR` on disk will lose files between
   deployments. Replace the local-disk adapter in `src/services/files.ts` with S3/Cloudflare R2/Vercel Blob
   before going live, or deploy to a host with a persistent volume (Railway, Render, Fly.io, a VPS).
2. **Database** — use a MySQL provider reachable from Vercel's network (TLS enabled). Run `db:sync`/`db:seed`
   from your machine or a GitHub Action, not from the Vercel build step.

Railway / Render / Fly.io work without code changes: attach a MySQL service, mount a volume at `/app/uploads`,
set the env vars, use the Dockerfile above or their Node buildpack (`npm run build` → `npm run start`).

## 7. Post-deploy checklist

- [ ] `https://<domain>/` loads the marketplace home; `/listing` shows seeded or real billboards.
- [ ] `/login` works for an admin; change all seeded passwords.
- [ ] Upload a billboard photo from the vendor console and confirm it is served from `/api/files/<id>` after a restart (persistence).
- [ ] `/vendor/dashboard`, `/admin`, `/rep`, `/agency` are reachable only for their roles (edge guard in `src/proxy.ts`).
- [ ] Back up `ENCRYPTION_KEY` and `JWT_SECRET` in your secrets manager.
- [ ] Schedule MySQL backups and back up the uploads volume.

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
