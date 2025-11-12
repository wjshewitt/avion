#!/bin/bash
echo "Clearing Next.js caches..."
rm -rf .next
rm -rf node_modules/.cache
echo "Cache cleared! Please restart your dev server with: npm run dev"
