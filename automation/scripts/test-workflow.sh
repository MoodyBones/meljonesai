#!/usr/bin/env bash
# Simple test script to POST a sample payload to the n8n webhook endpoint
set -euo pipefail
WEBHOOK_URL=${1:-"http://localhost:5678/webhook/job-to-application"}
PAYLOAD='{"jobDescription":"Build a delightful onboarding flow for new users","companyName":"Acme Corp","roleTitle":"Senior Frontend Engineer"}'

printf "Posting sample payload to %s\n" "$WEBHOOK_URL"
curl -sS -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" -d "$PAYLOAD" | jq
