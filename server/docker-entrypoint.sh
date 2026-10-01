#!/bin/sh
set -e
echo "Running migrations..."
npx prisma migrate deploy
echo "Running seed..."
npx ts-node prisma/seed.ts || echo "Seed already run or failed — continuing"
echo "Starting server..."
exec node dist/index.js
