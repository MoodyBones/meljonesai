Title: M1 — Firebase Authentication Setup

Description

This issue implements Milestone 1: Firebase Authentication Setup. It contains robust, copyable instructions for implementation, key deliverables, testing criteria, and important pragmatic decisions already made for the project.

Robust instructions (from Copilot guide)

- Tasks to complete:

  1. Create Firebase client config: `web/src/lib/firebase/config.ts` (client-side init, use modular Firebase SDK v10+, singleton pattern, export `auth`)
  2. Create Firebase admin config: `web/src/lib/firebase/admin.ts` (server Admin SDK, handle escaped newlines in `FIREBASE_PRIVATE_KEY`, singleton pattern, export admin auth)
  3. Implement auth middleware: `web/src/middleware.ts` (protect `/admin` routes; verify session cookie with Admin SDK and redirect to `/login` if invalid)
  4. Create login page: `web/src/app/login/page.tsx` (client component, Google sign-in with `signInWithPopup`, save token to cookie, redirect to `/admin`, show errors)
  5. Create admin dashboard: `web/src/app/admin/page.tsx` (client component, check `onAuthStateChanged`, redirect to `/login` if unauthenticated, show user info, sign-out button)

- Implementation details / expectations:
  - Use Firebase modular SDK v10+ on the client.
  - Client env vars must use `NEXT_PUBLIC_` prefix for public config keys (e.g. `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, etc.).
  - Server Admin SDK must read non-public env vars: `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PROJECT_ID`. Sanitize `FIREBASE_PRIVATE_KEY` by replacing escaped `\n` sequences with actual newlines before passing to the Admin SDK.
  - Implement singleton initialization patterns so initialization doesn't run at import-time during build.
  - Protect all `/admin/*` routes via middleware that verifies a server-side session (cookie) created from a verified ID token.
  - Use TypeScript and follow existing project patterns.

Key deliverables

- Files to add or update:
  - `web/src/lib/firebase/config.ts` (client)
  - `web/src/lib/firebase/admin.ts` (server)
  - `web/src/middleware.ts` (route protection)
  - `web/src/app/login/page.tsx` (login UI)
  - `web/src/app/admin/page.tsx` (admin dashboard)
  - tests or Playwright smoke tests that exercise login → admin flow (if present in repo)

Testing and Definition-of-Done

- Can sign in with Google.
- Auth state persists on refresh.
- `/admin` routes are protected and redirect unauthenticated users to `/login`.
- No TypeScript errors related to auth usage.
- `npm run build` succeeds.

Important pragmatic decisions (do NOT change without considering CI/build consequences)

- Use modular Firebase SDK v10+ for client code (modular imports reduce bundle size).
- Keep private credentials server-side (no `NEXT_PUBLIC_` for admin secrets).
- Lazy / singleton Admin initialization to avoid running Admin SDK at build time (Next.js imports API routes during build).
- Use httpOnly session cookie for server-side session (`mj_session`) rather than storing tokens in localStorage (safer, prevents XSS token leakage).

Notes

- Environment variables required (at minimum):

  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID
  - FIREBASE_PRIVATE_KEY
  - FIREBASE_CLIENT_EMAIL

- Follow project TypeScript patterns and path aliases (use `@/lib/...` if repo is configured that way).

Checklist

- [ ] Implement the client config
- [ ] Implement the admin config
- [ ] Add middleware to protect `/admin` routes
- [ ] Create login and admin pages
- [ ] Add tests / verify in Playwright (if required)
- [ ] Ensure `npm run build` passes
