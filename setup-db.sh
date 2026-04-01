#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE=".env"

# ── 1. Check if a DATABASE_URL is already configured ────────────────────────
if [[ -f "$ENV_FILE" ]] && grep -qE '^DATABASE_URL=.+' "$ENV_FILE"; then
  echo "✅ .env already contains a DATABASE_URL — skipping database creation."
else
  echo "🚀 No existing DATABASE_URL found. Creating a new Prisma Postgres dev database..."

  # Run npx create-db and capture its output
  CREATE_OUTPUT=$(npx create-db 2>&1) || {
    echo "❌ npx create-db failed:"
    echo "$CREATE_OUTPUT"
    exit 1
  }

  echo "$CREATE_OUTPUT"

  # Extract the connection string (postgres://... or postgresql://...)
  CONNECTION_STRING=$(echo "$CREATE_OUTPUT" | grep -oE 'postgres(ql)?://[^ ]+' | head -1)

  if [[ -z "$CONNECTION_STRING" ]]; then
    echo "❌ Could not parse a connection string from npx create-db output."
    echo "   Please copy the connection string manually into $ENV_FILE:"
    echo '   DATABASE_URL="postgres://..."'
    exit 1
  fi

  # Write the connection string to .env
  echo "DATABASE_URL=\"$CONNECTION_STRING\"" > "$ENV_FILE"
  echo ""
  echo "✅ Wrote DATABASE_URL to $ENV_FILE"
  echo "   $CONNECTION_STRING"
  echo ""
  echo "⚠️  Remember to claim your database via the link in the output above"
  echo "   or it will be deleted after 24 hours."
fi

# ── 2. Run Prisma migrations ────────────────────────────────────────────────
echo ""
echo "🔄 Running prisma migrate dev..."
npx prisma migrate dev

echo ""
echo "✅ Database setup complete!"
