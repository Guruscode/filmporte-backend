#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."
# Simple retry loop - the compose healthcheck should handle this,
# but this is a safeguard for standalone docker runs
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" > /dev/null 2>&1; do
  sleep 1
done
echo "✅ Database is ready."

echo "📦 Running database migrations..."
npx typeorm migration:run -d dist/config/typeorm.config.js
echo "✅ Migrations complete."

echo "🚀 Starting application..."
exec node dist/main
