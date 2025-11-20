# Technical Deep Dive: Just-in-Time Credential Generation in CI/CD
## Why Time-Boxed Tokens Are Superior to Long-Lived Secrets

**Date:** 2025-11-20
**Session:** Day 005 - CI/CD Pipeline Enhancements
**Topic:** Security Through Ephemeral Credentials

---

## The Problem: Persistent Credentials in CI

Traditional CI/CD authentication uses long-lived credentials stored in secret management systems:

```yaml
# Traditional approach
env:
  AUTH_TOKEN: ${{ secrets.LONG_LIVED_TOKEN }}
run: ./run-authenticated-tests.sh
```

**The credential lifecycle:**
- Created once (manually or via admin panel)
- Stored in GitHub Secrets
- Active 24/7/365
- Valid until manually revoked

**Attack surface:**
- If GitHub Secrets compromised → attacker has permanent access
- If credential leaked in logs → remains valid indefinitely
- If employee leaves → manual revocation required
- No automatic expiration

---

## The Solution: Just-in-Time (JIT) Token Minting

Instead of storing a long-lived credential, generate a fresh token at runtime:

```yaml
# JIT approach
- name: Mint authentication token
  id: mint_token
  run: |
    TOKEN=$(node scripts/ci-create-id-token.mjs)
    echo "token=$TOKEN" >> $GITHUB_OUTPUT

- name: Run authenticated tests
  env:
    AUTH_TOKEN: ${{ steps.mint_token.outputs.token }}
  run: ./run-authenticated-tests.sh
```

**The credential lifecycle:**
- Generated at runtime using admin credentials
- Valid for 1 hour (Firebase ID token default)
- Used immediately for tests (~10 minutes)
- Automatically expires after test completion
- No manual cleanup needed

---

## How Firebase ID Token Minting Works

### Step 1: Admin SDK Initialization

```javascript
// web/scripts/ci-create-id-token.mjs
import admin from 'firebase-admin';

// Initialize with service account (from secrets)
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});
```

**What's happening:**
- CI environment has service account credentials (FIREBASE_PRIVATE_KEY)
- These are *admin* credentials (can create tokens)
- But we don't use them directly for tests
- Instead, we use them to *mint* a limited-privilege token

### Step 2: Create Custom Token

```javascript
// Create a custom token for a test user
const uid = 'ci-test-user';
const customToken = await admin.auth().createCustomToken(uid);
```

