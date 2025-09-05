#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Check if seeding is needed (only run once)
echo "Checking if database seeding is needed..."
SEED_MARKER="/app/.seed-completed"

if [ ! -f "$SEED_MARKER" ]; then
  echo "Running database seeding..."
  npx prisma db seed
  if [ $? -eq 0 ]; then
    echo "Seeding completed successfully"
    touch "$SEED_MARKER"
  else
    echo "Seeding failed"
    exit 1
  fi
else
  echo "Database already seeded, skipping..."
fi

# Start the application
echo "Starting application..."
exec node server.js
