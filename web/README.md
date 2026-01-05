This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Playwright E2E Testing

This project uses [Playwright](https://playwright.dev) for end-to-end testing.

### Test Files

```
web/tests/
├── smoke.spec.ts        # Basic page load tests (home, login, 404)
└── auth-smoke.spec.ts   # Authentication flow tests
```

### Running Tests Locally

```bash
# 1. Build the app first
npm run --workspace=web build

# 2. Start the server in one terminal
npm run --workspace=web start

# 3. Run tests in another terminal
npm run --workspace=web test:e2e
```

### Viewing Results

- **Terminal**: Shows pass/fail for each test
- **HTML Report**: Open `web/playwright-report/index.html` after running tests
- **Videos**: Saved in `web/test-results/` when tests fail
- **Trace Viewer**: `npx playwright show-trace web/test-results/<test>/trace.zip`

### Interactive/Debug Modes

```bash
npx playwright test --ui        # Visual test runner
npx playwright test --debug     # Step through tests
npx playwright test --headed    # See browser window
```

### CI Behavior

In GitHub Actions, tests run automatically on PRs:
- Browsers are installed via `npx playwright install --with-deps chromium`
- Test artifacts (videos, traces) are uploaded for failed tests
- Authenticated tests require `PLAYWRIGHT_AUTH_ID_TOKEN` env var (minted in CI)

### Test Philosophy

Smoke tests verify pages load without server errors (status < 500). They don't assert specific content since that depends on CMS data and client-side rendering. This makes tests reliable across environments.

## Session cookie contract (mj_session)

This project uses a server-set httpOnly session cookie named `mj_session` for authenticated admin sessions.

- Name: `mj_session`
- Scope: Path=/ (entire site)
- HttpOnly: true (not accessible via client-side JavaScript)
- Secure: set in production (the server adds `; Secure` when NODE_ENV !== 'development')
- SameSite: Strict
- Lifetime: 7 days (created by server via Firebase Admin `createSessionCookie`)

Behavior:

- The client obtains a Firebase ID token after sign-in and POSTs it to `/api/auth/session`.
- The server verifies the ID token via Firebase Admin SDK and creates the `mj_session` cookie.
- Server-side route protection (e.g. `web/src/app/admin/layout.tsx`) verifies the session cookie using the Admin SDK.
- Sign-out should call `DELETE /api/auth/session` which clears the `mj_session` cookie.

Notes:

- For local development the cookie Secure flag is not set so `http://localhost:3000` can be used. In production ensure HTTPS so cookies remain secure.
- If you need to test the full auth exchange in CI or Playwright, provide a valid ID token as `PLAYWRIGHT_AUTH_ID_TOKEN` in the environment (CI secrets) and the smoke test will exercise the exchange and server-set cookie.
