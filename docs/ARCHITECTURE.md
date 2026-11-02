# Loky Media — application architecture

One Next.js 16 App Router deployment serves four portals. Code is layered so that each layer only
imports from the layer below it; nothing above the service layer touches the database.

```
src/
├── lib/domain.ts          Domain vocabulary: enums, labels, StepState. Pure TS, imported by every layer (incl. client).
├── lib/validation.ts      Zod schemas shared by forms (client) and server actions. One definition of "valid".
├── lib/format.ts          en-IN formatters (money, dates, impressions).
├── lib/session.ts         JWT sign/verify + cookie name. Edge-safe (used by proxy.ts).
├── lib/server/            Node-only helpers: env (validated), auth (session cookie, role guards), crypto, password, rate-limit.
├── db/                    Persistence: Sequelize singleton + 12 models with associations. Only services import this.
├── services/              Business rules & transactions: onboarding, review, catalog, auth, files, vendor-portal, rep-page.
├── actions/               "use server" entry points: parse FormData → validate → call a service → revalidate/redirect.
├── proxy.ts               Edge role guard for /admin, /rep, /vendor (optimistic; actions re-check).
├── app/                   Routes. Server components load data through services; client components only render + call actions.
└── components/            portal/ (shared shell, form primitives, status pills, timeline) · rep/ · admin/ · vendor/ · auth/ · site/ · listing/ · detail/
```

## Request flow

```
browser form ──▶ server action (actions/*)        ──▶ service (services/*) ──▶ Sequelize models ──▶ MySQL
                  • assertRole()                       • ownership checks
                  • zod parse → fieldErrors            • state machine rules
                  • returns ActionState {ok,error,      • one transaction per step
                    errors,values,data}                 • onboarding_events audit row
                  • revalidatePath / redirect
```

* **ActionState.values** echoes submitted fields so React 19's post-action form reset never loses input.
* **Reads** happen in server components via services (`loadVendor` is `cache()`d per request so a layout and
  its page share one query). Client components receive plain props only.
* **Visibility**: customers only ever see `billboards.status = approved` joined to `vendors.status = approved`.

## Roles and guards

| Area      | proxy.ts (edge) | Server side                                  |
|-----------|-----------------|----------------------------------------------|
| /admin    | role = admin    | `requireRole("admin")` in layout + `assertRole` in every action |
| /rep      | representative  | `loadVendorForRep` also checks `onboardedBy = session.uid`      |
| /vendor   | vendor          | `loadMyVendor` scopes every query to `session.vendorId`          |
| public    | –               | `SiteHeader` reads the session for the account menu only         |

Vendors with `mustChangePassword` are redirected to `/vendor/settings/password` by the proxy only (never by
`requireRole`, which would loop).

## Onboarding state machine

* `vendors.status`: draft → pending ⇄ changes_requested → approved | rejected. Derived from `review_sections`;
  `approveSection` finalises the vendor inside the same transaction when no non-approved section remains
  (row lock on the vendor).
* `review_sections`: one row per section A–D plus one per billboard (E). `lastEditedAt` is written by the service
  that saves that section; `resubmit` refuses while any flagged section has `lastEditedAt <= reviewedAt`.
* `billboards.status` follows its own section; `live_status` is operational and only meaningful once approved.
* Billboards added after approval get their own section-E row and are reviewed alone.

## Files

Uploads go through `services/files.storeUpload` to `UPLOAD_DIR` (local disk; swap the adapter for S3).
Every reference is a `files.id`. `/api/files/[id]` streams them: billboard media is public (`public_url` set);
KYC documents require the owning rep, the vendor, or an admin.

## Conventions

* Add a new enum value in `lib/domain.ts` first; models and UI pick it up from there.
* A new form = zod schema in `lib/validation.ts` + service function + action + client form using `useActionState`.
* Never import `@/db` from a client component or from `lib/session.ts` / `proxy.ts` (edge bundle).
* Scripts: `npm run db:sync` (`-- --alter` to add columns, `-- --force` to recreate), `npm run db:seed`, `npm run e2e`.

## Agency module (added 2026-10-18)

Mirrors the Figma "Agency superadmin dashboard" page and its five flow boards. Same layering: `lib/domain.ts` (agency enums,
tier constants) → `db/agency-models.ts` (16 tables) → `services/agency.ts` + `services/deals.ts` → `actions/agency.ts`,
`actions/admin-agency.ts` → `app/(agency)/agency/*` (authed shell) and `app/(agency-public)/agency/{register,verify}`.

| Phase (Figma) | Implementation |
|---|---|
| 1 · Low-friction onboarding & verification | `/agency/register` (profile → founder) creates `users` (role `agency`) + `agencies` + owner `agency_members`, issues an `otp_codes` row. Verification path is derived from the email domain + GSTIN (`enterprise` / `public` / `unregistered` → expert callback). `/agency/verify` consumes the OTP; `verifiedAt` gates the workspace. No SMS/email provider yet: dev builds show the code (cookie `loky_dev_otp`). |
| Restricted landing | `agencies.status = registered`: sidebar locks everything but Dashboard/Settings, hero banner → assessment. `loadAgencyPage({ requirePartner })` enforces it server-side. |
| 2 · Partner assessment & tier unlock | `/agency/assessment` → `scoreAssessment()` → `commissionForScore()` (7.5 / 8.0 / 8.4 %), `agency_assessments` row, status `partner`, success screen with the First Order Rush progress. |
| 3 · Visual pitch builder | `/agency/proposals/new`: brand + live screens (`liveScreens()`) + creatives + theme → `proposals`, `proposal_items`, `proposal_files`. Public `/p/[token]` renders the 5–8 page pitch (no pricing) and counts client views (`viewCount`, agency sessions excluded). |
| 4 · Commercial quotation builder | `/agency/quotations/new`: `computeTotals()` = Σ offer price (slot × package from `billboard_slot_pricing`) − coupon (`coupons`) + margin % + add-on, EMI split. `createQuotation()` persists `quotations` + `quotation_items` and sets `brands.lockedUntil` (21-day lock-in). Public `/q/[token]`. |
| 5 · Close, sign & live activation | `lockCampaign()` → `campaigns` (work order no.), `campaign_screens`, `payments` schedule (100 % or 50 % + 3 EMIs). `recordPayment()` (simulated gateway) flips `pending_payment → confirmed` once the upfront threshold is met, credits 5 % wallet cashback on Path A and the ₹2,500 Level 2 bonus on the first confirmed order (`wallet_transactions`, `agencies.level/commissionPct`). `signWorkOrder()` → `active`. Confirmed/active `campaign_screens` show as booked slots in the vendor console. |

Roles: `agency` (owner; can add team) and `agency_member`; both get `session.agencyId` from `agency_members`.
Admin: `/admin/agencies` (list, detail, commission override, suspend) and `/admin/coupons`.
E2E: `npm run e2e:agency` (36 checks) covers the whole lifecycle including the vendor-side occupancy and admin views.
