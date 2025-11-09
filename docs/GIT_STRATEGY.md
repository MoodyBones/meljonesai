# Git Branching Strategy
## MelJonesAI Project

**Version:** 1.0  
**Date:** 2025-11-09  
**Purpose:** Complete Git workflow for solo development with PR-based milestones

---

## TABLE OF CONTENTS

1. [Branch Structure](#branch-structure)
2. [Branch Naming Conventions](#branch-naming-conventions)
3. [Workflow by Phase](#workflow-by-phase)
4. [Commit Message Standards](#commit-message-standards)
5. [Pull Request Process](#pull-request-process)
6. [Branch Protection Rules](#branch-protection-rules)
7. [Daily Git Commands](#daily-git-commands)
8. [Troubleshooting](#troubleshooting)

---

## BRANCH STRUCTURE

### Main Branches

```
main (protected)
  ↑
  └── develop (integration branch)
        ↑
        ├── feature/m1-firebase-setup
        ├── feature/m2-n8n-workflow
        ├── feature/m3-sanity-schemas
        ├── feature/m4-admin-interface
        ├── feature/m5-content-generation
        └── feature/m6-testing-deployment
```

### Branch Purposes

| Branch | Purpose | Protection | Deployment |
|--------|---------|------------|------------|
| `main` | Production-ready code | ✅ Protected | ✅ Auto-deploy to Hostinger |
| `develop` | Integration branch | ⚠️ Light protection | ✅ Preview environment |
| `feature/*` | Milestone development | ❌ No protection | ❌ Local only |
| `hotfix/*` | Emergency fixes | ❌ No protection | ✅ Direct to main |
| `bugfix/*` | Non-urgent fixes | ❌ No protection | ✅ Via develop |

---

## BRANCH NAMING CONVENTIONS

### Feature Branches (Milestones)

```bash
feature/m[N]-[short-description]

Examples:
feature/m1-firebase-setup
feature/m2-n8n-workflow
feature/m3-sanity-schemas
feature/m4-admin-interface
feature/m5-content-generation
feature/m6-testing-deployment
```

**When to use:**
- All milestone work
- New features
- Major functionality additions

### Bug Fix Branches

```bash
bugfix/[issue-description]

Examples:
bugfix/fix-auth-redirect
bugfix/sanity-query-timeout
bugfix/form-validation-error
```

**When to use:**
- Non-critical bugs
- Found during development
- Can wait for normal PR process

### Hotfix Branches

```bash
hotfix/[urgent-issue]

Examples:
hotfix/broken-authentication
hotfix/env-vars-missing
hotfix/deployment-failure
```

**When to use:**
- Critical production issues
- Security vulnerabilities
- Site is down/broken

### Documentation Branches

```bash
docs/[what-youre-documenting]

Examples:
docs/update-readme
docs/add-api-documentation
docs/fix-setup-instructions
```

**When to use:**
- README updates
- Documentation improvements
- Comment additions

---

## WORKFLOW BY PHASE

### Phase 1: Initial Setup (One-Time)

```bash
# 1. Clone repository
cd ~/Work
git clone https://github.com/MoodyBones/meljonesai
cd meljonesai

# 2. Create develop branch (if doesn't exist)
git checkout -b develop
git push -u origin develop

# 3. Set up branch protection on GitHub
# Go to: Settings → Branches → Add rule
# See "Branch Protection Rules" section below

# 4. Configure git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config pull.rebase false  # Use merge strategy

# 5. Create .gitignore if not exists
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Next.js
.next/
out/
build/
dist/

# Sanity
sanity-studio/.sanity

# Testing
coverage/
.nyc_output

# Misc
.DS_Store
*.log
*.swp
*.swo
*~

# IDE
.vscode/
.idea/
*.sublime-*

# OS
Thumbs.db
EOF

git add .gitignore
git commit -m "chore: configure git ignore rules"
git push origin develop
```

### Phase 2: Starting a Milestone

```bash
# Always start from latest develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/m1-firebase-setup

# Push to remote (sets upstream)
git push -u origin feature/m1-firebase-setup

# Verify you're on correct branch
git branch --show-current
# Output: feature/m1-firebase-setup
```

### Phase 3: During Development

```bash
# Check what's changed
git status

# View diff before staging
git diff

# Stage specific files
git add web/src/lib/firebase/config.ts
git add web/src/lib/firebase/admin.ts

# Or stage all changes
git add .

# Commit with descriptive message
git commit -m "feat(m1): add Firebase client configuration

- Initialize Firebase app with env vars
- Singleton pattern to prevent multiple init
- Export auth instance
- TypeScript types from firebase/auth

Tested locally with Google Sign-In."

# Push to remote (backup work)
git push origin feature/m1-firebase-setup
```

**Commit Frequency Guidelines:**

```
✅ DO commit:
- After completing a logical unit of work
- Before switching tasks
- Before taking a break
- When tests pass
- At end of day

❌ DON'T commit:
- Broken code (unless WIP commit)
- Code with console.logs
- Code that doesn't compile
- Every single line change
```

### Phase 4: Completing a Milestone

```bash
# 1. Ensure all work committed
git status
# Output: nothing to commit, working tree clean

# 2. Push final changes
git push origin feature/m1-firebase-setup

# 3. Create Pull Request via GitHub CLI
gh pr create \
  --title "M1: Firebase Setup Complete ✅" \
  --body "## Milestone 1: Firebase Authentication Setup

### Tasks Completed
- ✅ Firebase client configuration (web/src/lib/firebase/config.ts)
- ✅ Firebase admin SDK (web/src/lib/firebase/admin.ts)
- ✅ Auth middleware (web/src/middleware.ts)
- ✅ Login page with Google Sign-In (web/src/app/login/page.tsx)
- ✅ Protected admin dashboard (web/src/app/admin/page.tsx)

### Testing
- ✅ Google Sign-In flow works
- ✅ Auth state persists on refresh
- ✅ /admin routes protected
- ✅ Unauthenticated users redirected
- ✅ No TypeScript errors
- ✅ No console errors

### Dependencies Added
- firebase@^10.7.1
- firebase-admin@^12.0.0

### Environment Variables Required
\`\`\`bash
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
\`\`\`

### Screenshots
[Add screenshots if helpful]

### Next Steps
- Merge to develop
- Start M2: n8n Workflow

### Breaking Changes
None

### Notes
- Firebase v10 modular SDK used
- Singleton pattern prevents multiple Firebase init
- Admin SDK used server-side only" \
  --base develop \
  --head feature/m1-firebase-setup

# 4. Or create PR via GitHub web interface
# Go to: https://github.com/MoodyBones/meljonesai/pulls
# Click "New Pull Request"
# Select: base: develop <- compare: feature/m1-firebase-setup
# Fill in title and description
# Click "Create Pull Request"

# 5. Review your own PR (solo dev)
# Check diff carefully
# Resolve any conversations
# Click "Merge Pull Request" → "Confirm merge"

# 6. Clean up after merge
git checkout develop
git pull origin develop
git branch -d feature/m1-firebase-setup
git push origin --delete feature/m1-firebase-setup

# 7. Verify milestone merged
git log --oneline --graph -5
```

### Phase 5: Emergency Hotfixes

```bash
# Critical bug in production? Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/broken-authentication

# Fix the issue
# ... edit files ...

# Commit with urgency marker
git add .
git commit -m "hotfix: fix broken Firebase authentication

CRITICAL: Google Sign-In was failing due to incorrect redirect URI.

- Updated NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- Fixed callback URL in Firebase Console
- Tested sign-in flow

Resolves: #42"

# Push hotfix
git push -u origin hotfix/broken-authentication

# Create PR directly to main (bypass develop for urgency)
gh pr create \
  --title "🚨 HOTFIX: Fix Broken Authentication" \
  --body "Critical production issue.
  
  Google Sign-In broken due to incorrect redirect URI.
  
  Changes:
  - Fixed env var
  - Updated Firebase Console config
  
  Tested and working." \
  --base main \
  --head hotfix/broken-authentication

# After merge to main, also merge back to develop
git checkout develop
git merge main
git push origin develop

# Delete hotfix branch
git branch -d hotfix/broken-authentication
git push origin --delete hotfix/broken-authentication
```

---

## COMMIT MESSAGE STANDARDS

### Format

```
[type]([milestone]): [subject]

[optional body]

[optional footer]
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(m1): add Firebase client config` |
| `fix` | Bug fix | `fix(m2): correct webhook validation` |
| `docs` | Documentation | `docs(m3): update schema comments` |
| `style` | Code formatting | `style(m4): format admin form` |
| `refactor` | Code refactoring | `refactor(m5): extract prompt builder` |
| `test` | Add tests | `test(m6): add API route tests` |
| `chore` | Build/dependencies | `chore: update Firebase to v10.8.0` |
| `hotfix` | Critical production fix | `hotfix: fix auth redirect loop` |

### Subject Line Rules

```
✅ DO:
- Use imperative mood ("add" not "added" or "adds")
- Start with lowercase
- No period at the end
- Max 72 characters
- Be specific

❌ DON'T:
- Use past tense ("added Firebase")
- Start with capital letter
- End with period
- Be vague ("updated stuff")
- Exceed 72 characters
```

### Examples of Good Commits

```bash
# Feature additions
git commit -m "feat(m1): add Firebase authentication middleware

Protects /admin routes with Firebase token verification.
Redirects unauthenticated users to /login page.

Uses Firebase Admin SDK for server-side token verification.
Implements proper error handling for expired tokens."

# Bug fixes
git commit -m "fix(m2): correct n8n webhook validation

Fixed issue where empty jobDescription was accepted.
Now properly trims and validates all required fields.

Throws descriptive error if validation fails."

# Refactoring
git commit -m "refactor(m4): extract form validation into util

Moved validation logic from form component to util/validation.ts
for reusability and testing.

No functional changes."

# Documentation
git commit -m "docs: update README with environment variables

Added complete list of required env vars for Firebase and Sanity.
Included example .env.local template."

# Chores
git commit -m "chore: upgrade Next.js to 15.0.3

Security patch and performance improvements.
Tested locally, no breaking changes."
```

### Examples of Bad Commits

```bash
❌ "Updated files"                           # Too vague
❌ "Added Firebase."                         # Ends with period
❌ "feat(m1): Added Firebase configuration"  # Past tense
❌ "WIP"                                     # Not descriptive
❌ "fix stuff"                               # Not specific
❌ "feat(m1): implemented the Firebase authentication system with Google Sign-In and protected routes including middleware and all necessary configuration files"  # Too long (>72 chars)
```

### Multi-Line Commit Messages

```bash
# Use for complex changes
git commit -m "feat(m2): implement complete n8n workflow

Workflow includes 11 nodes:
1. Webhook Trigger - receives application data
2. Validate Input - checks required fields
3. Company Research - minimal web scraping
4. Prepare Prompt - builds Gemini prompt
5. Gemini API Call - generates content
6. Parse Response - extracts JSON
7. Map to Sanity - transforms data
8. Create Draft - posts to Sanity
9. Send Notification - success webhook
10. Error Handler - catches failures
11. Response - returns to client

Each node has proper error handling.
Tested end-to-end with sample job description.

Environment variables required:
- GEMINI_API_KEY
- SANITY_PROJECT_ID
- SANITY_DATASET
- SANITY_TOKEN"
```

---

## PULL REQUEST PROCESS

### PR Template

```markdown
## Milestone [N]: [Name]

### Tasks Completed
- ✅ [Task 1 description]
- ✅ [Task 2 description]
- ✅ [Task 3 description]

### Testing
- ✅ [Test 1]
- ✅ [Test 2]
- ✅ [Test 3]

### Dependencies Added/Updated
- package@version

### Environment Variables
\`\`\`bash
NEW_VAR_NAME=description
\`\`\`

### Screenshots
[If applicable]

### Breaking Changes
[None/List any]

### Notes
[Any additional context]
```

### PR Review Checklist (Self-Review for Solo Dev)

```
Before clicking "Merge":

✅ Code Quality
  ✅ No console.log statements
  ✅ No commented-out code
  ✅ Meaningful variable names
  ✅ Proper TypeScript types (no 'any')
  ✅ Error handling in place

✅ Testing
  ✅ Tested locally
  ✅ No TypeScript errors
  ✅ No ESLint warnings
  ✅ Build succeeds (npm run build)
  ✅ All functionality works as expected

✅ Documentation
  ✅ Complex logic has comments
  ✅ README updated if needed
  ✅ CHANGES.md updated
  ✅ Environment variables documented

✅ Git Hygiene
  ✅ Commit messages follow convention
  ✅ No merge conflicts
  ✅ Branch up to date with base
  ✅ No secrets/env files committed

✅ Files
  ✅ Only relevant files changed
  ✅ No node_modules or build artifacts
  ✅ .gitignore properly configured
```

### Merging Strategy

**For feature → develop:**
```bash
# Use "Squash and merge" if lots of WIP commits
# Use "Merge commit" to preserve history
# Recommended: "Merge commit" for milestones

# After merge
git checkout develop
git pull origin develop
```

**For develop → main:**
```bash
# Use "Merge commit" to preserve milestone structure
# Tag release after merging
git checkout main
git pull origin main
git tag -a v1.0.0 -m "MVP Release - All 6 milestones complete"
git push origin v1.0.0
```

---

## BRANCH PROTECTION RULES

### Setup on GitHub

**Navigate to:** `Settings → Branches → Add rule`

### For `main` Branch

```
Branch name pattern: main

✅ Require a pull request before merging
   ✅ Require approvals: 1
   ✅ Dismiss stale pull request approvals when new commits are pushed
   ✅ Require review from Code Owners (optional, if CODEOWNERS file exists)

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Status checks (configure after setting up CI):
     - build
     - lint
     - test

✅ Require conversation resolution before merging

❌ Allow force pushes
   - Nobody (recommended)

❌ Allow deletions

Additional settings:
✅ Do not allow bypassing the above settings
✅ Restrict who can push to matching branches (optional: only you)
```

### For `develop` Branch

```
Branch name pattern: develop

✅ Require a pull request before merging
   ✅ Require approvals: 1 (can be self-approval)

✅ Require status checks to pass before merging
   Status checks:
     - build
     - lint

❌ Allow force pushes (keep disabled for safety)
```

### Why Branch Protection?

**Benefits for solo developer:**
1. **Prevents accidents** - Can't force push and lose work
2. **Enforces review** - Must look at diff before merging
3. **Quality gates** - Can't merge if build fails
4. **Documentation** - PR descriptions document changes
5. **History** - Clean, reviewable git history
6. **Best practices** - Professional workflow habits

---

## DAILY GIT COMMANDS

### Morning (Start of Day)

```bash
# Get latest changes
git checkout develop
git pull origin develop

# Continue existing work OR start new milestone
git checkout feature/m[N]-[name]
# or
git checkout -b feature/m[N]-[name]

# See what you were working on
git log --oneline -5
git status
```

### During Work (Every 30-60 min)

```bash
# Check status
git status

# Stage and commit
git add [files]
git commit -m "[type](m[N]): [description]"

# Push (backup)
git push origin [current-branch]
```

### Evening (End of Day)

```bash
# Commit all work
git add .
git commit -m "[type](m[N]): [description]

[detailed notes about what was done]"

# Push to remote
git push origin [current-branch]

# Update CHANGES.md
echo "## Session $(date +%Y-%m-%d)

- [what you worked on]
- [progress made]
- [next steps]" >> CHANGES.md

git add CHANGES.md
git commit -m "docs: update session progress"
git push origin [current-branch]
```

### When Switching Tasks

```bash
# Save current work (even if incomplete)
git add .
git commit -m "WIP(m[N]): [what you're in the middle of]

This is work in progress. Will complete in next session."
git push origin [current-branch]

# Switch to different task/branch
git checkout [other-branch]
```

### Common Operations

```bash
# See all branches
git branch -a

# See commit history
git log --oneline --graph --all -20

# See what changed in last commit
git show

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all uncommitted changes (CAREFUL!)
git reset --hard HEAD
git clean -fd

# See diff of unstaged changes
git diff

# See diff of staged changes
git diff --staged

# Temporarily save changes without committing
git stash
git stash pop  # restore later

# Delete local branch
git branch -d [branch-name]

# Delete remote branch
git push origin --delete [branch-name]
```

---

## TROUBLESHOOTING

### Problem: Merge Conflicts

```bash
# When pulling/merging shows conflicts

# 1. Open conflicted files in VS Code
# Look for:
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> branch-name

# 2. Edit to keep desired changes, remove conflict markers

# 3. Stage resolved files
git add [conflicted-files]

# 4. Complete merge
git commit -m "merge: resolve conflicts in [files]"

# 5. Push
git push origin [current-branch]
```

### Problem: Accidentally Committed to Wrong Branch

```bash
# If you committed to develop instead of feature branch

# 1. Copy the commit hash
git log --oneline -1
# Output: abc1234 feat(m1): my commit

# 2. Reset develop (undo commit, keep changes)
git reset --soft HEAD~1

# 3. Stash changes
git stash

# 4. Switch to correct branch
git checkout feature/m1-firebase-setup

# 5. Apply changes
git stash pop

# 6. Commit to correct branch
git add .
git commit -m "feat(m1): my commit"
git push origin feature/m1-firebase-setup
```

### Problem: Pushed Secrets to Git

```bash
# URGENT: Remove secrets immediately

# 1. Remove from file
vim [file-with-secrets]
# Delete the secret

# 2. Commit removal
git add [file]
git commit -m "security: remove exposed credentials"
git push origin [branch]

# 3. Rotate/regenerate the exposed secret
# - Firebase: regenerate API key
# - Gemini: regenerate API key
# - GitHub: regenerate token

# 4. Update .gitignore to prevent future exposure
echo "[file-with-secrets]" >> .gitignore
git add .gitignore
git commit -m "chore: add secrets to gitignore"
git push origin [branch]

# 5. If secret is in git history, use BFG Repo-Cleaner
# https://rtyley.github.io/bfg-repo-cleaner/
```

### Problem: Need to Update Commit Message

```bash
# If haven't pushed yet
git commit --amend -m "new commit message"

# If already pushed (creates new commit)
git revert HEAD
git commit -m "correct commit message"
git push origin [branch]
```

### Problem: Branch Out of Sync with Remote

```bash
# If git says "diverged"

# Option 1: Merge remote changes
git pull origin [branch]
# Resolve conflicts if any
git push origin [branch]

# Option 2: Rebase (cleaner history, but more complex)
git pull --rebase origin [branch]
git push origin [branch]

# Option 3: Force push (DANGEROUS, only if sure)
git push --force-with-lease origin [branch]
```

### Problem: Lost Work After Reset

```bash
# Git keeps a log of all actions

# 1. View reflog
git reflog

# 2. Find the commit you want to recover
# Output shows: abc1234 HEAD@{2}: commit: feat(m1): my work

# 3. Restore that commit
git checkout abc1234

# 4. Create a branch from there
git checkout -b recovery-branch

# 5. Merge back to your feature branch
git checkout feature/m1-firebase-setup
git merge recovery-branch
```

---

## GIT ALIASES (Optional Speed Boost)

```bash
# Add to ~/.gitconfig

[alias]
  # Status
  s = status -sb
  
  # Logs
  l = log --oneline --graph --all -20
  ll = log --graph --all --decorate --oneline
  
  # Branches
  b = branch
  ba = branch -a
  bd = branch -d
  
  # Commits
  c = commit -m
  ca = commit -am
  amend = commit --amend -m
  
  # Checkout
  co = checkout
  cob = checkout -b
  
  # Push/Pull
  p = push
  pf = push --force-with-lease
  pl = pull
  
  # Diff
  d = diff
  ds = diff --staged
  
  # Stash
  stash-all = stash save --include-untracked
  
  # Undo
  undo = reset --soft HEAD~1
  
  # Cleanup
  cleanup = "!git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d"

# Usage:
git s              # instead of git status -sb
git l              # instead of git log --oneline --graph --all -20
git cob feature/m1 # instead of git checkout -b feature/m1
```

---

## QUICK REFERENCE CARD

```bash
# Daily workflow
git checkout develop && git pull                    # Start of day
git checkout -b feature/m[N]-[name]                 # New milestone
git add [files] && git commit -m "[type](m[N]): "  # Commit work
git push origin [branch]                            # Backup
gh pr create --base develop                         # Create PR
git checkout develop && git pull                    # After merge

# Status & logs
git status                  # What's changed
git log --oneline -10       # Recent commits
git diff                    # Unstaged changes
git diff --staged           # Staged changes

# Branches
git branch                  # List local branches
git branch -a               # List all branches
git checkout [branch]       # Switch branch
git checkout -b [branch]    # Create and switch
git branch -d [branch]      # Delete local branch

# Undos
git reset --soft HEAD~1     # Undo last commit (keep changes)
git reset --hard HEAD       # Discard all changes (CAREFUL!)
git checkout -- [file]      # Discard changes in file
git stash                   # Temporarily save changes

# Remote
git push origin [branch]    # Push to remote
git pull origin [branch]    # Pull from remote
git fetch origin            # Get remote updates (don't merge)
```

---

**This Git strategy ensures clean, professional version control for your solo development workflow. Stick to it and your git history will be a beautiful timeline of progress!**

---

*Git Strategy v1.0 • Generated 2025-11-09 • MelJonesAI Project*
