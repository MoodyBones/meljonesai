# Copilot Instructions & Guidelines

This document contains robust guidelines for maintaining and developing this project, based on lessons learned from debugging CI/CD issues and implementing Firebase authentication.

## Table of Contents
- [CI/CD Configuration](#cicd-configuration)
- [Firebase Patterns](#firebase-patterns)
- [Next.js Build Optimization](#nextjs-build-optimization)
- [Native Modules & Dependencies](#native-modules--dependencies)
- [TypeScript Best Practices](#typescript-best-practices)
- [Git Workflow](#git-workflow)
- [Testing & Validation](#testing--validation)

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

Last updated: 2025-11-18
