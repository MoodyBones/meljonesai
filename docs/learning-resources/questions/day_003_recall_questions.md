# Day 003 Recall Questions
## M1: Firebase Setup — Secure Authentication & Session Management

**Date:** 2025-11-17
**Session:** Day 003 - M1 Implementation
**Review Schedule:** Day +1, +3, +7

---

## Instructions

Answer these questions without looking at the documentation. Check your answers afterward. These test your understanding of Firebase authentication, session cookie security, and server-side verification patterns in Next.js.

---

### Q1: Session Cookie Security

**Question:** Why did we choose httpOnly session cookies over storing Firebase ID tokens in localStorage or client-side cookies? List THREE specific security benefits and explain the attack vectors each prevents.

**Answer:**

```
1. XSS Attack Prevention (httpOnly)
   - httpOnly cookies cannot be accessed via JavaScript (document.cookie)
   - Prevents malicious scripts from stealing tokens
   - Even if attacker injects code, they can't read the session cookie

2. CSRF Protection (SameSite + Server Verification)
   - SameSite=Strict prevents cookie from being sent with cross-origin requests
   - Server verifies cookie with Firebase Admin SDK
   - Prevents forged requests from malicious sites

3. Token Leakage Reduction (Server-Side Storage)
   - Token never exposed to client-side JavaScript
   - Not vulnerable to browser extension theft
   - Not logged in browser console or network tab (httpOnly)
```

**What we avoided:**
- localStorage: Accessible to any JavaScript, vulnerable to XSS
- Client-side cookies without httpOnly: Same XSS vulnerability
- Client-side token verification: Can be bypassed by malicious clients

---

### Q2: Authentication Flow Sequence

**Question:** Write out the complete authentication flow from Google Sign-In to accessing `/admin`, including all API calls, cookie operations, and redirects. Include HTTP methods and cookie flags.

**Answer:**

```
1. User Visits /login
   - Client renders login page
   - Checks for existing mj_session cookie
   - If cookie exists → redirect to /admin

2. User Clicks "Sign in with Google"
   - Client: signInWithPopup(auth, googleProvider)
   - Google OAuth flow (popup window)
   - Returns Firebase credential object

3. Exchange Credential for ID Token
   - Client: credential.user.getIdToken()
   - Returns short-lived Firebase ID token (JWT)

4. Send Token to Server
   - Client: POST /api/auth/session
   - Body: { idToken: "eyJ..." }
   - Server verifies token with Firebase Admin SDK

5. Server Creates Session Cookie
   - Server: createSessionCookie(idToken, ONE_WEEK_MS)
   - Sets cookie: mj_session=<sessionToken>
   - Cookie flags: HttpOnly; SameSite=Strict; Secure (prod); Max-Age=604800
   - Returns: { ok: true }

6. Client Redirects to /admin
   - Browser automatically includes mj_session cookie
   - Server layout.tsx reads cookies()
   - Verifies session with verifySessionCookie()
   - If valid → renders admin page
   - If invalid → redirects to /login
```

---

### Q3: Server-Side Session Verification

**Question:** Explain why we verify sessions in the Admin layout component (server component) instead of Next.js middleware. What are TWO technical limitations of Edge middleware that make server component verification preferable?

**Answer:**

```
Why Server Component Layout Instead of Edge Middleware:

1. Firebase Admin SDK Not Edge-Compatible
   - Firebase Admin SDK uses Node.js-specific modules
   - Edge Runtime only supports Web APIs subset
   - Cannot import firebase-admin in middleware.ts
   - Would need to implement custom JWT verification

2. Environment Variable Access Limitations
   - FIREBASE_PRIVATE_KEY contains multiline string
   - Edge middleware has different env var handling
   - Private key parsing is unreliable in Edge runtime
   - Server components have full Node.js environment access

What We Did Instead:
- Edge middleware: Simple cookie presence check → redirect to /login
- Server layout: Full Firebase Admin SDK verification
- Best of both: Fast edge redirect + secure server verification
- Layered security: Cookie presence (edge) + token validity (server)
```

**Note:** This is a Next.js 15 App Router pattern. In Pages Router, we'd use getServerSideProps.

---

### Q4: Sign-Out Flow

**Question:** The sign-out flow involves both client-side and server-side operations. Why do we need BOTH `DELETE /api/auth/session` AND `firebaseSignOut(auth)`, and what would break if we only did one?

**Answer:**

```
Complete Sign-Out Flow:
1. DELETE /api/auth/session → Clears server session cookie
2. firebaseSignOut(auth) → Clears client Firebase auth state
3. Document.cookie = 'mj_session=; max-age=0' → Best-effort client cleanup

Why Both Are Required:

If we ONLY did DELETE /api/auth/session:
- Server cookie cleared ✓
- Client Firebase auth state still active ✗
- onAuthStateChanged still thinks user is signed in
- User sees "signed in" UI but can't access /admin
- Confusing UX mismatch

If we ONLY did firebaseSignOut(auth):
- Client Firebase auth state cleared ✓
- Server session cookie still exists ✗
- Browser still sends mj_session on next request
- Server thinks user is authenticated
- User could access /admin without being signed in client-side
- Security vulnerability: mismatched auth state

Both Together:
- Server knows user signed out (no valid cookie)
- Client knows user signed out (no Firebase auth)
- Consistent state across client and server
- Clean redirect to /login
```

---

### Q5: Environment Variables Strategy

**Question:** List all Firebase environment variables used in M1, categorize them as PUBLIC or PRIVATE, and explain the security implication of accidentally making a private variable public (NEXT_PUBLIC_).

**Answer:**

