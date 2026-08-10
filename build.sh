#!/usr/bin/env bash
set -euo pipefail

# ==== Install Python dependencies ====
echo "=== Install Python dependencies ==="
pip install -r requirements.txt

# ==== Install Node dependencies ====
echo "=== Install Node dependencies ==="
cd Frontend
npm ci

# ==== Clean previous build (if any) ====
echo "=== Clean previous build ==="
rm -rf dist

# ==== Build the React app ====
echo "=== Build React app ==="
npm run build
cd ..

echo "=== Build completed ==="