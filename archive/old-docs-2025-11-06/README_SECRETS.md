# Required GitHub Secrets for MelJonesAI CI & Preview

Add these repository secrets in GitHub > Settings > Secrets and variables > Actions.

Required secrets

- SANITY_PREVIEW_SECRET
  - Used by the Next preview API route and Playwright tests to enable Draft Mode.
  - Example: a long random string, e.g. `s3Cr3t_xxx`

- NEXT_PUBLIC_SITE_URL
  - The public base URL of the Next site used in preview URL generation.
  - Example: `https://meljonesai.vercel.app` or `http://localhost:3000` for local CI runs.

- SANITY_API_READ_TOKEN (optional for preview)
  - Read token to fetch drafts in preview mode (if using server-side preview fetches).

- SANITY_WRITE_TOKEN (for n8n)
  - Token with write access to create drafts from n8n.

- ANTHROPIC_API_KEY or GEMINI_API_KEY (for automation)
  - LLM API key used by n8n or server-side generation.

- N8N_WEBHOOK_SECRET (for n8n webhook endpoint)
  - Secret used by Next API to authenticate requests to n8n.

Notes

- Keep tokens secret — do not commit them to the repo.
- For local development you can instead create a `.env.local` with the appropriate values.
- After adding secrets, CI will pick them up automatically.
