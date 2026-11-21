# Loky Media web

Next.js 16 + Tailwind v4 + shadcn/ui front end for the Loky Media DOOH marketplace, with a database-backed
vendor onboarding workflow (representative → admin review → vendor dashboard → customer listing).
Works on PostgreSQL (Neon) or MySQL 8; uploads go to local disk or Vercel Blob.

## Run locally

```bash
cp .env.local.example .env.local   # then edit DATABASE_URL (postgresql:// or mysql://), JWT_SECRET, ENCRYPTION_KEY
npm install
npm run db:sync                    # creates the 12 tables (add -- --force to recreate)
npm run db:seed                    # categories, staff logins, demo vendor + the real Patna sites (scripts/data/lokymedia-sites.json)
npm run dev                        # http://localhost:3000
```

Seeded logins (all at `/login`):

| Role           | Username               | Password      |
|----------------|------------------------|---------------|
| Admin          | `admin`                | `Admin@12345` |
| Representative | `rep.anita`            | `Rep@12345`   |
| Vendor         | `bulzads-demo`         | `Vendor@12345`|
| Customer       | `customer@example.com` | `Customer@12345` |
| Agency owner   | `aakash@mehramedia.in` | `Agency@12345` |
| Agency member  | `sarah@mehramedia.in`  | `Agency@12345` |

Agencies self-register at `/agency/register` (dev builds display the OTP on the verify page).

Advertisers do not need a password: picking billboards on the listing or the **map** (`/listing?view=map`),
pressing **Create quotation** and entering name, email and mobile creates their login. They sign in later at
`/login/otp` with the mobile number and a one-time code (shown on screen until an SMS provider is wired), and
find their quotations under **My quotations** (`/my/quotations`); **Orders** is a placeholder for the booking step.
Every quotation renders as the house-style deck (cover, rate card, summary, one page per location) with a
**Download PDF** button and a public share link (`/qt/<token>`).

## Billboard catalogue

The billboards are the live Loky Media network, snapshotted from `https://www.lokymedia.com/api/product/list`
(coordinates resolved from each site's Google Maps link, photos compressed into `public/img/sites/`). To refresh:

```bash
npm run db:import-sites     # rewrite scripts/data/lokymedia-sites.json + photos from the website API
npm run db:reseed-sites     # replace every billboard in the database with that snapshot (removes anything else)
```

`db:reseed-sites` deletes billboards that are not in the snapshot together with their media, rates, review
rows, campaign screens and quotation lines, so run it against production deliberately.

## Checks

```bash
npm run typecheck
npm run lint
npm run e2e          # browser-driven lifecycle test; needs the dev server running and Google Chrome installed
npm run e2e:edge     # edge cases: auth limits, validation, file permissions, post-approval billboards, mobile overflow
npm run e2e:agency   # agency lifecycle: register → OTP → assessment → brand → proposal → quotation → work order → payments → live
npm run e2e:quote    # map view → add billboards → quotation builder → mobile OTP login → quotation PDF → My quotations
npm run e2e:all      # all suites, in order (edge suites build on the lifecycle run)
E2E_HEADLESS=0 npm run e2e:all   # watch it happen in a visible Chrome window
```

## Deploy

```bash
npx vercel login && npx neonctl auth   # once
npm run deploy:vercel                  # Neon Postgres + Vercel + Vercel Blob, end to end
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for the manual steps, other hosts and the known limits, and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the layering, guards and state machine.
