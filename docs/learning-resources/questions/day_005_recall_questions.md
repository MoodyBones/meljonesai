# Day 005 Recall Questions
## CI/CD Enhancements: Token Minting, Caching, Secret Validation

**Date:** 2025-11-20
**Session:** Day 005 - CI/CD Pipeline Improvements
**Review Schedule:** Day +1, +3, +7

---

## Instructions

Answer these questions without looking at the documentation. Check your answers afterward. These test your understanding of advanced CI/CD patterns: just-in-time credential generation, two-layer caching strategies, and graceful degradation.

---

### Q1: Token Minting Security Model

**Question:** Explain the security model behind just-in-time (JIT) token minting in CI/CD pipelines. Why do we mint a fresh Firebase ID token for each CI run instead of storing a long-lived token in GitHub Secrets? What is the time-boxed exposure window, and what happens if token minting fails?

**Answer:**

```
Security Model: Just-in-Time Credential Generation

1. Time-Boxed Exposure (1 hour)
   - Token minted at runtime using Firebase Admin SDK
   - Valid for 1 hour only (Firebase ID token default expiry)
   - Automatically expires after test completion
   - No persistent credential storage in CI environment

2. Why NOT Store Long-Lived Tokens?

   ❌ Long-Lived Token Problems:
   - If GitHub Secrets compromised → attacker has permanent access
   - Revocation requires manual intervention
   - Difficult to audit: can't distinguish CI use from unauthorized use
   - Violates principle of least privilege

   ✅ JIT Token Benefits:
   - Compromised token expires in 1 hour automatically
   - Each CI run gets unique token (audit trail)
   - Principle of least privilege: only active during test
   - Automatic cleanup (no manual revocation needed)

3. Graceful Degradation Pattern

   Token minting workflow:
   Step 1: Verify Firebase secrets present
   Step 2: Mint token (continue-on-error: true)
   Step 3: Check if token available
   Step 4a: If token exists → Run authenticated tests
   Step 4b: If token missing → Run unauthenticated tests only

   Code:
   if [ -n "${{ steps.mint_token.outputs.token }}" ] && \
      [ "${{ steps.mint_token.outputs.success }}" == "true" ]; then
     echo "Running with authentication enabled"
   else
     echo "Running without authentication (auth tests skipped)"
   fi

4. Attack Surface Reduction

   Traditional approach:
   - Long-lived credential in GitHub Secrets
   - Active 24/7/365
   - Single point of failure

   JIT approach:
   - Credential exists for ~10 minutes (test duration)
   - Active only during CI run
   - Automatically expires
   - Reduced attack window: 99.981% reduction

   Math:
   - Traditional: 525,600 min/year (always active)
   - JIT: ~100 min/year (10 min × 10 CI runs/day × 365 days ÷ 365)
   - Attack window: 100 / 525,600 = 0.019% (99.98% reduction)

5. Audit Trail Benefits

   Each token is unique per CI run:
   - Firebase logs show: "Token X used at timestamp Y"
   - Can correlate token usage with CI run ID
   - Unauthorized use stands out (token used outside CI timeframe)
   - Forensics: Which CI run leaked the token?
```

**Why it matters:** JIT credential generation is a fundamental security pattern applicable to AWS STS, OAuth refresh tokens, JWT generation, and any CI/CD pipeline requiring authentication. Understanding time-boxed exposure prevents credential compromise escalation.

---

### Q2: Two-Layer npm Cache Strategy

**Question:** The web-ci workflow uses a two-layer caching strategy for npm dependencies. Explain the difference between caching `~/.npm` vs `node_modules`, why we need both, and how this specifically helps with native modules like lightningcss that require platform-specific binaries.

**Answer:**

