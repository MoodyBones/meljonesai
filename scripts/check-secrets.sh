#!/usr/bin/env bash
set -euo pipefail
echo "Checking environment for required secrets..."
missing=""
for v in SANITY_PREVIEW_SECRET NEXT_PUBLIC_SITE_URL SANITY_WRITE_TOKEN ANTHROPIC_API_KEY N8N_WEBHOOK_SECRET; do
  if [ -z "${!v:-}" ]; then
    missing="$missing $v"
  fi
done
if [ -n "$missing" ]; then
  echo "Missing the following environment variables:$missing"
  echo "Set them locally (e.g., export SANITY_PREVIEW_SECRET=...) or add to .env.local"
  exit 1
fi
echo "All required secrets are present."
