# Copilot Instructions & Guidelines

This document contains robust guidelines for maintaining and developing this project, based on lessons learned from debugging CI/CD issues and implementing Firebase authentication.

## Table of Contents
- [Project Structure & Workspace Management](#project-structure--workspace-management)
- [Development Workflow & Best Practices](#development-workflow--best-practices)
- [CI/CD Configuration](#cicd-configuration)
- [Firebase Patterns](#firebase-patterns)
- [Next.js Build Optimization](#nextjs-build-optimization)
- [Native Modules & Dependencies](#native-modules--dependencies)
- [TypeScript Best Practices](#typescript-best-practices)
- [Git Workflow](#git-workflow)
- [Testing & Validation](#testing--validation)
- [Documentation Best Practices](#documentation-best-practices)
- [End-of-Day Knowledge Routine](#end-of-day-knowledge-routine)

---

## Project Structure & Workspace Management

### Monorepo Architecture

This project uses **npm workspaces** to manage multiple packages:

```
meljonesai/
├── web/              # Next.js application
├── sanity-studio/    # Sanity CMS studio
└── package.json      # Root workspace configuration
```

**Why separate workspaces:**
- **Different lifecycles**: Web app deploys separately from CMS studio
- **Dependency isolation**: Prevents cross-project version conflicts
- **Clearer mental model**: Different tools have different purposes
- **Simpler CI/CD**: Each workspace can have independent build steps

### Workspace Commands

**✅ Always use `--workspace` flag in CI:**

```bash
# Correct
npm --workspace=web run build
npm --workspace=web run lint
npm --workspace=web run typecheck

# Wrong (runs all workspaces or root)
npm run build
```

**Local development convenience scripts:**

```bash
npm run web:dev         # Start Next.js dev server
npm run studio:dev      # Start Sanity studio
npm run web:build       # Build web for production
npm run studio:build    # Build studio
```

### Turbopack & Modern Tooling

**Using Turbopack (Next.js bundler):**
- Faster incremental builds than Webpack
- Better HMR (Hot Module Replacement) performance
- Requires `@next/swc` native binaries

**React Compiler enabled:**
- Auto-optimization of components
- Configured via `reactCompiler: true` in `next.config.ts`
- Reduces manual `useMemo`/`useCallback` needs

**Important:** After Next.js version updates, run `npm install` to update SWC binaries.

---

## Development Workflow & Best Practices

### Documentation-First Approach

**Before writing code, create documentation:**

1. **Clear specifications** reduce decision fatigue
2. **Copilot context** improves AI assistance accuracy
3. **Future maintainability** preserves mental context
4. **Onboarding speed** helps collaborators quickly understand architecture

**ROI:** 1 hour planning = 2-5 hours saved in execution and debugging.

### Feature-Branch Workflow

Even as a solo developer, use professional Git practices:

**Branch structure:**
```
main (production)
  ↑
  develop (integration/preview)
    ↑
    ├── feature/m1-firebase-setup
    ├── feature/m2-n8n-workflow
    └── feature/m3-sanity-schemas
```

**Benefits:**
- Prevents accidental force-push disasters
- Creates clean, semantic git history
- Enables context switching without losing work
- Documents decisions through PR descriptions
- Makes debugging easier (clear commit boundaries)

**Time investment:** ~2-3 minutes per feature to create/merge PRs
**Time saved:** Hours from prevented git mistakes + easier debugging

### Branch Naming Convention

**Format:** `feature/mX-descriptive-name`

```bash
# ✅ Good
feature/m1-firebase-setup
feature/m2-n8n-workflow
feature/m3-sanity-schemas

# ❌ Bad
firebase-auth
my-branch
fix-stuff
```

**Why milestone prefix matters:**
- Easy to filter: `git log --grep="m2"`
- Clear scope identification
- Consistent with commit message convention

### Conventional Commits with Milestone Prefix

**Format:** `<type>(mX): <subject>`

```bash
# Feature
feat(m1): add Firebase authentication middleware

# Fix
fix(m2): correct webhook validation logic

# Documentation
docs(m3): update Sanity schema comments

# Refactor
refactor(m1): improve session cookie handling

# CI/CD
ci: add lightningcss Linux binary installation

# Tests
test(m4): add admin page smoke tests
```

**Complete commit message example:**

```
feat(m1): add Firebase authentication middleware

Implemented server-side auth protection for /admin routes.
Middleware verifies Firebase tokens using Admin SDK and
redirects unauthenticated users to /login page.

Features:
- Token verification with Firebase Admin SDK
- Automatic redirect for expired/invalid tokens
- Proper error handling and logging
- Works with Next.js 15 App Router middleware

Tested:
- ✅ Authenticated users access /admin
- ✅ Unauthenticated users redirected
- ✅ Expired tokens handled gracefully
- ✅ No console errors

Dependencies: firebase-admin@^12.0.0
```

### Protected Branches

**Enable branch protection on `main` and `develop`:**

**Settings:**
- ✅ Require pull request before merging
- ✅ Require status checks to pass
- ✅ Require conversation resolution before merging
- ❌ Allow force pushes (disabled)

**Benefits for solo developers:**
1. **Prevents catastrophic force-push mistakes**
2. **Forces PR review** (visual diff helps catch issues)
3. **Documents changes** via PR descriptions
4. **Easy rollback** (revert entire PR if needed)

---

## CI/CD Configuration

### GitHub Actions Triggers

**✅ DO:**
- Use `pull_request` trigger for all PR validation
- Use `push` trigger ONLY for production branches (main)
- Include workflow files in path filters to catch config changes
- Use specific event types: `[opened, synchronize, reopened]`

**❌ DON'T:**
- Add develop branch to `push` triggers (causes duplicate runs)
- Forget to add workflow files to path filters

**Example:**
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
    paths:
      - 'web/**'
      - 'package.json'
      - '.github/workflows/web-ci.yml'  # Include workflow itself
  push:
    branches: [main]  # Production only, NOT develop
    paths:
      - 'web/**'
      - 'package.json'
      - '.github/workflows/web-ci.yml'
```

### CI Build Order

**Critical: Install native modules BEFORE running build**

```yaml
- name: Install dependencies
  run: npm ci

- name: Install native modules for Linux
  run: |
    npm install --no-save lightningcss-linux-x64-gnu@1.30.2 @tailwindcss/oxide-linux-x64-gnu@4.1.16

- name: Lint
  run: npm --workspace=web run lint

- name: Typecheck
  run: npm --workspace=web run typecheck

- name: Build
  run: npm --workspace=web run build
```

---

## Firebase Patterns

### Firebase Admin SDK (Server-Side)

**✅ DO: Use Lazy Initialization**

Firebase Admin should initialize ONLY at runtime, not at module import time.

```typescript
// ❌ BAD: Eager initialization
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })
}
export const adminAuth = admin.auth() // ❌ Runs during build

// ✅ GOOD: Lazy initialization
function initializeAdminIfNeeded() {
  if (admin.apps.length > 0) return admin

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })
  return admin
}

function getAdminAuth() {
  return initializeAdminIfNeeded().auth()
}

export async function verifyIdToken(idToken: string) {
  return getAdminAuth().verifyIdToken(idToken) // ✅ Runs at request time
}
```

**Why:** Next.js imports API routes during build to analyze them. Environment variables may not be available during build, causing initialization failures.

### Firebase Client SDK (Browser-Side)

**✅ DO: Check for Browser Environment**

Firebase client should ONLY initialize in the browser, never on the server.

```typescript
// ✅ GOOD: Browser-only initialization
let app: ReturnType<typeof initializeApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

export { auth, googleProvider };
```

**❌ DON'T: Throw errors during SSR**

```typescript
// ❌ BAD: Blocks pre-rendering
if (typeof window === 'undefined') {
  throw new Error('Firebase Auth cannot be initialized on the server');
}
```

**Why:** Even with `'use client'` directive, Next.js pre-renders client components during build. Throwing errors breaks the build process.

### Client Component Usage

**Always check for undefined before using Firebase client:**

```typescript
'use client'

export default function LoginPage() {
  async function handleGoogleSignIn() {
    if (!auth || !googleProvider) {
      setError('Firebase not initialized');
      return;
    }

    const credential = await signInWithPopup(auth, googleProvider)
    // ...
  }
}
```

---

## Next.js Build Optimization

### Environment Variables

**Build-time vs Runtime:**

- `NEXT_PUBLIC_*` → Available in browser AND during build
- Regular env vars → Server-side only, NOT available during build

**For Firebase:**
- Client config: Use `NEXT_PUBLIC_FIREBASE_*`
- Admin config: Use `FIREBASE_*` (no public prefix)

**Critical Security Rule:**

```bash
# ✅ SAFE - Public Firebase client config (meant to be public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-project-id

# ✅ SAFE - Server-only Firebase Admin credentials
FIREBASE_PROJECT_ID=my-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@my-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE..."

# ❌ CATASTROPHIC - NEVER make private key public
NEXT_PUBLIC_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."  # SECURITY BREACH!
```

**What happens if you accidentally expose FIREBASE_PRIVATE_KEY:**
- Attacker can impersonate your server
- Can create/verify session cookies as your app
- Full Firebase Admin SDK privileges
- **IMMEDIATE ACTION REQUIRED:** Rotate service account keys

**Environment Variable Categories:**

| Variable | Scope | Exposed in Browser | Security Level |
|----------|-------|-------------------|----------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public | ✅ Yes | Low (Firebase Security Rules protect resources) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public | ✅ Yes | Low (publicly visible anyway) |
| `FIREBASE_PRIVATE_KEY` | Server | ❌ Never | **CRITICAL** (admin privileges) |
| `FIREBASE_CLIENT_EMAIL` | Server | ❌ Never | High (service account identity) |

**Best Practices:**
- Never commit `.env.local` files
- Use `.env.example` with placeholder values
- Document which vars are required in README
- Use GitHub Secrets for CI/CD
- Rotate secrets if ever exposed publicly

### Pre-rendering & SSR

**Client components are pre-rendered during build:**

Even with `'use client'`, Next.js:
1. Imports your component during build
2. Analyzes dependencies
3. Pre-renders initial HTML

**Solution:** Use conditional initialization based on `typeof window`

### API Routes

**API routes are analyzed during build:**

- Don't initialize external services at module level
- Use lazy initialization patterns
- Keep module imports side-effect free

---

## Native Modules & Dependencies

### Understanding Optional Dependencies

Some npm packages (Tailwind CSS v4, lightningcss) use **native Rust binaries** distributed as optional dependencies:

```json
{
  "optionalDependencies": {
    "lightningcss-linux-x64-gnu": "1.30.2",
    "@tailwindcss/oxide-linux-x64-gnu": "4.1.16"
  }
}
```

### Why npm ci May Not Install Them

Optional dependencies can fail silently during `npm ci` if:
- Network issues
- Platform misdetection
- npm bug: https://github.com/npm/cli/issues/4828

### Solution: Explicit Installation in CI

```yaml
- name: Install native modules for Linux
  run: |
    echo "Installing native binaries for Linux..."
    npm install --no-save lightningcss-linux-x64-gnu@1.30.2 @tailwindcss/oxide-linux-x64-gnu@4.1.16
```

**Key flags:**
- `--no-save`: Don't modify package.json/package-lock.json
- Pin exact versions to match main package

### When to Add New Native Modules

If you add dependencies that use native bindings:
1. Check `package.json` for `optionalDependencies`
2. Add Linux variant to CI workflow
3. Test build in CI before merging

**Common packages that need this:**
- `lightningcss` → `lightningcss-linux-x64-gnu`
- `@tailwindcss/oxide` → `@tailwindcss/oxide-linux-x64-gnu`
- `sharp` → Usually works, but watch for issues
- `esbuild` → Usually auto-installs correctly

---

## TypeScript Best Practices

### Handling Undefined Types

When using conditional initialization, types must reflect possibility of undefined:

```typescript
// ✅ GOOD: Explicit undefined handling
let auth: ReturnType<typeof getAuth> | undefined;

function useAuth() {
  if (!auth) {
    throw new Error('Auth not initialized');
  }
  return auth; // TypeScript knows it's defined here
}
```

### Null Checks in Client Components

```typescript
// ✅ Always check both auth and provider
if (!auth || !googleProvider) {
  setError('Firebase not initialized');
  return;
}

const credential = await signInWithPopup(auth, googleProvider);
```

### Type Safety for Environment Variables

```typescript
// ✅ GOOD: Explicit undefined handling
const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) {
  throw new Error('FIREBASE_PROJECT_ID is required');
}
```

---

## Git Workflow

### Commit Message Convention

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `fix`: Bug fixes
- `feat`: New features
- `refactor`: Code refactoring
- `ci`: CI/CD changes
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

**Scopes:**
- `ci`, `firebase`, `auth`, `build`, etc.

### When to Amend Commits

**✅ Safe to amend when:**
- Commit not yet pushed
- Only you are working on the branch
- Fixing issues in most recent commit

**❌ Never amend when:**
- Commit is already pushed to shared branch
- Other developers may have pulled
- Commit is in pull request being reviewed (unless you force push)

**Command:**
```bash
git commit --amend --no-edit  # Keep same message
git commit --amend  # Edit message
git push --force-with-lease  # Safe force push
```

---

## Testing & Validation

### Pre-Merge Checklist

Before merging any PR:

- [ ] All CI checks passing (green)
- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in development
- [ ] Environment variables documented
- [ ] Native dependencies identified and added to CI

### Local Testing

Test Firebase integration locally:

```bash
# 1. Ensure env vars are set
cp .env.example .env.local
# Edit .env.local with real values

# 2. Run dev server
npm run web:dev

# 3. Test auth flow
# - Visit /login
# - Sign in with Google
# - Verify redirect to /admin
# - Check browser cookies (mj_session)
# - Sign out
```

### CI Testing

When changing CI configuration:

```bash
# 1. Make changes to .github/workflows/web-ci.yml

# 2. Commit and push
git add .github/workflows/web-ci.yml
git commit -m "ci: update workflow configuration"
git push

# 3. Monitor CI
gh run watch  # If run ID known
gh run list --workflow=web-ci.yml --limit 1

# 4. View logs if failed
gh run view <run-id> --log-failed
```

### CI Authentication Testing Pattern

**Problem:** Playwright tests need authenticated sessions, but can't use real Google OAuth in CI.

**Solution:** Mint temporary ID tokens with Firebase Admin SDK.

#### Three-Step Token Minting Process

**Step 1: Create script to mint tokens (`web/scripts/ci-create-id-token.mjs`):**

```javascript
import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
})

// Create custom token for test user
const customToken = await admin.auth().createCustomToken('playwright-ci-user')

// Exchange for ID token via Firebase REST API
const resp = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
  {
    method: 'POST',
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  }
)

const { idToken } = await resp.json()
console.log(idToken) // CI captures this
```

**Step 2: GitHub Actions workflow captures token:**

```yaml
- name: Mint authentication token for Playwright
  id: mint_token
  run: |
    TOKEN=$(node web/scripts/ci-create-id-token.mjs)
    echo "token=$TOKEN" >> $GITHUB_OUTPUT
  env:
    FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    FIREBASE_CLIENT_EMAIL: ${{ secrets.FIREBASE_CLIENT_EMAIL }}
    FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}

- name: Run Playwright tests
  run: npm --workspace=web run test:e2e
  env:
    PLAYWRIGHT_AUTH_ID_TOKEN: ${{ steps.mint_token.outputs.token }}
```

**Step 3: Playwright uses token to create session:**

```typescript
// web/tests/auth-smoke.spec.ts
test('admin page requires authentication', async ({ page }) => {
  const idToken = process.env.PLAYWRIGHT_AUTH_ID_TOKEN

  // Exchange ID token for session cookie
  const resp = await fetch('http://localhost:3000/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })

  // Extract session cookie and use in tests
  // ...
})
```

**Why This Approach:**
- ✅ Fresh token per CI run (limited blast radius)
- ✅ Token expires in 1 hour (auto-cleanup)
- ✅ No long-lived secrets to manage
- ✅ Tests real authentication flow
- ✅ If private key rotated, minting still works

**Why NOT Hardcode Tokens:**
- ❌ Firebase ID tokens expire in 1 hour
- ❌ Creates another secret to manage
- ❌ Can't be revoked independently
- ❌ If leaked, longer exposure window

**Alternative:** Use Firebase Emulator in CI (no production credentials needed).

---

## Troubleshooting

### Common Build Errors

#### "Cannot find module '../lightningcss.linux-x64-gnu.node'"

**Cause:** Native module not installed
**Fix:** Add to CI workflow native module installation step

#### "Service account object must contain a string 'project_id' property"

**Cause:** Firebase Admin initializing during build
**Fix:** Use lazy initialization pattern (see Firebase Admin section)

#### "Firebase Auth cannot be initialized on the server. window is undefined"

**Cause:** Firebase client throwing error during SSR
**Fix:** Use conditional initialization with `typeof window !== 'undefined'`

#### "Argument of type 'X | undefined' is not assignable to parameter"

**Cause:** TypeScript type includes undefined but function doesn't accept it
**Fix:** Add null check before using the value

### Debug Commands

```bash
# Check CI status
gh run list --workflow=web-ci.yml --limit 5

# View specific run
gh run view <run-id>

# View only failures
gh run view <run-id> --log-failed

# Check PR status
gh pr checks <pr-number>

# Re-run failed jobs
gh run rerun <run-id> --failed

# Watch run progress (interactive)
gh run watch
```

---

## Security Notes

### Secrets Management

**Never commit:**
- `.env.local` files
- Service account JSON files
- API keys or tokens

**Always use GitHub Secrets for:**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- Any API keys or credentials

### Dependency Vulnerabilities

Regularly check and fix vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (when possible)
npm audit fix

# Check Dependabot alerts on GitHub
https://github.com/MoodyBones/meljonesai/security/dependabot
```

---

## Project-Specific Notes

### Workspace Structure

This is a monorepo with npm workspaces:

```
meljonesai/
├── web/              # Next.js app
├── sanity-studio/    # Sanity CMS
└── package.json      # Root workspace config
```

**Always use workspace flag for web commands in CI:**

```bash
npm --workspace=web run build
npm --workspace=web run lint
npm --workspace=web run typecheck
```

### Current Dependencies Requiring Native Modules

- `lightningcss@1.30.2` → `lightningcss-linux-x64-gnu@1.30.2`
- `@tailwindcss/oxide@4.1.16` → `@tailwindcss/oxide-linux-x64-gnu@4.1.16`

Update CI workflow if versions change.

---

## Documentation Best Practices

### Documentation as Leverage

**Core principle:** Write it once, reference it forever.

Documentation isn't overhead—it's a force multiplier that:
1. Reduces decision fatigue during execution
2. Improves AI pair programming accuracy
3. Preserves mental context for future you
4. Accelerates onboarding for collaborators

### Using Documentation with Copilot

**Maximize AI assistance by providing context:**

Instead of:
```
You: "Help me set up Firebase"
Copilot: "Sure, here's generic Firebase setup"
[5-10 min back-and-forth clarifying requirements]
```

Do this:
```
You: [Paste PROJECT CONTEXT from docs]
You: [Paste MILESTONE CONTEXT]
You: [Paste SPECIFIC TASK PROMPT]
Copilot: [Generates exact code needed, first try, complete with types]
[30 seconds, done]
```

**Time saved per task:** 5-10 minutes
**ROI:** Documentation creation time pays for itself in AI acceleration alone

### Key Documentation Files

**Reference these during development:**

1. **COPILOT_GUIDE_COMPLETE.md** - Copy task-specific prompts
2. **QUICKSTART.md** - Setup and onboarding
3. **GIT_STRATEGY.md** - Git workflow details
4. **MILESTONE_SUMMARY.md** - Track progress daily
5. **PROJECT_SPEC_REVISED.md** - Architecture reference
6. **ROADMAP_REVISED.md** - Milestone planning
7. **CHANGES.md** - Session history (update at EOD)

### Documentation Anti-Patterns

**❌ Don't:**
- Create docs that duplicate code comments
- Write documentation that gets stale immediately
- Document "what" instead of "why"
- Create 50-page documents no one reads

**✅ Do:**
- Document architectural decisions and rationale
- Keep docs concise and scannable
- Use examples and code snippets
- Link to external resources instead of duplicating them
- Update docs when you change related code

---

## End-of-Day Knowledge Routine

### EOD Documentation Requirements

**At the end of each work session, create THREE documents:**

#### 1. Recall Questions (`docs/learning-resources/questions/day_XXX_recall_questions.md`)

**Purpose:** Spaced repetition study guide
**Content:** 5-7 short-answer questions covering challenging concepts
**Format:** Q&A with detailed explanations
**Review schedule:** 24 hours, 3 days, 7 days

**Example question:**
```markdown
### Q1: Session Cookie Security

**Question:** Why did we choose httpOnly session cookies over localStorage tokens?
List THREE security benefits.

**Answer:**
1. XSS Attack Prevention (httpOnly)
   - httpOnly cookies cannot be accessed via JavaScript
   - Prevents malicious scripts from stealing tokens

2. CSRF Protection (SameSite)
   - SameSite=Strict prevents cross-origin requests
   - Protects against forged authentication attempts

3. Token Leakage Reduction
   - Not exposed in browser console or network tab
   - Not vulnerable to browser extension theft
```

#### 2. Technical Deep Dive (`docs/learning-resources/posts/day_XXX_linked_post_1.md`)

**Purpose:** Document major technical decisions
**Content:** 200-300 words explaining WHY you chose a specific approach
**Audience:** Future you, other developers

**Example topics:**
- "Why Turbopack over Webpack"
- "httpOnly Session Cookies vs Client Tokens"
- "Server-Side vs Edge Middleware for Auth"

**Structure:**
```markdown
# Technical Deep Dive: [Topic]

## The Problem
[What challenge did you face?]

## The Solution
[What approach did you take?]

## Why This Works
[Technical reasoning]

## Trade-offs
[What did you give up? What did you gain?]

## When to Use This
[Scenarios where this pattern applies]
```

#### 3. Product/UX Rationale (`docs/learning-resources/posts/day_XXX_linked_post_2.md`)

**Purpose:** Explain product and UX decisions
**Content:** 200-300 words on user-facing implications
**Audience:** Product managers, stakeholders, designers

**Example topics:**
- "Why Split Sanity into Separate Workspace"
- "Security-First Authentication UX"
- "Documentation-First Development ROI"

**Structure:**
```markdown
# Product Rationale: [Topic]

## The User Story
[What user need does this address?]

## What Users Experience
[Observable behavior changes]

## Hidden Product Value
[Benefits users don't see but receive]

## Metrics That Matter
[How to measure success]
```

### Why Spaced Repetition Matters

**Research shows:** We forget 50% of new information within 24 hours.

**Spaced repetition combats this:**
- **Day 1:** Create recall questions (encode knowledge)
- **Day 2:** Review answers (first reinforcement)
- **Day 4:** Review again (second reinforcement)
- **Day 8:** Final review (long-term encoding)

**Result:** 80-90% retention of complex technical concepts.

**Time investment:** 15-20 minutes per session to create docs
**Knowledge retained:** 6+ months vs. 2-3 days without documentation

### How to Use Learning Resources

**When returning to project after a break:**

1. Read `CHANGES.md` to see what you did last
2. Review recall questions from last 3 sessions
3. Refresh architecture understanding via technical posts
4. Check `MILESTONE_SUMMARY.md` for current tasks

**When onboarding collaborators:**

1. Point them to recall questions (fastest learning path)
2. Share technical posts for architecture decisions
3. Reference product posts for UX rationale

**When debugging issues:**

1. Search technical posts for relevant patterns
2. Review recall questions from related sessions
3. Check `CHANGES.md` for when code was written

---

## Questions?

When encountering issues:

1. Check this document first
2. Review recent commits for similar fixes
3. Check GitHub Actions logs
4. Search for error messages in issues/discussions
5. Consult Next.js, Firebase, or Tailwind documentation

## Maintenance

**Update this document when:**
- Adding new dependencies with native modules
- Changing CI/CD configuration
- Discovering new patterns or anti-patterns
- Fixing build issues not covered here
- Adding new Firebase features

Last updated: 2025-11-19
Version: 2.0 - Added project structure, development workflow, documentation practices, and EOD routine
