#!/usr/bin/env bash
# One-shot deployment: Neon (Postgres) + Vercel (Next.js) + Vercel Blob (uploads).
#
# Prerequisites (run once, both open a browser):
#   npx vercel login
#   npx neonctl auth
#
# Usage:
#   scripts/deploy-vercel-neon.sh                 # creates everything, seeds demo data, deploys to production
#   SEED=0 scripts/deploy-vercel-neon.sh          # skip the demo seed
#   NEON_REGION=aws-us-east-1 scripts/deploy-vercel-neon.sh
#
# Re-running is safe: it reuses the Neon project / Vercel project if they already exist.
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT="${PROJECT:-loky-media-web}"
NEON_PROJECT="${NEON_PROJECT:-loky-media}"
NEON_REGION="${NEON_REGION:-aws-ap-southeast-1}"   # Singapore — closest Neon region to India; matches vercel.json "sin1"
BLOB_STORE="${BLOB_STORE:-loky-uploads}"
SEED="${SEED:-1}"
STATE=".vercel/deploy-state.env"                      # gitignored; keeps the generated secrets so re-runs reuse them

need() { command -v "$1" >/dev/null 2>&1 || { echo "missing: $1"; exit 1; }; }
need npx; need node; need openssl

echo "==> Checking CLI logins"
npx --yes vercel whoami >/dev/null 2>&1 || { echo "Not logged in to Vercel. Run: npx vercel login"; exit 1; }
npx --yes neonctl me >/dev/null 2>&1 || { echo "Not logged in to Neon. Run: npx neonctl auth"; exit 1; }

mkdir -p .vercel
[ -f "$STATE" ] && source "$STATE"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 48 | tr -d '\n')}"
ENCRYPTION_KEY="${ENCRYPTION_KEY:-$(openssl rand -hex 32)}"
printf 'JWT_SECRET=%q\nENCRYPTION_KEY=%q\n' "$JWT_SECRET" "$ENCRYPTION_KEY" > "$STATE"
chmod 600 "$STATE"

echo "==> Neon project '$NEON_PROJECT'"
NEON_ID=$(npx --yes neonctl projects list -o json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const p=JSON.parse(s).projects.find(x=>x.name===process.argv[1]);process.stdout.write(p?p.id:"")})' "$NEON_PROJECT")
if [ -z "$NEON_ID" ]; then
  NEON_ID=$(npx --yes neonctl projects create --name "$NEON_PROJECT" --region-id "$NEON_REGION" -o json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).project.id))')
  echo "    created $NEON_ID"
else
  echo "    exists  $NEON_ID"
fi
# Pooled URL for the app (serverless-friendly), direct URL for DDL/seeding.
DATABASE_URL=$(npx --yes neonctl connection-string --project-id "$NEON_ID" --pooled)
DIRECT_URL=$(npx --yes neonctl connection-string --project-id "$NEON_ID")
printf 'DATABASE_URL=%q\nDIRECT_URL=%q\n' "$DATABASE_URL" "$DIRECT_URL" >> "$STATE"

echo "==> Creating tables on Neon"
DATABASE_URL="$DIRECT_URL" JWT_SECRET="$JWT_SECRET" ENCRYPTION_KEY="$ENCRYPTION_KEY" npx tsx scripts/db-sync.ts
if [ "$SEED" = "1" ]; then
  echo "==> Seeding demo data (categories, staff logins, demo vendors/agency)"
  DATABASE_URL="$DIRECT_URL" JWT_SECRET="$JWT_SECRET" ENCRYPTION_KEY="$ENCRYPTION_KEY" npx tsx scripts/seed.ts
fi

echo "==> Vercel project '$PROJECT'"
if [ ! -f .vercel/project.json ]; then
  npx --yes vercel link --yes --project "$PROJECT"
fi

echo "==> Vercel Blob store '$BLOB_STORE' (uploads)"
if ! npx --yes vercel env ls production 2>/dev/null | grep -q BLOB_READ_WRITE_TOKEN; then
  npx --yes vercel blob store add "$BLOB_STORE" --yes || true
  npx --yes vercel env ls production 2>/dev/null | grep -q BLOB_READ_WRITE_TOKEN || {
    echo "!!  BLOB_READ_WRITE_TOKEN is not on the project yet."
    echo "    Open https://vercel.com/dashboard → Storage → $BLOB_STORE → Connect Project → $PROJECT, then re-run this script."
    exit 1
  }
fi

echo "==> Environment variables (production + preview)"
setenv() { # name value
  for target in production preview; do
    npx --yes vercel env rm "$1" "$target" --yes >/dev/null 2>&1 || true
    printf '%s' "$2" | npx --yes vercel env add "$1" "$target" >/dev/null
  done
}
setenv DATABASE_URL "$DATABASE_URL"
setenv JWT_SECRET "$JWT_SECRET"
setenv ENCRYPTION_KEY "$ENCRYPTION_KEY"
setenv FILE_STORAGE blob

echo "==> Deploying to production"
URL=$(npx --yes vercel deploy --prod --yes 2>/dev/null | tail -1)
echo
echo "Deployed: $URL"
echo "Secrets kept in $STATE (back them up — ENCRYPTION_KEY cannot be rotated without losing KYC data)."
[ "$SEED" = "1" ] && echo "Seeded logins are listed in README.md — change the passwords from /admin before sharing the link."