```
PUBLIC Variables (NEXT_PUBLIC_* - sent to browser):
1. NEXT_PUBLIC_FIREBASE_API_KEY
2. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
3. NEXT_PUBLIC_FIREBASE_PROJECT_ID
4. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
5. NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
6. NEXT_PUBLIC_FIREBASE_APP_ID
7. NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

PRIVATE Variables (server-only):
1. FIREBASE_PROJECT_ID (server verification)
2. FIREBASE_CLIENT_EMAIL (service account)
3. FIREBASE_PRIVATE_KEY (service account private key)

Security Rules:
- PUBLIC vars are embedded in JavaScript bundles
- Anyone can view them in browser DevTools
- That's OK! Firebase client config is meant to be public
- Security rules protect Firebase resources, not the config

Critical Security Implication:
If we accidentally made FIREBASE_PRIVATE_KEY public:
- Private key exposed in JavaScript bundle
- Anyone could impersonate our server
- Could verify/create session cookies as our app
- Could access Firebase Admin SDK with full privileges
- TOTAL SECURITY BREACH → Must rotate keys immediately

Why NEXT_PUBLIC_ Prefix Matters:
- Next.js build: scans for NEXT_PUBLIC_* and inlines values
- Non-prefixed vars: Only available server-side (Node.js process.env)
- This prevents accidental exposure of secrets
```

---

### Q6: Firebase Admin SDK Patterns

**Question:** In `web/src/lib/firebase/admin.ts`, we use a singleton pattern with `if (!admin.apps.length)`. Why is this check critical in Next.js, and what error would occur without it?

**Answer:**

```
The Singleton Pattern:
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({...})
  })
}

Why This Is Critical in Next.js:

Problem: Hot Module Replacement (HMR) in Dev
- Next.js dev server hot-reloads modules on file changes
- Without singleton check, admin.initializeApp() runs MULTIPLE times
- Firebase Admin SDK throws error on duplicate initialization
- Error: "The default Firebase app already exists"

Problem: Multiple API Routes
- Each API route imports firebase/admin.ts
- Without singleton, each import tries to initialize
- Same error: duplicate app initialization

The Check Prevents:
- Module evaluated once → admin.apps.length === 0 → initialize
- Module evaluated again → admin.apps.length === 1 → skip initialization
- Multiple imports → same app instance reused
- No duplicate initialization errors

Pattern Used Elsewhere:
- Client firebase/config.ts uses getApps().length check
- Same singleton pattern for browser-side Firebase
- Critical for both client and server Firebase SDKs
```

---

### Q7: CI/CD Token Minting

**Question:** We created `web/scripts/ci-create-id-token.mjs` for Playwright tests in CI. Walk through the three-step process this script uses to create an ID token, and explain why we use a custom token instead of hardcoding a long-lived token as a secret.

**Answer:**

```
Three-Step Token Minting Process:

Step 1: Create Custom Token (Server → Firebase)
- Script uses Firebase Admin SDK
- Calls admin.auth().createCustomToken(uid)
- UID: 'playwright-ci-user' (test user)
- Returns short-lived custom token (NOT an ID token yet)

Step 2: Exchange Custom Token for ID Token (Firebase Auth REST API)
- POST to Firebase Identity Toolkit REST API
- Endpoint: identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken
- Body: { token: customToken, returnSecureToken: true }
- Returns ID token (JWT) that can be verified by our server

Step 3: Output to stdout for CI
- Script prints ID token to stdout
- GitHub Actions captures it: echo "token=$(cat token.txt)" >> $GITHUB_OUTPUT
- Playwright test uses it as PLAYWRIGHT_AUTH_ID_TOKEN env var
- Test POSTs to /api/auth/session to get session cookie

Why NOT Hardcode Long-Lived Token:

Security Problems:
1. Token Expiration
   - Firebase ID tokens expire in 1 hour
   - Hardcoded token would break after 1 hour
   - CI would fail unpredictably

2. Token Rotation
   - If we need to revoke the token (security incident)
   - Must update GitHub secret manually
   - Minted tokens auto-expire, limiting blast radius

3. Secret Sprawl
   - Hardcoded token is another secret to manage
   - Minting uses existing FIREBASE_PRIVATE_KEY
   - Fewer secrets = better security posture

Benefits of Minting:
- Fresh token per CI run
- Token expires in 1 hour (limited risk window)
- No long-lived secrets to manage
- If FIREBASE_PRIVATE_KEY rotated, minting still works
```

**Alternative:** Use Firebase Emulator in CI (no production credentials needed).

---

## Scoring Guide

- **7/7 correct:** Excellent! You understand Firebase auth patterns deeply.
- **5-6 correct:** Good understanding. Review missed questions.
- **3-4 correct:** Basic understanding. Re-read CHANGES.md Session 3.
- **0-2 correct:** Needs review. Study Firebase docs and session security.

---

## Review Schedule

**First Review:** 24 hours (2025-11-18)
**Second Review:** 3 days (2025-11-20)
**Third Review:** 7 days (2025-11-24)

Mark questions you got wrong and focus on those in future reviews.

---

## Additional Study

If you missed questions, review these resources:

- **Q1-2:** Session 3 in CHANGES.md - Authentication Flow
- **Q3:** Next.js App Router docs - Server Components vs Middleware
- **Q4:** Firebase docs - Client vs Server Sign-Out
- **Q5:** Next.js docs - Environment Variables
- **Q6:** Firebase Admin SDK docs - Initialization
- **Q7:** web/scripts/ci-create-id-token.mjs - Token Minting Pattern

---

*Created: 2025-11-17 | Session: M1 Firebase Setup | Next: Day 004*
