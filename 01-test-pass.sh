#!/usr/bin/env bash
PROJECT_REF='jiwptaomcyhdpdysoajp'
read -p "Supabase DB password (VISIBLE): " DBPASS; echo
printf 'len=%s hex=' "${#DBPASS}"; printf '%s' "$DBPASS" | od -An -t x1; echo

export PGHOST=aws-0-ca-central-1.pooler.supabase.com
export PGPORT=5432
export PGUSER="postgres.${PROJECT_REF}"
export PGDATABASE=postgres
export PGSSLMODE=require
export PGPASSWORD="$DBPASS"

echo "→ Testing password with psql..."
if psql -c '\conninfo'; then
  echo "✅ Password OK — saving to .dbpass.env"
  { printf "export PROJECT_REF=%q\n" "$PROJECT_REF"; printf "export DBPASS=%q\n" "$DBPASS"; } > .dbpass.env
  chmod 600 .dbpass.env
else
  echo "❌ Wrong password. Reset in Supabase → Settings → Database → Password, click Save, wait ~30–60s, then rerun ./01-test-pass.sh"
fi