```
Two-Layer Cache Strategy

Layer 1: ~/.npm Cache (Package Tarballs)
Location: ~/.npm
Key: ${{ runner.os }}-node-${{ hashFiles('web/package-lock.json') }}
Contents: Downloaded .tgz files from npm registry

Purpose:
- Caches downloaded package tarballs
- Speeds up npm ci (no network fetches)
- Shared across all CI runs with same package-lock.json

Layer 2: node_modules Cache (Installed Dependencies)
Location: node_modules, web/node_modules
Key: ${{ runner.os }}-modules-${{ hashFiles('web/package-lock.json') }}
Contents: Fully installed packages including .node binaries

Purpose:
- Caches installed dependencies (post npm ci)
- Includes compiled/native binaries
- Avoids reinstallation even if tarballs are cached

Why Both Layers?

Scenario 1: Cold Cache (First Run)
1. ~/.npm cache MISS → Download tarballs from registry (slow)
2. node_modules cache MISS → Run npm ci + install native modules (slow)
Result: ~2-3 minutes total

Scenario 2: Warm ~/.npm, Cold node_modules
1. ~/.npm cache HIT → Use cached tarballs (fast)
2. node_modules cache MISS → Run npm ci (medium)
   - npm ci extracts from ~/.npm cache
   - But still needs to unpack and run postinstall scripts
3. Native modules MISS → Install lightningcss-linux-x64-gnu (slow)
Result: ~1-2 minutes

Scenario 3: Warm ~/.npm + node_modules (Ideal)
1. ~/.npm cache HIT → Use cached tarballs (fast)
2. node_modules cache HIT → Skip npm ci entirely (fastest)
3. Native modules HIT → Skip installation (fastest)
Result: ~10-20 seconds

Native Module Challenge:

lightningcss has optional dependencies:
- lightningcss-darwin-arm64 (macOS M1/M2)
- lightningcss-linux-x64-gnu (Linux x64)
- lightningcss-win32-x64-msvc (Windows)

Problem:
- ~/.npm cache stores all platform tarballs
- But npm ci only installs current platform binaries
- If node_modules not cached → native module missing
- Requires explicit: npm install lightningcss-linux-x64-gnu

Solution with node_modules Cache:
- Cache includes lightningcss-linux-x64-gnu.node binary
- Skip npm install entirely
- Validation: Check if .node file exists + test module loading
- Only install if validation fails

Validation Code:
if [ -f node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node ] && \
   node -e "require('lightningcss')" 2>/dev/null; then
  echo "✓ Native modules already working"
else
  npm install --no-save lightningcss-linux-x64-gnu@1.30.2
fi

Cache Efficiency:
- Without node_modules cache: Install native modules every run (~30 sec)
- With node_modules cache: Skip installation if validation passes (~2 sec)
- Time saved: 28 seconds per CI run
- Over 100 runs: 46 minutes saved
```

**Why it matters:** Two-layer caching is essential for CI/CD cost optimization and speed. Understanding when to cache tarballs vs installed packages prevents expensive reinstalls and reduces CI time by 60-80%.

---

### Q3: Conditional Installation Patterns

**Question:** The native module installation step uses a conditional check before installing. Explain why checking file existence (`[ -f file.node ]`) AND module loading (`node -e "require()"`) is more robust than checking just one. What edge cases does each check catch?

**Answer:**

