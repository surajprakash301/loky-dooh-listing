# Loky Media web

Next.js 16 + Tailwind v4 + shadcn/ui front end for the Loky Media DOOH marketplace, with a MySQL-backed
vendor onboarding workflow (representative → admin review → vendor dashboard → customer listing).

## Run locally

```bash
cp .env.local.example .env.local   # then edit DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY
npm install
npm run db:sync                    # creates the 12 tables (add -- --force to recreate)
npm run db:seed                    # categories, staff logins, two demo vendors
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

## Checks

```bash
npm run typecheck
npm run lint
npm run e2e          # browser-driven lifecycle test; needs the dev server running and Google Chrome installed
npm run e2e:edge     # edge cases: auth limits, validation, file permissions, post-approval billboards, mobile overflow
npm run e2e:agency   # agency lifecycle: register → OTP → assessment → brand → proposal → quotation → work order → payments → live
npm run e2e:all      # all suites, in order (edge suites build on the lifecycle run)
E2E_HEADLESS=0 npm run e2e:all   # watch it happen in a visible Chrome window
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the layering, guards and state machine.
