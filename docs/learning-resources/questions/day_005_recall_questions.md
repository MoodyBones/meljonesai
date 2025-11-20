# Day 005 Recall Questions — CI/CD Improvements & Token Minting

*Spaced Repetition Study Guide for CI/CD Pipeline Enhancements*

**Review Schedule:**
- **First Review:** 2025-11-21 (24 hours)
- **Second Review:** 2025-11-23 (3 days)
- **Final Review:** 2025-11-27 (7 days)

---

## Q1: Token Minting vs Hardcoded Tokens

**Question:** Why do we mint fresh Firebase ID tokens on every CI run instead of storing a long-lived token as a GitHub secret?

**Answer:**

**Three key security benefits:**

1. **Time-Limited Blast Radius**
   - Minted tokens expire in 1 hour
   - If leaked in logs, very limited exposure window
   - Hardcoded tokens would remain valid much longer

2. **Automatic Cleanup**
   - No need to manually rotate or revoke tokens
   - Each CI run gets fresh credentials
   - Failed runs don't leave credentials behind

3. **Secret Rotation Resilience**
   - If Firebase private key is rotated, minting continues to work
   - No need to update a separate token secret
   - Reduces secret management overhead

**The Trade-off:**
- Slightly longer CI runs (1-2 seconds for token creation)
- Requires Firebase Admin SDK credentials in CI
- But: Much better security posture

**Alternative Considered:**
Firebase Emulator in CI (no production credentials needed at all)

---

## Q2: Cache Strategy for node_modules

**Question:** Why do we cache both `~/.npm` and `node_modules` separately? Isn't `npm ci` supposed to be fast with cache?

**Answer:**

**Two-layer caching strategy:**

1. **npm Cache (~/.npm)**
   - Caches downloaded package tarballs
   - Speeds up `npm ci` by avoiding re-downloads
   - Shared across all npm operations

2. **node_modules Cache**
   - Caches the *installed* state of dependencies
   - Skips extraction and linking steps
   - **Critical for native modules** like lightningcss

**Why Both Matter for Native Modules:**

```yaml
# Without node_modules cache:
npm ci                    # Re-extracts everything
npm install lightningcss  # Re-compiles native bindings (slow)

# With node_modules cache:
# Restore node_modules     # Native bindings already compiled
# Check if present         # Skip reinstall if found
```

**Time Savings:**
- npm cache only: ~30-60s CI time
- npm + node_modules cache: ~10-20s CI time
- **50-80% faster** for projects with native dependencies

**Cache Keys:**
```yaml
${{ hashFiles('web/package-lock.json', 'package-lock.json') }}
```
- Invalidates when dependencies change
- Prevents stale module issues

---

## Q3: Conditional Native Module Installation

**Question:** Explain the logic behind checking if native modules exist before installing them in CI.

**Answer:**

**The Pattern:**

```bash
if [ -f node_modules/lightningcss-linux-x64-gnu/package.json ]; then
  echo "✓ Native modules already installed from cache"
  # Just verify they load
else
  echo "Installing native modules..."
  npm install --no-save lightningcss-linux-x64-gnu@1.30.2
fi
```

**Why This Matters:**

1. **Cache Hit Scenario**
   - node_modules restored from cache
   - Native bindings already compiled
   - Just verify they load (fast check)
   - Saves ~20-30 seconds

2. **Cache Miss Scenario**
   - node_modules not cached or invalidated
   - Install native modules explicitly
   - Verify installation succeeded
   - Full diagnostic output for debugging

3. **Idempotency**
   - Safe to run multiple times
   - Won't break if cache partially restores
   - Self-healing if modules are missing