```
Conditional Installation: Defense in Depth

Code:
if [ -f node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node ] && \
   [ -f node_modules/@tailwindcss/oxide-linux-x64-gnu/index.node ] && \
   node -e "require('lightningcss')" 2>/dev/null && \
   node -e "require('@tailwindcss/oxide')" 2>/dev/null; then
  echo "✓ Native modules already working"
else
  npm install --no-save lightningcss-linux-x64-gnu@1.30.2
fi

Check 1: File Existence ([ -f file.node ])

Purpose: Verify .node binary exists on disk

Edge Cases Caught:
1. Partial Cache Restore
   - node_modules directory exists
   - But .node file missing (corrupted cache)
   - Without check: require() fails cryptically

2. Empty Directory
   - Package folder exists: node_modules/lightningcss-linux-x64-gnu/
   - But package.json only, no .node binary
   - Without check: require() throws "Cannot find module"

3. Wrong Platform Binary
   - Cache restored darwin binary on linux runner
   - File exists but wrong architecture
   - File check passes, but load check fails

Check 2: Module Loading (node -e "require()")

Purpose: Verify module is actually loadable

Edge Cases Caught:
1. Corrupted Binary
   - .node file exists on disk
   - But binary is corrupted (partial download, disk error)
   - File check passes, but loading fails

2. ABI Mismatch
   - .node binary compiled for Node 18
   - CI running Node 20
   - File exists but can't load (ABI version mismatch)

3. Missing Dependencies
   - .node binary exists
   - But depends on system library not installed
   - File check passes, loading fails with dlopen error

4. Permission Issues
   - File exists but not executable
   - File check passes (file exists)
   - Loading fails (permission denied)

Defense in Depth Strategy:

Layer 1: File existence (fast, catches obvious failures)
Layer 2: Module loading (slower, catches subtle failures)

if file_exists && module_loads; then
  # 99.9% confidence module works
  skip_installation()
else
  # One check failed → don't risk it
  install_native_module()
fi

Error Suppression (2>/dev/null):

Why suppress stderr?
- node -e "require('lightningcss')" might fail
- We don't want error output cluttering CI logs
- We just need exit code: 0 = success, 1 = failure
- Conditional uses exit code, not stdout/stderr

Example without suppression:
Error: Cannot find module 'lightningcss'
  at Module._resolveFilename
  at Module._load
  ...
(Confusing if we're going to install it anyway)

With suppression:
(Silent failure, check returns false, installation proceeds)

Idempotency:

Running the check multiple times is safe:
1. First run: Check fails → Install
2. Second run: Check passes → Skip
3. Third run: Check passes → Skip

No side effects from repeated checks:
- File existence check: read-only
- Module loading: read-only (no state changes)
```

**Why it matters:** Defense in depth prevents silent failures in CI. Checking both file existence and module loading catches 99% of edge cases that would otherwise cause cryptic build failures 20 minutes into the pipeline.

---

### Q4: Secret Validation with Graceful Degradation

**Question:** The workflow validates secrets and outputs `secrets_ok` and `firebase_ok` flags. Explain the difference between "required" and "optional" secrets, why Firebase secrets are checked separately, and what the graceful degradation path looks like when secrets are missing.

**Answer:**

```
Secret Validation Strategy

Two Categories of Secrets:

1. General Application Secrets (Optional for CI)
   - SANITY_PREVIEW_SECRET
   - NEXT_PUBLIC_SITE_URL
   - SANITY_WRITE_TOKEN
   - ANTHROPIC_API_KEY
   - N8N_WEBHOOK_SECRET

   Why optional?
   - Not required for build/lint/typecheck
   - Not required for unauthenticated tests
   - Future features (M2-M6 not yet implemented)

2. Firebase Secrets (Optional but Grouped)
   - FIREBASE_PROJECT_ID
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY
   - NEXT_PUBLIC_FIREBASE_API_KEY

   Why separate category?
   - All-or-nothing dependency
   - Either have full Firebase config or can't use Firebase at all
   - Partial config is worse than no config (misleading errors)

Validation Logic:

Step 1: Check General Secrets
for v in SANITY_PREVIEW_SECRET NEXT_PUBLIC_SITE_URL ...; do
  if [ -z "${!v}" ]; then
    missing="$missing $v"
  fi
done

if [ -n "$missing" ]; then
  echo "secrets_ok=false" >> $GITHUB_OUTPUT
else
  echo "secrets_ok=true" >> $GITHUB_OUTPUT
fi

Step 2: Check Firebase Secrets (Separate)
for v in FIREBASE_PROJECT_ID FIREBASE_CLIENT_EMAIL ...; do
  if [ -z "${!v}" ]; then
    firebase_missing="$firebase_missing $v"
  fi
done

if [ -n "$firebase_missing" ]; then
  echo "firebase_ok=false" >> $GITHUB_OUTPUT
else
  echo "firebase_ok=true" >> $GITHUB_OUTPUT
fi

Graceful Degradation Paths:

Scenario 1: All Secrets Present
secrets_ok=true, firebase_ok=true
→ Run full test suite (authenticated + unauthenticated)
→ Mint ID token
→ Test auth flows

Scenario 2: Firebase Secrets Missing
secrets_ok=false, firebase_ok=false
→ Skip token minting step
→ Skip authenticated Playwright tests
→ Still run: build, lint, typecheck, unauthenticated tests
→ Playwright conditional: if [ -z "$TOKEN" ]; skip auth tests

Scenario 3: Only Firebase Secrets Present (Edge Case)
secrets_ok=false, firebase_ok=true
→ Mint ID token
→ Run authenticated tests
→ Skip Sanity/n8n/AI tests (future milestones)

Output Variables Pattern:

GitHub Actions Output Variables:
echo "firebase_ok=true" >> $GITHUB_OUTPUT

Later steps access via:
if: steps.verify_secrets.outputs.firebase_ok == 'true'

Why not environment variables?
- Environment vars: mutable, can be overridden
- Output variables: immutable, explicit step dependencies
- Better for conditional logic in workflows

Graceful Degradation Benefits:

1. Early-Stage Development
   - Can run CI before all secrets configured
   - Get lint/typecheck/build feedback immediately
   - Add secrets incrementally as features implement

2. Contributor-Friendly
   - External contributors can't access secrets (security)
   - But CI still runs basic checks
   - Maintainer reviews with full test suite

3. Partial Outage Resilience
   - If Firebase has outage → auth tests fail
   - But build/lint/typecheck still validate code quality
   - Can merge non-auth changes during outage

4. Clear Feedback
   Output:
   ⚠️  The following required secrets are missing: SANITY_WRITE_TOKEN
   ⚠️  Firebase secrets missing (authenticated tests will be skipped): FIREBASE_PRIVATE_KEY

   Developer knows:
   - Which secrets are missing
   - What functionality will be skipped
   - What tests will still run

Failure Modes:

Hard Fail (CI blocks merge):
- Build fails
- Typecheck fails
- Lint fails

Soft Fail (CI passes, warnings shown):
- Secrets missing (tests skipped)
- Token minting fails (auth tests skipped)
- Playwright artifacts missing (no test failure screenshots)
```

