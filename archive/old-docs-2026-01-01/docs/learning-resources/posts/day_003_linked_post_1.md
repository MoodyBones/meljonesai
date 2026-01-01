# Technical Deep Dive: httpOnly Session Cookies vs Client Tokens
## Why Server-Side Session Management Matters for Production Security

**Date:** 2025-11-17
**Session:** Day 003 - M1 Implementation
**Topic:** Firebase Authentication with Secure Session Cookies

---

## The Problem We Solved

Many Firebase tutorials show this auth pattern:

```typescript
// ❌ Common but insecure pattern
const user = await signInWithPopup(auth, googleProvider)
const token = await user.getIdToken()

// Store in localStorage or client cookie
localStorage.setItem('auth-token', token)
// or
document.cookie = `auth-token=${token}; path=/`
```

This works for demos, but creates **three critical security vulnerabilities** in production:

1. **XSS Attacks:** Any malicious script can read `localStorage` or `document.cookie`
2. **Token Theft:** Browser extensions and console commands can steal tokens
3. **CSRF Vulnerabilities:** Client-side tokens don't protect against cross-site requests

---

## Our Solution: Server-Side Session Cookies

We implemented a two-step authentication exchange:

### Step 1: Client Gets ID Token (Ephemeral)

```typescript
// Client-side: web/src/app/login/page.tsx
const credential = await signInWithPopup(auth, googleProvider)
const idToken = await credential.user.getIdToken()

// CRITICAL: Don't store this anywhere client-side
// Immediately send to server for exchange
const res = await fetch('/api/auth/session', {
  method: 'POST',
  body: JSON.stringify({ idToken })
})
```

**Key point:** The ID token never touches `localStorage`, cookies, or any client storage.

### Step 2: Server Creates Session Cookie (Long-Lived)

```typescript
// Server-side: web/src/app/api/auth/session/route.ts
export async function POST(req: NextRequest) {
  const { idToken } = await req.json()

  // Verify with Firebase Admin SDK (server-side only)
  const sessionCookie = await createSessionCookie(idToken, ONE_WEEK_MS)

  // Set httpOnly cookie (JavaScript CANNOT access this)
  const headers = {
    'Set-Cookie': `mj_session=${sessionCookie}; Path=/; Max-Age=604800; HttpOnly; SameSite=Strict; Secure`
  }

  return NextResponse.json({ ok: true }, { headers })
}
```

**Critical security flags:**
- `HttpOnly`: JavaScript cannot read this cookie (XSS protection)
- `SameSite=Strict`: Cookie not sent on cross-origin requests (CSRF protection)
- `Secure`: Only sent over HTTPS in production (man-in-the-middle protection)

---

## How Server Verification Works

### Edge Middleware: Fast Cookie Check

```typescript
// web/src/middleware.ts (Edge Runtime)
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const session = req.cookies.get('mj_session')?.value
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  return NextResponse.next()
}
```

**What this does:** Fast redirect for missing cookies (edge runtime = fast)
**What this doesn't do:** Verify cookie is valid (can't use Firebase Admin SDK at edge)

### Server Component: Full Verification

```typescript
// web/src/app/admin/layout.tsx (Server Component)
import { cookies } from 'next/headers'
import { verifySessionCookie } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const sessionCookie = cookies().get('mj_session')?.value

  if (!sessionCookie) {
    redirect('/login')
  }

  try {
    // Firebase Admin SDK verifies signature, expiration, revocation
    await verifySessionCookie(sessionCookie)
  } catch (error) {
    redirect('/login')
  }

  return <>{children}</>
}
```

**Layered security:**
1. Edge middleware: Cookie presence check (fast, no secrets)
2. Server layout: Firebase Admin verification (secure, full validation)

---

## Why This Pattern Beats Alternatives

### vs. Client-Side Token Storage (localStorage/cookies)

| Pattern | XSS Protection | CSRF Protection | Token Theft Risk |
|---------|----------------|-----------------|------------------|
| localStorage | ❌ None | ❌ None | ❌ High |
| Client cookie | ❌ None | ⚠️ Partial (with SameSite) | ❌ High |
| **httpOnly session cookie** | ✅ Full | ✅ Full | ✅ Low |

### vs. Server-Side Session Stores (Redis/Database)

Some devs use Firebase client tokens but verify them server-side every request:

```typescript
// ❌ Expensive pattern
export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  // Calls Firebase Admin SDK on EVERY REQUEST
  await adminAuth.verifyIdToken(token)
}
```

**Problems:**
- Firebase Admin SDK is Node.js-only (doesn't run at edge)
- Verifying tokens on every request adds latency
- Firebase rate limits token verification

**Our approach:**
- Verify once during login → create long-lived session cookie
- Session cookie verification is cryptographic (no external calls)
- Edge middleware just checks presence (fast)
- Server components verify validity (secure)

---

## The CI/CD Challenge: Minting Test Tokens

In Playwright tests, we need authenticated sessions. But we can't use real Google OAuth in CI.

**Solution:** Mint temporary ID tokens with Firebase Admin SDK

```javascript
// web/scripts/ci-create-id-token.mjs
const customToken = await admin.auth().createCustomToken('playwright-ci-user')

// Exchange custom token for ID token via REST API
const resp = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
  {
    method: 'POST',
    body: JSON.stringify({ token: customToken, returnSecureToken: true })
  }
)

const { idToken } = await resp.json()
console.log(idToken) // CI captures this
```

**In Playwright:**

```typescript
// web/tests/auth-smoke.spec.ts
const idToken = process.env.PLAYWRIGHT_AUTH_ID_TOKEN

// POST to our session endpoint (same as real login)
const resp = await fetch('http://localhost:3000/api/auth/session', {
  method: 'POST',
  body: JSON.stringify({ idToken })
})

// Extract session cookie, use in subsequent requests
```

**Benefits:**
- No hardcoded long-lived tokens in CI
- Fresh token per test run (security)
- Tests real authentication flow
- Token expires in 1 hour (limited blast radius)

---

## Trade-Offs & When NOT to Use This

### When This Pattern Makes Sense

- Production applications with sensitive data
- Multi-page applications (session persistence across pages)
- Apps requiring server-side rendering
- Security-first requirements (healthcare, finance, etc.)

### When Client Tokens Are Fine

- Static sites with no server
- Demo/prototype applications
- Client-only apps (no sensitive API routes)
- Firebase Security Rules provide all authorization

### The Complexity Cost

**What we added:**
- API route for session creation
- Firebase Admin SDK configuration
- Server-side verification in layout
- CI token minting script

**What we gained:**
- XSS protection
- CSRF protection
- Professional security posture
- Production-ready auth

**Time investment:** ~1.5 hours
**Security improvement:** Prevents entire classes of attacks

---

## Key Takeaways

1. **httpOnly cookies prevent JavaScript access** — This is the most important security boundary

2. **Server-side verification uses Firebase Admin SDK** — Don't trust client tokens

3. **Layered security works best** — Edge for speed, server for security

4. **Session cookies reduce Firebase API calls** — Verify once, use many times

5. **CI needs special handling** — Mint tokens, don't hardcode them

---

## Further Reading

- [Firebase Admin SDK Session Cookies](https://firebase.google.com/docs/auth/admin/manage-cookies)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Next.js Middleware Edge Runtime Limitations](https://nextjs.org/docs/messages/edge-runtime-unsupported-api)

---

**Written:** 2025-11-17
**Session:** Day 003 - M1 Firebase Setup
**Next Review:** 2025-11-18
