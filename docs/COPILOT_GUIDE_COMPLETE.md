# GitHub Copilot Complete Integration Guide
## MelJonesAI Project - With Git Workflow

**Version:** 2.0  
**Date:** 2025-11-09  
**Purpose:** Complete reference for GitHub Copilot integration with Git branching strategy

---

## TABLE OF CONTENTS

1. [Project Context](#project-context)
2. [Git Branching Strategy](#git-branching-strategy)
3. [Milestone-Based Development Workflow](#milestone-based-workflow)
4. [Copilot Integration by Milestone](#copilot-integration)
5. [Prompt Templates](#prompt-templates)
6. [Testing & Quality Checklist](#testing-checklist)

---

## PROJECT CONTEXT

### What You're Building

**MelJonesAI** is an AI-powered job application generator that transforms generic job descriptions into personalized, metric-driven application pages.

**Core Value Proposition:** Full automation from admin form submission through AI content generation to published pages.

### Technical Stack

```
Frontend:  Next.js 15 (App Router, TypeScript, Tailwind CSS, React Compiler)
CMS:       Sanity Studio (draft/publish workflow)
Auth:      Firebase Auth (Google Sign-In, single admin user)
Automation: n8n (self-hosted on Hostinger)
AI:        Gemini 2.0 Flash API
Hosting:   Hostinger (VPS)
```

### Architecture Flow

```
Admin Form → Next.js API Route → n8n Webhook → 
  → Gemini API → Sanity Draft → Manual Review → 
  → Publish → Live Public Page
```

### Content Lifecycle States

1. **ai-generated** - Just created by AI, needs review
2. **in-review** - Being reviewed by human
3. **approved** - Approved but not yet published
4. **published** - Live on public site
5. **archived** - Deprecated/old applications

---

## GIT BRANCHING STRATEGY

### Branch Structure

```
main (protected)
  ↑
  ├── develop (integration branch)
  │     ↑
  │     ├── feature/m1-firebase-setup
  │     ├── feature/m2-n8n-workflow
  │     ├── feature/m3-sanity-schemas
  │     ├── feature/m4-admin-interface
  │     ├── feature/m5-content-generation
  │     └── feature/m6-testing-deployment
  │
  └── hotfix/[urgent-fix-name]
```

### Branch Naming Convention

```bash
# Feature branches (for milestones)
feature/m[N]-[short-description]
feature/m1-firebase-setup
feature/m2-n8n-workflow

# Bugfix branches
bugfix/fix-auth-redirect
bugfix/sanity-query-error

# Hotfix branches (production issues)
hotfix/broken-api-route
hotfix/env-vars-missing

# Documentation branches
docs/update-readme
docs/add-api-docs
```

### Git Workflow Per Milestone

#### Starting a New Milestone

```bash
# 1. Ensure you're on develop with latest changes
git checkout develop
git pull origin develop

# 2. Create feature branch for milestone
git checkout -b feature/m1-firebase-setup

# 3. Announce to Copilot (in VS Code)
# Open Copilot Chat (Cmd+I / Ctrl+I) and paste:
```

**Copilot Context for New Branch:**
```
I'm starting Milestone 1: Firebase Setup for MelJonesAI.

Current branch: feature/m1-firebase-setup
Base branch: develop

This milestone includes:
- Firebase client configuration
- Firebase admin SDK setup  
- Auth middleware
- Login page
- Protected /admin routes

Stack: Next.js 15, Firebase v10, TypeScript
Working in: web/src/lib/firebase/ and web/src/app/
```

#### During Development

```bash
# Make frequent, atomic commits
git add web/src/lib/firebase/config.ts
git commit -m "feat(m1): add Firebase client configuration

- Initialize Firebase app with env vars
- Export auth instance
- Singleton pattern to prevent multiple init
- TypeScript types from firebase/auth"

# Push regularly to backup work
git push origin feature/m1-firebase-setup
```

#### Commit Message Convention

Follow **Conventional Commits** with milestone prefix:

```bash
# Format
[type][(milestone)]: [subject]

[optional body]

[optional footer]

# Types
feat     - New feature
fix      - Bug fix
docs     - Documentation only
style    - Code style (formatting, no logic change)
refactor - Code refactoring
test     - Adding tests
chore    - Build process, dependencies

# Examples
feat(m1): add Firebase auth middleware

fix(m2): correct n8n webhook validation logic

docs(m3): add Sanity schema documentation

refactor(m4): extract admin form validation

test(m5): add Gemini API error handling tests

chore(m6): update deployment scripts
```

#### Completing a Milestone

```bash
# 1. Ensure all tasks committed
git status

# 2. Push final changes
git push origin feature/m1-firebase-setup

# 3. Create Pull Request to develop
# Via GitHub UI or CLI:
gh pr create \
  --title "Milestone 1: Firebase Setup Complete" \
  --body "Implements all M1 tasks:
  - ✅ Firebase client config
  - ✅ Firebase admin SDK
  - ✅ Auth middleware
  - ✅ Login page
  - ✅ Protected routes
  
  Testing: All auth flows work locally
  Dependencies: Added firebase@^10.0.0
  Breaking changes: None
  
  Ready for review and merge to develop." \
  --base develop \
  --head feature/m1-firebase-setup

# 4. After PR approved and merged
git checkout develop
git pull origin develop
git branch -d feature/m1-firebase-setup

# 5. Start next milestone
git checkout -b feature/m2-n8n-workflow
```

### Branch Protection Rules (Setup in GitHub)

**For `main` branch:**
```
✅ Require pull request before merging
✅ Require approvals: 1 (can be yourself for solo project)
✅ Dismiss stale PR approvals when new commits pushed
✅ Require status checks to pass before merging
   - ✅ build
   - ✅ lint (if configured)
✅ Require branches to be up to date before merging
✅ Require conversation resolution
❌ Do not allow force pushes
❌ Do not allow deletions
```

**For `develop` branch:**
```
✅ Require pull request before merging
✅ Require status checks (build, lint)
✅ Allow force pushes: NO
```

---

## MILESTONE-BASED WORKFLOW

### General Workflow for Each Milestone

```
1. CREATE BRANCH
   git checkout -b feature/m[N]-[name]

2. PASTE COPILOT CONTEXT
   [See prompt templates below]

3. DEVELOP WITH COPILOT
   - Copy task-specific prompts
   - Generate code
   - Test incrementally
   - Commit frequently

4. COMPLETE MILESTONE CHECKLIST
   [See milestone sections below]

5. CREATE PULL REQUEST
   - Descriptive title
   - Task checklist in description
   - Link to issues/docs
   - Request review (or self-review)

6. MERGE & CLEANUP
   - Merge PR to develop
   - Delete feature branch
   - Pull latest develop
   - Create next feature branch
```

---

## COPILOT INTEGRATION

### Starting Every Copilot Session

**Open Copilot Chat (Cmd+I / Ctrl+I) and paste this general context:**

```
PROJECT: MelJonesAI - AI Job Application Generator

ARCHITECTURE:
- Next.js 15 (App Router, TypeScript, Tailwind CSS, React Compiler, Turbopack)
- Sanity CMS (draft/published workflow, 5 content states)
- Firebase Auth (Google Sign-In, single admin user)
- n8n automation (11-node workflow on self-hosted Hostinger VPS)
- Gemini 2.0 Flash API (content generation)

MONOREPO STRUCTURE:
/web                  → Next.js frontend
  /src
    /app              → App Router pages
    /components       → React components
    /lib
      /firebase       → Auth config
      /sanity         → CMS client & queries
/sanity-studio        → Sanity Content Studio

CONTENT FLOW:
Admin Form → Next API → n8n → Gemini → Sanity Draft → Review → Publish → Public Page

CONTENT STATES:
ai-generated → in-review → approved → published → archived

CURRENT MILESTONE: M[N]
CURRENT BRANCH: feature/m[N]-[name]
CURRENT TASK: [describe what you're working on]

Help me implement: [specific task]
```

### Milestone 1: Firebase Setup

#### Branch Setup
```bash
git checkout -b feature/m1-firebase-setup
```

#### Copilot Context for M1
```
MILESTONE 1: Firebase Setup

TASKS:
1. Firebase client config (web/src/lib/firebase/config.ts)
2. Firebase admin config (web/src/lib/firebase/admin.ts)
3. Auth middleware (web/src/middleware.ts)
4. Login page (web/src/app/login/page.tsx)
5. Admin dashboard (web/src/app/admin/page.tsx)

REQUIREMENTS:
- Firebase SDK v10+ (modular)
- Environment variables with NEXT_PUBLIC_ for client
- Server-side admin SDK for token verification
- Google OAuth provider only
- Redirect authenticated users from /login to /admin
- Protect all /admin/* routes

TESTING CRITERIA:
✅ Can sign in with Google
✅ Auth state persists on refresh
✅ /admin routes protected
✅ Signed-out users redirected to /login
✅ No console errors

Current task: [paste task-specific prompt below]
```

#### Task-Specific Prompts for M1

**Task 1.1: Firebase Client Config**
```
Create web/src/lib/firebase/config.ts for Next.js 15 client-side Firebase.

Requirements:
- Firebase v10 modular SDK
- Read env vars: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, etc.
- Singleton pattern (prevent multiple Firebase app init)
- Export auth instance from getAuth()
- TypeScript with proper types
- Handle case where app already initialized

Complete file with all necessary imports.
```

**Task 1.2: Firebase Admin Config**
```
Create web/src/lib/firebase/admin.ts for server-side Firebase Admin SDK.

Requirements:
- Firebase Admin SDK
- Service account credentials from private env vars (NOT NEXT_PUBLIC_)
- Handle escaped newlines in FIREBASE_PRIVATE_KEY
- Export adminAuth from getAuth()
- Singleton pattern
- TypeScript with firebase-admin types

Use for token verification in API routes.
```

**Task 1.3: Auth Middleware**
```
Create web/src/middleware.ts to protect /admin routes in Next.js 15.

Requirements:
- Check Firebase auth token from cookie
- Verify token with Firebase Admin SDK
- If no token or invalid → redirect to /login
- If valid → allow access to /admin/*
- Export config to match /admin routes
- TypeScript

Use adminAuth from '@/lib/firebase/admin'
```

**Task 1.4: Login Page**
```
Create web/src/app/login/page.tsx - Google Sign-In page for Next.js 15.

Requirements:
- Client component ('use client')
- signInWithPopup with GoogleAuthProvider
- On success: save token to cookie, redirect to /admin
- On error: display error message
- Tailwind CSS (centered card design, clean UI)
- TypeScript
- If already authenticated, redirect to /admin immediately

Use auth from '@/lib/firebase/config'
Use useRouter from 'next/navigation'
```

**Task 1.5: Admin Dashboard**
```
Create web/src/app/admin/page.tsx - protected admin dashboard.

Requirements:
- Client component ('use client')
- Check auth state with onAuthStateChanged
- If not logged in → redirect to /login
- Display user email and name
- "New Application" button linking to /admin/new
- "Sign Out" button
- Tailwind CSS (professional dashboard layout)
- TypeScript

Use auth from '@/lib/firebase/config'
```

#### Git Workflow for M1

```bash
# After each task completion
git add [files]
git commit -m "feat(m1): [task description]"
git push origin feature/m1-firebase-setup

# After all M1 tasks complete
gh pr create --title "M1: Firebase Setup Complete" --base develop
```

### Milestone 2: n8n Workflow

#### Branch Setup
```bash
git checkout -b feature/m2-n8n-workflow
```

#### Copilot Context for M2

```
MILESTONE 2: n8n Workflow (11-node automation)

WORKFLOW NODES:
1. Webhook Trigger - Receive job application data
2. Validate Input - Check required fields
3. Company Research - Minimal web scraping
4. Prepare Prompt - Build Gemini API prompt
5. Gemini API Call - Generate content
6. Parse Response - Extract JSON from AI response
7. Map to Sanity - Transform to Sanity schema
8. Create Draft - Post to Sanity API
9. Send Notification - Success email/webhook
10. Error Handler - Catch and log errors
11. Response - Return success/error to client

ENVIRONMENT VARIABLES (n8n):
- GEMINI_API_KEY
- SANITY_PROJECT_ID
- SANITY_DATASET
- SANITY_TOKEN (write permission)

GEMINI PROMPT STRUCTURE:
- Job description
- Company info (from research)
- Skill matrix (Frontend, Product, AI/Automation)
- 5 project portfolio references
- Instructions for JSON output

Current task: [paste task-specific prompt below]
```

#### Task-Specific Prompts for M2

**Node 2: Validate Input**
```
Write n8n Function node code to validate webhook input.

Requirements:
- Access input via $input.item.json
- Check required fields: jobDescription, companyName, roleTitle
- Each must be non-empty after trimming
- Throw descriptive error if validation fails
- Return cleaned data with ISO timestamp
- TypeScript-style JavaScript

Return format: { json: { ...cleanedData, timestamp: '...' } }
```

**Node 3: Company Research**
```
Write n8n Function node to do minimal company research.

Requirements:
- Accept companyName from previous node
- Make HTTP request to company website (if provided)
- Extract: company tagline, industry, size (if available)
- If website fails, return minimal placeholder data
- Don't fail the workflow if research fails
- Return format: { json: { companyInfo: {...} } }

Use $input.item.json to access company name
JavaScript with try/catch for error handling
```

**Node 4: Prepare Gemini Prompt**
```
Write n8n Function node to build the Gemini API prompt.

Context:
- This generates personalized job application content
- Must return JSON only (no markdown)

Input data (from previous nodes):
- Job description
- Company name, role title
- Company research results

Include in prompt:
1. Job description
2. Company context
3. My skill matrix:
   - Frontend: Next.js, TypeScript, Tailwind, Performance
   - Product: User Research, A/B Testing, Funnel Optimization
   - AI/Automation: LLM APIs, n8n, Serverless

4. My 5 projects with metrics:
   - P-01: Pivot Platform (transformed zero returns to active engagement)
   - P-02: Future-Proof Foundation (saved 6+ months dev time)
   - P-03: Ops Autopilot (eliminated manual job matching)
   - P-04: Knowledge Transfer Engine (reduced onboarding from weeks to 20 min)
   - P-05: Career Stories Platform (0-to-1 AI-assisted full-stack)

5. Request JSON output with fields:
   - targetRoleTitle (specific, tailored)
   - customIntroduction (3 sentences, powerful hook)
   - cxDesignAlignment (3-4 bullets, link to projects)
   - automationAndTechFit (3-4 bullets, AI/Next.js skills)
   - closingStatement (1 sentence, forward-looking)

Return: { json: { prompt: "..." } }
JavaScript, access data via $node['Node Name'].json
```

**Node 5: Gemini API Call**
```
Configure n8n HTTP Request node to call Gemini API.

Method: POST
URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
Headers:
  Content-Type: application/json
Authentication: API Key in URL parameter
  ?key={{ $env.GEMINI_API_KEY }}

Body (JSON):
{
  "contents": [{
    "parts": [{
      "text": "{{ $json.prompt }}"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2000
  }
}

Return full response.
```

**Node 6: Parse Response**
```
Write n8n Function node to parse Gemini API response.

Requirements:
- Access Gemini response via $input.item.json
- Extract generated text from response.candidates[0].content.parts[0].text
- Parse JSON from text (Gemini sometimes wraps in ```json blocks)
- Remove markdown code fences if present
- Validate JSON has required fields
- Throw error if parsing fails
- Return parsed JSON

Return format: { json: { ...parsedContent } }
JavaScript with error handling
```

**Node 7: Map to Sanity**
```
Write n8n Function node to transform data for Sanity.

Requirements:
- Combine AI-generated content with original form data
- Create Sanity document structure:
  {
    _type: 'jobApplication',
    targetCompany: '...',
    targetRoleTitle: '...',
    customIntroduction: '...',
    cxDesignAlignment: [...],
    automationAndTechFit: [...],
    closingStatement: '...',
    jobUrl: '...',
    status: 'ai-generated',
    createdAt: ISO timestamp,
    yourNotes: 'Generated via n8n automation',
    priority: 'medium',
    slug: {
      _type: 'slug',
      current: generate-slug-from-company-and-role
    }
  }

- Generate URL-safe slug from company name + role
- Set initial status to 'ai-generated'
- Include companyResearch field
- Return format: { json: { sanityDocument: {...} } }

JavaScript, access data from multiple previous nodes
```

**Node 8: Create Sanity Draft**
```
Configure n8n HTTP Request node to create Sanity document.

Method: POST
URL: https://{{ $env.SANITY_PROJECT_ID }}.api.sanity.io/v2025-01-01/data/mutate/{{ $env.SANITY_DATASET }}
Headers:
  Content-Type: application/json
  Authorization: Bearer {{ $env.SANITY_TOKEN }}

Body (JSON):
{
  "mutations": [{
    "create": {{ $json.sanityDocument }}
  }]
}

Return Sanity API response.
```

#### Git Workflow for M2

```bash
# Save each node's code as you complete it
mkdir -p n8n-nodes
# Save node code to files for version control

git add n8n-nodes/
git commit -m "feat(m2): add n8n workflow nodes 1-4"
git push origin feature/m2-n8n-workflow

# After all nodes configured and tested
git commit -m "feat(m2): complete 11-node n8n workflow

- Webhook trigger with validation
- Minimal company research
- Gemini API integration
- Sanity draft creation
- Error handling and notifications

Tested end-to-end: form → AI → Sanity draft"

git push origin feature/m2-n8n-workflow
gh pr create --title "M2: n8n Workflow Complete" --base develop
```

### Milestone 3: Sanity Schemas

#### Branch Setup
```bash
git checkout -b feature/m3-sanity-schemas
```

#### Copilot Context for M3

```
MILESTONE 3: Sanity Schemas

SCHEMAS TO CREATE:
1. jobApplication (main document type)
2. project (portfolio projects)

LOCATION: sanity-studio/schemas/

SANITY VERSION: v3 (desk-tool structure)

CONTENT STATES: ai-generated, in-review, approved, published, archived

Current task: [paste task-specific prompt below]
```

#### Task-Specific Prompts for M3

**Schema: jobApplication**
```
Create sanity-studio/schemas/jobApplication.ts for Sanity v3.

Requirements:
- Document type 'jobApplication'
- Fields:
  - slug (type: slug, from: [targetCompany, targetRoleTitle])
  - targetCompany (string, required, description)
  - targetRoleTitle (string, required)
  - customIntroduction (text, required, rows: 4)
  - cxDesignAlignment (array of text objects)
  - automationAndTechFit (array of text objects)
  - closingStatement (text, required)
  - linkedProjects (array, references to 'project' type, max: 2)
  - jobUrl (url)
  - yourNotes (text, description: "Internal notes, not public")
  - priority (string, options: 'high', 'medium', 'low', default: 'medium')
  - status (string, options: 'ai-generated', 'in-review', 'approved', 'published', 'archived', default: 'ai-generated')
  - companyResearch (text, hidden when not needed)
  - createdAt (datetime, hidden, initial value: now)
  - publishedAt (datetime, hidden)

- Validation:
  - customIntroduction min 50 chars
  - cxDesignAlignment min 2 items
  - automationAndTechFit min 2 items
  
- Preview configuration: display targetCompany and targetRoleTitle

TypeScript, export default schema object
```

**Schema: project**
```
Create sanity-studio/schemas/project.ts for Sanity v3.

Requirements:
- Document type 'project'
- Fields:
  - name (string, required, e.g., "Pivot Platform")
  - projectId (string, unique, e.g., "P-01")
  - focus (string, e.g., "Product Strategy & User Research")
  - keyMetric (text, e.g., "Transformed near-zero user returns...")
  - technologies (array of strings)
  - year (string, e.g., "2023")
  - description (text)

- Preview: show name and projectId

TypeScript, export default schema object
```

**Schema Index File**
```
Create sanity-studio/schemas/index.ts to export all schemas.

Requirements:
- Import jobApplication and project schemas
- Export as array
- TypeScript

Format:
import jobApplication from './jobApplication'
import project from './project'

export const schemaTypes = [jobApplication, project]
```

#### Git Workflow for M3

```bash
git add sanity-studio/schemas/
git commit -m "feat(m3): add Sanity schemas for jobApplication and project"
git push origin feature/m3-sanity-schemas

gh pr create --title "M3: Sanity Schemas Complete" --base develop
```

### Milestone 4-6: [Similar structure for remaining milestones]

---

## TESTING CHECKLIST

### Pre-Commit Testing
```bash
✅ No TypeScript errors: npm run build
✅ No ESLint errors: npm run lint
✅ Code formatted: npm run format (if configured)
✅ Manual testing of new feature
✅ Check for console errors/warnings
```

### Pre-PR Testing
```bash
✅ All milestone tasks completed
✅ End-to-end flow works locally
✅ No broken links or 404s
✅ Mobile responsive (test in DevTools)
✅ Lighthouse score >85
✅ Firebase auth works
✅ Sanity CMS accessible
✅ n8n workflow executes successfully
✅ Environment variables documented
```

### Pre-Merge to Main Testing
```bash
✅ All tests pass in develop
✅ Production build succeeds
✅ Preview deployment works
✅ Performance metrics acceptable
✅ No security vulnerabilities: npm audit
✅ Dependencies up to date
✅ Documentation updated (README, CHANGES.md)
```

---

## QUALITY CHECKLIST

### Code Quality
```
✅ Meaningful variable/function names
✅ Comments for complex logic only
✅ No console.log statements in production code
✅ Error boundaries for React components
✅ Loading states for async operations
✅ Proper TypeScript types (no 'any')
✅ Consistent code style
✅ DRY principle (no duplication)
```

### Git Quality
```
✅ Commit messages follow convention
✅ Commits are atomic (one logical change)
✅ No secrets in commits
✅ .gitignore covers all env files
✅ Branch name matches convention
✅ PR description is detailed
✅ All conversations resolved before merge
```

### Documentation Quality
```
✅ README up to date
✅ CHANGES.md updated with session work
✅ API endpoints documented
✅ Environment variables listed in README
✅ Complex logic explained in comments
✅ Deployment instructions current
```

---

## TROUBLESHOOTING WITH COPILOT

### When Code Doesn't Work

**Template:**
```
I'm getting this error in [file path]:

[paste full error message]

Context:
- Milestone: M[N]
- Task: [describe task]
- What I tried: [what you did]
- Expected: [what should happen]
- Actual: [what's happening]

Code causing error:
[paste relevant code snippet]

Fix this.
```

### When Copilot Suggests Wrong Code

**Template:**
```
The code you suggested doesn't work because [reason].

Requirements reminder:
- Must use Next.js 15 App Router (not Pages Router)
- Must use TypeScript (not JavaScript)
- Must use modular Firebase SDK v10+ (not compat)

Please regenerate with correct imports and syntax.
```

### When You Need Refactoring

**Template:**
```
Refactor this code to be more [maintainable/performant/readable]:

[paste code]

Requirements:
- Maintain current functionality
- Improve [specific aspect]
- Add TypeScript types if missing
- Follow Next.js 15 best practices
```

---

## DAILY WORKFLOW SUMMARY

```bash
# 1. START OF DAY
git checkout develop
git pull origin develop
git checkout [current-feature-branch] || git checkout -b [new-feature-branch]

# 2. OPEN COPILOT
# Paste general project context + milestone context

# 3. WORK ON TASKS
# Copy task-specific prompts → Copilot generates → Test → Commit

# 4. FREQUENT COMMITS
git add [files]
git commit -m "[type](m[N]): [description]"
git push origin [feature-branch]

# 5. END OF MILESTONE
gh pr create --title "M[N]: [Milestone Name] Complete" --base develop
# Review → Merge → Delete branch

# 6. END OF DAY
# Update CHANGES.md
# Create EOD learning resources
# Push all changes
git push origin develop
```

---

**This guide is your complete reference for Copilot integration with Git workflow. Bookmark it and refer back as needed throughout development!**

---

*Version 2.0 • Generated 2025-11-09 • MelJonesAI Project*
