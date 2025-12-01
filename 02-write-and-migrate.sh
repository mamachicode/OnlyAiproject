#!/usr/bin/env bash
[ -f .dbpass.env ] || { echo "❌ .dbpass.env missing. Run ./01-test-pass.sh first (must show ✅)."; exit 0; }
source .dbpass.env

# write ONLY the two QUOTED lines at the top of .env
cp .env .env.bak.$(date +%s) 2>/dev/null || true
{
  cat <<EOT
# PostgreSQL (Supabase) — QUOTED because of &sslmode
DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${DBPASS}@aws-0-ca-central-1.pooler.supabase.com:5432/postgres?schema=public&sslmode=require"
DATABASE_URL_DIRECT="postgresql://postgres:${DBPASS}@db.${PROJECT_REF}.supabase.co:5432/postgres?schema=public&sslmode=require"
EOT
  grep -v -E '^(DATABASE_URL|DATABASE_URL_DIRECT)=' .env 2>/dev/null || true
} > .env

dos2unix .env >/dev/null 2>&1 || true
echo "== .env top =="; sed -n '1,8p' .env
node -e "require('dotenv').config(); console.log('DATABASE_URL=', process.env.DATABASE_URL||'<empty>')"

# ensure Prisma uses DATABASE_URL
sed -i 's|^  url\s*=.*$|  url      = env("DATABASE_URL")|' prisma/schema.prisma
echo "== datasource =="; awk '/^datasource db {/,/^}/' prisma/schema.prisma

# prisma migrate (IPv4-first)
export NODE_OPTIONS='--dns-result-order=ipv4first'
npx prisma format || true
npx prisma generate || true
if ! npx prisma migrate dev --name init_user_and_subscription; then
  echo "⚠️ Prisma migrate failed; trying IPv4 override…"
  IPV4=$(getent hosts aws-0-ca-central-1.pooler.supabase.com | awk '/^[0-9.]+/{print $1; exit}')
  ONE_OFF_URL=$(node -e 'require("dotenv").config(); const u=new URL(process.env.DATABASE_URL); u.hostname=process.argv[1]; u.searchParams.set("sslmode","require"); process.stdout.write(u.toString())' "$IPV4")
  echo "IPv4 URL (sanitized): $(echo "$ONE_OFF_URL" | sed 's#://[^:]*:[^@]*@#://***:***@#')"
  PSQL_ONE_OFF=$(node -e 'const u=new URL(process.argv[1]); u.searchParams.delete("schema"); console.log(u.toString())' "$ONE_OFF_URL")
  PGPASSWORD="$DBPASS" PGSSLMODE=require psql "$PSQL_ONE_OFF" -c '\conninfo' || echo "⚠️ psql IPv4 check failed (continuing)…"
  DATABASE_URL="$ONE_OFF_URL" npx prisma migrate dev --name init_user_and_subscription || echo "❌ Prisma migrate still failing even with IPv4 override."
fi