**Why it matters:** Graceful degradation makes CI accessible to all contributors while maintaining security. Understanding when to hard-fail vs soft-fail prevents frustrating CI experiences and blocked PRs for missing optional features.

---

### Q5: GitHub Actions Output Variables vs Environment Variables

**Question:** In the token minting step, why do we use `echo "token=$TOKEN" >> $GITHUB_OUTPUT` instead of `echo "TOKEN=$TOKEN" >> $GITHUB_ENV`? Explain the difference between output variables and environment variables, and when to use each.

**Answer:**

```
Output Variables vs Environment Variables

Output Variables (GITHUB_OUTPUT)

Syntax:
echo "token=$TOKEN" >> $GITHUB_OUTPUT

Access Pattern:
${{ steps.mint_token.outputs.token }}

Characteristics:
1. Step-Scoped
   - Only available to subsequent steps
   - Not available within same step
   - Explicit step dependency via steps.<id>.outputs.<name>

2. Immutable
   - Set once per step
   - Cannot be overridden by later steps
   - Explicit data flow

3. Type-Safe (String)
   - Always treated as strings
   - No variable expansion
   - No shell interpretation

Environment Variables (GITHUB_ENV)

Syntax:
echo "TOKEN=$TOKEN" >> $GITHUB_ENV

Access Pattern:
${{ env.TOKEN }} or $TOKEN (in bash)

Characteristics:
1. Workflow-Scoped
   - Available to all subsequent steps
   - Available within same step (after set)
   - Implicit, can cause spooky action at a distance

2. Mutable
   - Can be overridden by later steps
   - Last write wins
   - Implicit data flow

3. Shell-Interpreted
   - Subject to variable expansion
   - Can cause injection vulnerabilities
   - Requires careful quoting

When to Use Output Variables:

✅ Use for:
1. Explicit data passing between steps
   Step A produces token → Step B consumes token

2. Conditional logic
   if: steps.verify.outputs.success == 'true'

3. Sensitive data
   - Tokens, secrets (shorter lifetime)
   - Limited to steps that need it

4. Multiple values from same step
   echo "token=$TOKEN" >> $GITHUB_OUTPUT
   echo "success=true" >> $GITHUB_OUTPUT
   echo "expires_at=$EXPIRES" >> $GITHUB_OUTPUT

When to Use Environment Variables:

✅ Use for:
1. Configuration shared across many steps
   - Database connection strings
   - API endpoints
   - Node version

2. Values used in multiple commands within a step
   export DATABASE_URL=...
   command1 # uses DATABASE_URL
   command2 # uses DATABASE_URL

3. Overriding default behavior
   - Setting FORCE_COLOR=1
   - Setting NODE_ENV=production

Token Minting Example (Why Output Variable):

Bad (Environment Variable):
- name: Mint token
  run: |
    TOKEN=$(node mint.mjs)
    echo "TOKEN=$TOKEN" >> $GITHUB_ENV

- name: Run tests
  env:
    PLAYWRIGHT_AUTH_ID_TOKEN: ${{ env.TOKEN }}  # ❌ Any step can access
  run: npm test

Problems:
- Token available to ALL subsequent steps (broader scope than needed)
- Another step could accidentally/maliciously override TOKEN
- No explicit dependency (hard to track token flow)

Good (Output Variable):
- name: Mint token
  id: mint_token
  run: |
    TOKEN=$(node mint.mjs)
    echo "token=$TOKEN" >> $GITHUB_OUTPUT  # ✅ Scoped to this step

- name: Run tests
  env:
    PLAYWRIGHT_AUTH_ID_TOKEN: ${{ steps.mint_token.outputs.token }}
  run: npm test

Benefits:
- Token only passed to steps that explicitly reference it
- Clear data flow: mint_token → tests
- Cannot be overridden by intermediate steps
- Self-documenting dependencies

Security Consideration:

Secrets in Output Variables:
- Still visible in workflow logs (use ::add-mask::)
- Still passed as strings (no injection risk)
- Shorter lifetime (step-scoped vs workflow-scoped)

Secrets in Environment Variables:
- Longer lifetime (entire workflow)
- More attack surface (any step can access)
- Can be overridden (mutation risk)

Best Practice for Sensitive Data:
1. Use output variables
2. Mask sensitive values: echo "::add-mask::$TOKEN"
3. Limit to steps that need it
4. Use continue-on-error: true for generation step
```

