#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database seeding (only if needed)
echo "Running database seeding..."
npx prisma db seed

# Start the application
echo "Starting application..."
exec node server.js