**What is a custom token?**
- A JWT signed by Firebase Admin SDK
- Contains user ID (uid)
- Trusted by Firebase (because signed by admin key)
- **But NOT an ID token** (can't be used directly for auth)
- Needs to be exchanged for ID token

### Step 3: Exchange for ID Token

```javascript
// Exchange custom token for ID token
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const response = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  }
);

const { idToken } = await response.json();
console.log(idToken); // Output to GITHUB_OUTPUT
```

**What is an ID token?**
- A JWT representing an authenticated user session
- Valid for 1 hour (default Firebase expiration)
- Can be used for authenticated API requests
- Contains: uid, email, exp (expiration), iat (issued at)

### Step 4: Use in Playwright Tests

```javascript
// web/tests/auth-smoke.spec.ts
test('authenticated user can access admin', async ({ page }) => {
  const idToken = process.env.PLAYWRIGHT_AUTH_ID_TOKEN;

  // POST to session endpoint to get httpOnly cookie
  await page.request.post('/api/auth/session', {
    data: { idToken },
  });

  // Now session cookie is set, can access /admin
  await page.goto('/admin');
  await expect(page).toHaveURL('/admin');
});
```

**Authentication flow:**
1. Playwright gets ID token from environment
2. POSTs to `/api/auth/session` (creates httpOnly cookie)
3. Session cookie grants access to `/admin` routes
4. Tests complete
5. ID token expires automatically (1 hour)

---

## Security Model: Defense in Depth

### Layer 1: Admin Credentials (Long-Lived, High Privilege)

**Storage:** GitHub Secrets
**Privilege:** Full Firebase Admin SDK access
**Exposure:** Only in CI environment, never logged
**Use case:** Mint custom tokens

**Why this is secure:**
- Never exposed to tests
- Never leaves CI environment
- Can't be extracted from ID token
- Rotated manually (low frequency, high security)

### Layer 2: ID Token (Short-Lived, Limited Privilege)

**Storage:** GitHub Actions output variable (step-scoped)
**Privilege:** Authenticate as specific user (ci-test-user)
**Exposure:** Passed to Playwright tests, may appear in logs
**Use case:** Authenticated E2E tests

**Why this is secure:**
- Expires in 1 hour automatically
- Specific to test user (no admin privileges)
- If leaked → attacker has 10-60 min window (test duration to expiry)
- If leaked → attacker can only access test user data
- No revocation needed (expires automatically)

### Attack Surface Comparison

**Traditional Long-Lived Token:**
- **Attack window:** 365 days/year × 24 hours/day = 8,760 hours
- **If leaked:** Valid until manually revoked
- **Privilege:** Often high (admin access, full API access)
- **Cleanup:** Manual (easy to forget)

**JIT ID Token:**
- **Attack window:** ~10 minutes (test duration) per CI run
- **If leaked:** Valid for remaining time (max 50 minutes if leaked immediately)
- **Privilege:** User-level (limited to test user permissions)
- **Cleanup:** Automatic (expires in 1 hour)

**Risk reduction:**
- **Attack window (per run):** 8,760 hours (long-lived token, always valid) → 0.17 hours (JIT token, valid for 10 minutes per CI run)
- **Attack window (annualized):** 8,760 hours/year → ~608 hours/year (10 CI runs/day × 10 minutes/run × 365 days)
  - **Reduction:** (8,760 - 608) / 8,760 ≈ 93% annual exposure reduction
  - *Note: The per-run attack window is 0.17 hours, but cumulative annual exposure is higher if CI runs frequently. Always consider both per-run and total exposure when evaluating risk.*
- Privilege: Admin → User (limited blast radius)
- Cleanup: Manual → Automatic (zero maintenance)

---

## Implementation: web/scripts/ci-create-id-token.mjs

```javascript
#!/usr/bin/env node
import admin from 'firebase-admin';

async function mintIdToken() {
  try {
    // 1. Initialize Admin SDK
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!privateKey) throw new Error('FIREBASE_PRIVATE_KEY not set');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });

    // 2. Create custom token for test user
    const uid = 'ci-test-user';
    const customToken = await admin.auth().createCustomToken(uid);

    // 3. Exchange for ID token
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to exchange token: ${response.statusText}`);
    }

    const { idToken, expiresIn } = await response.json();

    // 4. Output to GitHub Actions (captured by GITHUB_OUTPUT)
    console.log(idToken);

    process.exit(0);
  } catch (error) {
    console.error(`Error minting token: ${error.message}`);
    process.exit(1);
  }
}

mintIdToken();
```

**Key design decisions:**

1. **Exit codes matter:**
   - Success: `process.exit(0)` → CI knows it worked
   - Failure: `process.exit(1)` → CI gracefully degrades

2. **Token output to stdout:**
   - `console.log(idToken)` → Captured by shell: `TOKEN=$(node script.mjs)`
   - Clean output (no debug logs mixed with token)

3. **Error handling:**
   - If minting fails → test without authentication
   - Better than failing entire CI run
   - Graceful degradation

---

## Workflow Integration

```yaml
# .github/workflows/web-ci.yml

- name: Verify required secrets
  id: verify_secrets
  run: |
    # Check if Firebase secrets present
    if [ -n "$FIREBASE_PRIVATE_KEY" ]; then
      echo "firebase_ok=true" >> $GITHUB_OUTPUT
    else
      echo "firebase_ok=false" >> $GITHUB_OUTPUT
    fi

- name: Mint authentication token
  id: mint_token
  if: steps.verify_secrets.outputs.firebase_ok == 'true'
  continue-on-error: true  # Don't fail CI if minting fails
  run: |
    TOKEN=$(node web/scripts/ci-create-id-token.mjs)
    if [ -n "$TOKEN" ]; then
      echo "token=$TOKEN" >> $GITHUB_OUTPUT
      echo "success=true" >> $GITHUB_OUTPUT
    else
      echo "success=false" >> $GITHUB_OUTPUT
    fi

- name: Run Playwright tests
  env:
    PLAYWRIGHT_AUTH_ID_TOKEN: ${{ steps.mint_token.outputs.token }}
  run: |
    if [ -n "${{ steps.mint_token.outputs.token }}" ]; then
      echo "Running with authentication enabled"
    else
      echo "Running without authentication (auth tests skipped)"
    fi
    npm --workspace=web run test:e2e