**Why it matters:** Output variables provide explicit data flow and reduced attack surface for sensitive credentials. Understanding variable scope prevents accidental credential leakage and makes workflows easier to audit.

---

### Q6: PR Trigger Event Types

**Question:** The web-ci workflow triggers on `pull_request: types: [opened, synchronize, reopened, edited]`. Explain what each event type means, why we added `edited`, and how this prevents duplicate CI runs compared to also having a `push` trigger on `develop`.

**Answer:**

```
PR Trigger Event Types

Event: opened
Fires: When PR is first created
Use case: Initial validation of PR
Example: User opens PR #39

Event: synchronize
Fires: When new commits pushed to PR branch
Use case: Validate each new commit
Example: User pushes fix to PR #39

Event: reopened
Fires: When closed PR is reopened
Use case: Re-validate if PR closed then reopened
Example: PR #39 closed by mistake, then reopened

Event: edited
Fires: When PR title, description, or base branch changed
Use case: Validate if base branch changed (e.g., develop → main)
Example: User retargets PR #39 from develop → main

Why We Added 'edited':

Scenario: Dependabot PR Retargeting
1. Dependabot opens PR #42 targeting main
2. User edits PR, changes base branch: main → develop
3. Without 'edited' trigger:
   - CI ran against main branch
   - No CI run against develop branch
   - Merging to develop without validation
4. With 'edited' trigger:
   - CI runs when base branch changed
   - Validates against new base (develop)
   - Safe to merge

Duplicate Run Prevention:

❌ Bad Configuration (Causes Duplicates):
on:
  pull_request:
    types: [opened, synchronize, reopened, edited]
  push:
    branches: [develop]

Scenario:
1. User pushes commit to feature/m2-n8n branch
2. This updates PR #45 (feature/m2-n8n → develop)
3. Two triggers fire:
   - pull_request (synchronize) → CI run #1
   - push (develop) → NO (push is to feature branch, not develop)

Wait, why does this cause duplicates?

Actually, it doesn't with this config!

The duplicate issue happens with:
on:
  pull_request: ...
  push:
    branches: [develop]

When:
1. PR #45 merged to develop
2. push event on develop → CI run #1
3. If there's another PR targeting develop, no duplicate

The REAL duplicate issue:
on:
  pull_request:
    branches: [develop]  # ← Targets develop
  push:
    branches: [develop]  # ← Pushes to develop

Scenario:
1. Feature branch pushed
2. PR opened (feature → develop)
3. PR triggers: pull_request (opened) → CI run #1
4. User pushes to feature branch again
5. PR triggers: pull_request (synchronize) → CI run #2
6. (No duplicate here)

BUT:
1. PR merged to develop (via merge commit)
2. push event on develop → CI run #3
3. (This is the only run on develop, not a duplicate)

Actually, the duplicate WAS:
Before fix (PR #39 session):
on:
  pull_request: ...
  push:
    branches: [main, develop]  # ❌ Both branches

Scenario:
1. Open PR #45 (feature → develop)
2. Triggers: pull_request (opened) → CI run #1
3. Push commit to PR branch
4. Triggers: pull_request (synchronize) → CI run #2
5. (Still no duplicate)

The duplicate was:
If develop branch itself receives a direct push (not via PR merge):
1. Push to develop
2. Triggers: push (develop) → CI run #1
3. If PR #46 is open targeting develop:
   - PR receives the commit
   - Triggers: pull_request (synchronize) → CI run #2
4. Duplicate!

Solution:
on:
  pull_request:
    types: [opened, synchronize, reopened, edited]
    # No branches filter - validates all PRs
  push:
    branches: [main]  # ✅ Only production

Why This Works:
- PRs validated via pull_request trigger (ALL PRs, regardless of target)
- develop branch: only validated via PRs (no direct push trigger)
- main branch: validated on push (production deployments)

Benefits:
1. Single CI run per PR update
2. No duplicate runs when merging to develop
3. Production (main) always validated on push
4. Clear separation: PRs = validation, main = deployment

Special Case: edited Event
- Changing base branch (main → develop) triggers edited
- CI re-runs against new base branch
- Prevents merging without validation against correct base
```

