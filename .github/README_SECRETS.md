# Repository Secrets and CI configuration

This file documents the repository secrets used by the MelJonesAI `web` CI workflow and how to obtain or create them.

Required secrets for full CI (Playwright auth minting)

- FIREBASE_PRIVATE_KEY (string): Private key from a Firebase service account JSON. When you copy it into GitHub Secrets, escape newlines by replacing actual newlines with `\n`.
- FIREBASE_CLIENT_EMAIL (string): The `client_email` field from your Firebase service account JSON.
- FIREBASE_PROJECT_ID (string): Your Firebase project ID.
- NEXT_PUBLIC_FIREBASE_API_KEY (string): Your Firebase Web API key (found in Firebase Console → Project Settings → General).

Optional / related secrets used by web CI

- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
- SANITY_PREVIEW_SECRET
- NEXT_PUBLIC_SITE_URL
- SANITY_WRITE_TOKEN
- ANTHROPIC_API_KEY
- N8N_WEBHOOK_SECRET

How CI uses these secrets

- The workflow attempts to mint a short-lived ID token for Playwright by running `web/scripts/ci-create-id-token.mjs` only when the required Firebase admin secrets are present. This produces a fresh `PLAYWRIGHT_AUTH_ID_TOKEN` for the test step.
- If the Firebase admin secrets are not configured in the repository, the minting step is skipped and Playwright runs only unauthenticated smoke checks (redirects and UI assertions). This keeps CI resilient.

How to add the Firebase service account private key as a GitHub secret

1. In the Firebase Console, go to Project Settings → Service Accounts.
2. Click "Generate new private key" and download the JSON file.
3. Open the JSON and copy the `private_key` field. It will contain newlines.
4. When creating the secret in GitHub, replace newlines with `\n` so the file can be reconstructed in CI. For example, in a Unix shell:

```bash
# Example (do not run in CI):
export FIREBASE_PRIVATE_KEY="$(jq -r .private_key service-account.json | sed ':a;N;$!ba;s/\n/\\n/g')"
# Then paste the value into GitHub Secrets
```

CI alternatives (recommended)

- Use Firebase Emulator in CI: fast, deterministic, no production secrets required. Start the emulator in a setup step and create test users/tokens.
- If using production admin credentials in CI, create a dedicated service account with the minimum privileges necessary and rotate its key regularly.
- As another alternative, create a CI pre-step that mints short-lived tokens using admin credentials (this repository includes `web/scripts/ci-create-id-token.mjs` for that purpose).

Security notes

- Never commit service account JSON files into the repository.
- Use GitHub Actions secrets (not repository variables) for sensitive keys if you want to restrict usage to actions only.
- Limit who can modify secrets via GitHub repository settings and restrict workflow runs where possible.

If you want, I can add a small example workflow fragment that uses the Firebase emulator instead of minting a token.