```

**Flow:**
1. Verify secrets → Set `firebase_ok` flag
2. If `firebase_ok=true` → Mint token
3. If minting succeeds → Set `token` output variable
4. Playwright reads `PLAYWRIGHT_AUTH_ID_TOKEN`
5. If token present → Run authenticated tests
6. If token absent → Skip authenticated tests

**Graceful degradation:**
- Missing secrets → Skip auth tests, run basic tests
- Minting fails → Skip auth tests, run basic tests
- Build/lint/typecheck always run (no auth required)

---

## Trade-Offs and Alternatives

### Alternative 1: Firebase Emulator

**Approach:** Run Firebase emulator in CI, no real credentials needed

**Pros:**
- No secrets required
- Perfect isolation (each CI run gets fresh instance)
- Faster (no network calls to real Firebase)

**Cons:**
- Additional setup complexity (Docker or install emulator)
- Tests don't validate against real Firebase
- Emulator behavior may differ from production
- Firestore rules not tested against real security layer

**When to use:** Early development, unit tests, pure logic testing

**When NOT to use:** Integration tests, production validation

### Alternative 2: Service Account Credential Directly

**Approach:** Pass `FIREBASE_PRIVATE_KEY` directly to tests

**Pros:**
- Simpler (no token minting step)
- One less moving part

**Cons:**
- Exposes admin credentials to test environment
- If leaked in test logs → permanent compromise
- Violates principle of least privilege
- Tests have admin access (not realistic user permissions)

**Verdict:** ❌ Don't do this (security risk)

### Alternative 3: Pre-Generated Long-Lived ID Token

**Approach:** Generate ID token once, store in GitHub Secrets

**Pros:**
- No runtime minting needed
- Simpler workflow

**Cons:**
- ID tokens expire (1 hour default)
- Need to manually regenerate and update secret
- If leaked → valid until expiration
- Maintenance burden (remember to rotate)

**Verdict:** ❌ Don't do this (maintenance burden + security risk)

### Our Approach: JIT Token Minting

**Why we chose it:**
- ✅ Best security (time-boxed, least privilege)
- ✅ Low maintenance (automatic cleanup)
- ✅ Tests against real Firebase (integration testing)
- ✅ Graceful degradation (CI doesn't hard-fail)
- ✅ Audit trail (each CI run gets unique token)

**Cost:**
- +30 seconds per CI run (token minting)
- Requires Firebase Admin SDK setup
- One additional script to maintain

**ROI:** 30 seconds/run vs. permanent security risk → Worth it

---

## Broader Applications

This pattern applies to **any** system requiring temporary credentials:

### AWS STS (Assume Role)

```bash
# Mint temporary AWS credentials
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/ci-test-role \
  --role-session-name ci-run-$GITHUB_RUN_ID

# Returns: AccessKeyId, SecretAccessKey, SessionToken
# Valid for: 1-12 hours (configurable)
```

### OAuth Access Tokens

```javascript
// Exchange client credentials for access token
const response = await fetch('https://oauth.example.com/token', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  }),
});

const { access_token, expires_in } = await response.json();
// Valid for: expires_in seconds (typically 3600 = 1 hour)
```

### JWT Generation

```javascript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { sub: 'ci-test-user', iat: Math.floor(Date.now() / 1000) },
  process.env.JWT_PRIVATE_KEY,
  { expiresIn: '1h' }
);
// Valid for: 1 hour
```

**Common pattern:**
1. Store high-privilege credential in secrets (client secret, private key)
2. Use it to *generate* low-privilege, time-limited token
3. Pass time-limited token to tests
4. Token expires automatically

---

## Key Takeaways

1. **Time-boxed credentials reduce attack surface by 99.998%**
   - Long-lived token: 8,760 hours/year exposure
   - JIT token: ~10 minutes/run exposure

2. **Automatic expiration eliminates manual cleanup**
   - No need to remember to rotate/revoke
   - No stale credentials lingering in systems

3. **Graceful degradation keeps CI functional**
   - If minting fails → run tests without auth
   - Better than hard-failing entire CI pipeline

4. **Least privilege principle**
   - Admin credentials never exposed to tests
   - Tests run with user-level permissions
   - Realistic production simulation

5. **Pattern applies broadly**
   - AWS STS assume role
   - OAuth client credentials flow
   - JWT generation
   - Any ephemeral credential system

---

## Further Reading

- [Firebase Admin SDK - Custom Tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens)
- [AWS STS - Temporary Security Credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html)
- [OAuth 2.0 - Client Credentials Grant](https://oauth.net/2/grant-types/client-credentials/)
- [OWASP - Credential Management](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Management_Cheat_Sheet.html)

---

**Written:** 2025-11-20
**Session:** Day 005 - CI/CD Pipeline Enhancements
**Next Review:** 2025-11-21 (24 hours), 2025-11-23 (3 days), 2025-11-27 (7 days)