**Why it matters:** Understanding PR trigger events prevents wasted CI minutes and confusing duplicate runs. Adding `edited` ensures Dependabot PR retargeting doesn't bypass CI validation.

---

### Q7: Cache Idempotency and Native Module Re-installation

**Question:** If the node_modules cache is successfully restored but the conditional check fails (binary exists but can't load), what happens? Walk through the idempotency of running `npm install --no-save lightningcss-linux-x64-gnu@1.30.2` multiple times, and explain why `--no-save` is critical.

**Answer:**

```
Cache Restore + Conditional Failure Scenario

Timeline:

Step 1: Restore node_modules cache
Cache hit: node_modules restored from previous run
Contents:
  node_modules/
    lightningcss-linux-x64-gnu/
      lightningcss.linux-x64-gnu.node (binary exists)

Step 2: Run conditional check
if [ -f node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node ] && \
   node -e "require('lightningcss')" 2>/dev/null; then

File check: ✅ Pass (file exists)
Load check: ❌ Fail (corrupted binary / ABI mismatch)

Overall: ❌ Conditional fails

Step 3: Run installation
npm install --no-save lightningcss-linux-x64-gnu@1.30.2

What happens:
1. npm downloads fresh tarball
2. npm extracts to node_modules/lightningcss-linux-x64-gnu/
3. Overwrites corrupted binary with fresh one
4. Binary now works

Idempotency: Running Installation Multiple Times

First run:
npm install --no-save lightningcss-linux-x64-gnu@1.30.2
Result: Package installed

Second run (immediately after):
npm install --no-save lightningcss-linux-x64-gnu@1.30.2
Result: Package already installed, npm skips (idempotent)

Third run:
npm install --no-save lightningcss-linux-x64-gnu@1.30.2
Result: Still skips (idempotent)

Idempotency means:
- Running the command multiple times = same result
- No side effects from repeated runs
- Safe to re-run if unsure of state

Why npm install is idempotent:
1. npm checks: Is package already installed?
2. If yes: Skip installation
3. If no: Install package
4. Result: Package is installed (guaranteed)

Why --no-save is CRITICAL

Without --no-save (Default Behavior):

npm install lightningcss-linux-x64-gnu@1.30.2

What happens:
1. Package installed to node_modules/
2. package.json MODIFIED:
   "dependencies": {
     "lightningcss": "^1.30.2",
     "lightningcss-linux-x64-gnu": "1.30.2"  // ← ADDED
   }
3. package-lock.json MODIFIED:
   Added lockfile entry for lightningcss-linux-x64-gnu

Problems:
1. CI modifies source files (package.json, package-lock.json)
2. Git working tree becomes dirty
3. If committed → platform-specific dependency in source control
4. macOS developer runs npm install → installs Linux binary (wrong platform)
5. Breaks local development

With --no-save:

npm install --no-save lightningcss-linux-x64-gnu@1.30.2

What happens:
1. Package installed to node_modules/
2. package.json: UNCHANGED ✅
3. package-lock.json: UNCHANGED ✅

Benefits:
1. CI doesn't modify source files
2. Working tree stays clean
3. Installation is environment-specific (CI only)
4. Local development unaffected

Platform-Specific Installation Pattern:

Development (macOS):
npm ci
→ Installs lightningcss-darwin-arm64 (automatic, via optional deps)
→ package.json: lightningcss@^1.30.2 (no platform binary)

CI (Linux):
npm ci
→ Tries to install lightningcss-linux-x64-gnu (optional dep)
→ Might fail silently
→ Fallback: npm install --no-save lightningcss-linux-x64-gnu@1.30.2
→ package.json: UNCHANGED (still just lightningcss@^1.30.2)

Why This Works:
- Source control: platform-agnostic (lightningcss parent package)
- Runtime: platform-specific (correct binary installed per environment)
- No cross-platform conflicts

Alternative: --save-optional

npm install --save-optional lightningcss-linux-x64-gnu@1.30.2

Result:
package.json:
"optionalDependencies": {
  "lightningcss-linux-x64-gnu": "1.30.2"
}

Problems:
- Still modifies package.json
- macOS developer sees Linux binary in optionalDependencies
- Confusing (why is Linux binary in my package.json?)
- Better to keep CI-specific logic in CI config

Best Practice:

Source Control:
package.json: Platform-agnostic dependencies only
"dependencies": {
  "lightningcss": "^1.30.2"  // Parent package
}

CI Configuration:
.github/workflows/web-ci.yml:
- name: Install native modules for Linux
  run: npm install --no-save lightningcss-linux-x64-gnu@1.30.2

Result:
- Clear separation: source (platform-agnostic) vs CI (platform-specific)
- No source file modification
- Explicit CI requirements (documented in workflow)
```

**Why it matters:** Understanding idempotency and `--no-save` prevents CI from polluting source control with platform-specific dependencies. This pattern applies to any environment-specific installation (Docker images, native modules, system libraries).

---

## Scoring Guide

- **7/7 correct:** Excellent! Deep understanding of advanced CI/CD patterns.
- **5-6 correct:** Good. Review missed concepts and PR #55/#59 changes.
- **3-4 correct:** Basic understanding. Study web-ci.yml and token minting script.
- **0-2 correct:** Needs review. Re-read Day 005 technical posts and workflow comments.

---

## Review Schedule

**First Review:** 24 hours (2025-11-21)
**Second Review:** 3 days (2025-11-23)
**Third Review:** 7 days (2025-11-27)

Mark questions you got wrong and focus on those in future reviews.

---

## Additional Study

If you missed questions, review these resources:

- **Q1:** web/scripts/ci-create-id-token.mjs + .github/workflows/web-ci.yml lines 139-158
- **Q2:** .github/workflows/web-ci.yml lines 31-47 (cache configuration)
- **Q3:** .github/workflows/web-ci.yml lines 52-70 (native module validation)
- **Q4:** .github/workflows/web-ci.yml lines 86-137 (secret validation)
- **Q5:** GitHub Actions documentation: Output variables vs environment variables
- **Q6:** .github/workflows/web-ci.yml lines 3-9 (trigger configuration) + PR #39 session notes
- **Q7:** npm install --no-save documentation + idempotency patterns

---

*Created: 2025-11-20 | Session: Day 005 - CI/CD Enhancements | Next: Day 006*