**npm Bug Context:**
Optional dependencies can fail silently in `npm ci` ([npm/cli#4828](https://github.com/npm/cli/issues/4828))
This pattern works around that bug by making the installation explicit.

---

## Q4: Secret Validation Separation

**Question:** Why do we check Firebase secrets separately from general secrets, and use `continue-on-error: true` for token minting?

**Answer:**

**Graceful Degradation Strategy:**

```yaml
# Step 1: Check general secrets (required)
verify_secrets:
  # Sets: secrets_ok, firebase_ok

# Step 2: Mint token (optional)
mint_token:
  if: steps.verify_secrets.outputs.firebase_ok == 'true'
  continue-on-error: true  # Don't fail CI if this fails

# Step 3: Run tests
test:
  if: steps.verify_secrets.outputs.secrets_ok == 'true'
  # Uses token if available, skips auth tests if not
```

**Why This Design:**

1. **Partial Feature Testing**
   - General secrets missing → Fail CI (nothing works)
   - Firebase secrets missing → Run non-auth tests only
   - Maximizes test coverage even with incomplete secrets

2. **Fork-Friendly**
   - Forks won't have Firebase secrets
   - Can still run majority of tests
   - Easier for external contributors

3. **Progressive Setup**
   - New deployment can validate basic functionality
   - Add Firebase later when needed
   - CI doesn't block on optional features

**Output Feedback:**
```bash
✓ All required secrets present
⚠️  Firebase secrets missing (authenticated tests will be skipped)
```

Clear indication of what's working vs. degraded.

---

## Q5: Node.js Module Loading Test

**Question:** Why do we use `node -e "require('lightningcss')"` to verify native modules instead of just checking if files exist?

**Answer:**

**File Presence ≠ Module Works**

**What Can Go Wrong:**

1. **Wrong Platform Binary**
   - File exists: `lightningcss-darwin-arm64`
   - But we're on: `linux-x64-gnu`
   - File check passes ✓
   - Module load fails ✗

2. **Corrupted Download**
   - File exists with correct name
   - But tar extraction failed
   - File check passes ✓
   - Module load fails ✗

3. **Missing Dependencies**
   - Native module exists
   - But libc version incompatible
   - File check passes ✓
   - Module load fails ✗

**The require() Test:**

```bash
node -e "require('lightningcss'); console.log('✓ lightningcss loaded')"
```

**What This Validates:**
- ✅ Correct platform binary installed
- ✅ Binary is not corrupted
- ✅ System dependencies present
- ✅ Module can actually be loaded by Node.js
- ✅ Ready to use in Next.js build

**Fail Fast:**
Better to fail in diagnostics step than during build when error is buried in webpack output.

---

## Q6: GitHub Actions Output Variables

**Question:** How does the token minting step pass the ID token to the Playwright test step, and why use `$GITHUB_OUTPUT` instead of environment variables?

**Answer:**

**Step-to-Step Communication Pattern:**

```yaml
# Step 1: Mint token
- id: mint_token
  run: |
    TOKEN=$(node web/scripts/ci-create-id-token.mjs)
    echo "token=$TOKEN" >> $GITHUB_OUTPUT
    echo "success=true" >> $GITHUB_OUTPUT

# Step 2: Use token
- env:
    PLAYWRIGHT_AUTH_ID_TOKEN: ${{ steps.mint_token.outputs.token }}
  run: npm run test:e2e
```

**Why `$GITHUB_OUTPUT` vs Environment Variables:**

1. **Scoped Visibility**
   - `$GITHUB_OUTPUT`: Only in steps that reference it
   - Env vars: All subsequent steps see it
   - Reduces accidental leakage

2. **Masked in Logs**
   - GitHub automatically masks output variables in logs
   - Prevents token exposure in build logs
   - Environment variables may appear in debug output

3. **Explicit Dependencies**
   - `steps.mint_token.outputs.token` shows clear dependency
   - Easier to understand step relationships
   - Self-documenting workflow

**Security Note:**
Even though it's masked, the token is still in memory.
That's why we:
- Use short-lived tokens (1 hour expiry)
- Only create when needed (`if: firebase_ok == 'true'`)
- Use `continue-on-error` to prevent hanging with credentials in memory

---

## Q7: PR Trigger Types

**Question:** Why does the workflow trigger on `[opened, synchronize, reopened, edited]` for pull requests but only `push` to `main`?

**Answer:**

**PR Events Explained:**

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, edited]
  push:
    branches: [main]  # NOT develop
```

**Why These PR Types:**

1. **opened** - New PR created
   - First CI validation
   - Catches issues before review

2. **synchronize** - New commits pushed to PR
   - Validates each update
   - Most common trigger

3. **reopened** - PR reopened after being closed
   - Ensures tests still pass
   - Dependencies may have updated

4. **edited** - PR title/description changed
   - Important if title affects changelog
   - Validates metadata changes

**Why NOT `push` to `develop`:**

```
PR opened (develop → main)
  ↓
  pull_request: [opened] ✓  (runs once)
  
Push to develop
  ↓
  push: [develop] ✗  (would run second time)
```

- Prevents duplicate runs
- `pull_request` trigger is sufficient
- Saves CI minutes
- Only `push` to `main` for production validation

**Alternative Pattern:**
Some teams use `push` to `develop` only, no PR triggers.
We prefer PR triggers because they:
- Show status checks directly on PR
- Better GitHub integration
- Clearer pass/fail indication

