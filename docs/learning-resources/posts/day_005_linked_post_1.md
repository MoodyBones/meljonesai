# Technical Deep Dive: Token Minting for CI Authentication

**Topic:** Fresh ID Token Generation vs. Long-Lived Credentials  
**Context:** GitHub Actions CI/CD for Playwright end-to-end tests  
**Date:** 2025-11-20

---

## The Problem

Playwright tests need authenticated sessions to test protected routes (e.g., `/admin`), but CI/CD environments can't use interactive OAuth flows.

**Traditional approaches:**
1. ❌ **Hardcode credentials** - Security risk, tokens in plaintext
2. ❌ **Store long-lived tokens** - Exposure window too large
3. ❌ **Skip auth tests in CI** - Reduced test coverage

**Core tension:** Need real authentication in automated tests without compromising security.

---

## The Solution

**Three-step token minting pattern:**

```yaml
# 1. Mint fresh token using Firebase Admin SDK
- id: mint_token
  run: |
    TOKEN=$(node web/scripts/ci-create-id-token.mjs)
    echo "token=$TOKEN" >> $GITHUB_OUTPUT

# 2. Pass token to Playwright
- run: npm run test:e2e
  env:
    PLAYWRIGHT_AUTH_ID_TOKEN: ${{ steps.mint_token.outputs.token }}

# 3. Playwright exchanges token for session cookie
```

**Key insight:** Generate credentials just-in-time, use once, let them expire.

---

## Why This Works

### 1. Security Through Ephemeral Credentials

**Time-boxed exposure:**
- Token created at test runtime
- Lives only in memory during CI run
- Expires in 1 hour (Firebase default)
- Even if leaked in logs, very limited blast radius

**Comparison:**

| Approach | Exposure Window | Revocation | Rotation Impact |
|----------|----------------|-----------|-----------------|
| Hardcoded token | Permanent | Manual | Break CI |
| Stored token secret | Until rotated | Manual | Update secret |
| **Minted token** | **1 hour** | **Automatic** | **None** |

### 2. Leverages Existing Infrastructure

**We already have:**
- Firebase Admin SDK credentials (for server-side auth)
- Token verification logic (for production)

**Reuse pattern:**
```javascript
// Production: Verify tokens from clients
admin.auth().verifyIdToken(token)

// CI: Create tokens for test users
admin.auth().createCustomToken('playwright-ci-user')
```

No new authentication system needed.

### 3. Real Authentication Flow

**Tests exercise actual production code:**

```javascript
// Same flow as production
POST /api/auth/session
  Body: { idToken: "..." }
  
→ Server verifies with Firebase Admin SDK
→ Server creates httpOnly session cookie
→ Tests use cookie for authenticated requests
```

**Benefits:**
- Catches auth bugs that mock wouldn't find
- Validates token verification logic
- Tests session cookie handling
- End-to-end confidence

---

## Trade-offs

### What We Gave Up

**1. Slightly Slower CI Runs**
- Token creation: ~1-2 seconds
- REST API exchange: ~0.5-1 second
- Total overhead: ~2-3 seconds per run

**Acceptable because:**
- Entire CI run is ~2-3 minutes
- Security worth 2% time increase

**2. Firebase Admin Credentials in CI**
- GitHub Secrets required: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- If GitHub compromised, attacker has admin access

**Mitigated by:**
- GitHub Secrets are encrypted at rest
- Only visible in workflow runs (not in code)
- Can use separate Firebase project for CI

**3. Complexity**
- Added `ci-create-id-token.mjs` script
- Workflow has more steps
- More to understand for maintainers

**Justified by:**
- Well-documented pattern
- Reusable across projects
- Security benefits outweigh complexity

### What We Gained

**1. No Long-Lived Secrets**
- No `PLAYWRIGHT_AUTH_TOKEN` secret to rotate
- No token management overhead
- Automatic security through expiry

**2. Fork-Friendly**
- Forks can run non-auth tests
- `continue-on-error` allows graceful degradation
- Contributors don't need Firebase access

**3. Audit Trail**
- Each CI run shows token creation
- Clear logs of when auth succeeded/failed
- Easier debugging vs. opaque token errors

---

## When to Use This Pattern

### ✅ Good Fit When:

1. **Testing requires real authentication**
   - Session cookies needed
   - OAuth flows too complex for CI
   - Mock authentication insufficient

2. **You already use Firebase Admin SDK**
   - Credentials already available
   - No new infrastructure needed
   - Reuse existing patterns

3. **Security is priority**
   - Can't risk long-lived tokens
   - Need audit trail
   - Compliance requires ephemeral credentials

4. **CI runs are infrequent enough**
   - Not thousands of runs per day
   - Token creation overhead acceptable
   - Firebase quota not a concern

### ❌ Consider Alternatives When:

1. **Very high CI volume**
   - Firebase API quota limits
   - Token creation overhead multiplied
   - Consider: Firebase Emulator instead

2. **No Firebase in production**
   - Don't add it just for CI
   - Use your actual auth system
   - Or mock authentication

3. **Tests don't need real auth**
   - UI component tests
   - Unit tests
   - Integration tests with mocked auth

4. **Compliance forbids cloud credentials in CI**
   - Self-hosted runners may be restricted
   - Consider: On-premise Firebase Emulator

---

## Alternative: Firebase Emulator

**Even more secure approach:**

```yaml
- name: Start Firebase Emulator
  run: firebase emulators:start --only auth

- name: Run tests against emulator
  env:
    FIREBASE_EMULATOR_HOST: localhost:9099
```

**Advantages:**
- No production credentials in CI
- Unlimited token creation (no quota)
- Faster (local, no network calls)
- Complete isolation

**Why we didn't choose it (yet):**
- Requires firebase-tools installation
- Different configuration for CI vs. local
- More setup complexity
- Token minting pattern simpler to start

**Future consideration:** Migrate to emulator as test suite grows.

---

## Key Takeaway

**Pattern:** Generate minimal credentials, just-in-time, with automatic expiry.

**Philosophy:** Security through ephemeral infrastructure rather than secret management.

This pattern applies beyond Firebase:
- AWS STS temporary credentials
- OAuth token exchange flows
- JWT with short expiry
- Database session tokens

The principle: **Time is the best access control.**
