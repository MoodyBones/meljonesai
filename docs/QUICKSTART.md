# MelJonesAI - QUICKSTART GUIDE
## Get Started in 5 Minutes

**Version:** 2.0  
**Date:** 2025-11-09  
**Purpose:** Fast onboarding with Git workflow

---

## 🎯 OBJECTIVE

Build MelJonesAI MVP by EOD (8 hours): An AI-powered job application generator with full automation from admin form to published pages.

---

## ⚡ SETUP (15 minutes)

### 1. Clone & Install
```bash
cd ~/Work
git clone https://github.com/MoodyBones/meljonesai
cd meljonesai

# Install dependencies
npm install                    # Root (optional, for workspaces)
cd web && npm install          # Next.js app
cd ../sanity-studio && npm install  # Sanity Studio
```

### 2. Configure Environment Variables

**Create `web/.env.local`:**
```bash
# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key_here"
FIREBASE_CLIENT_EMAIL=your_client_email_here

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project
NEXT_PUBLIC_SANITY_DATASET=production

# n8n Webhook
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-vps.com/webhook/job-application

# Gemini API
GEMINI_API_KEY=your_gemini_key_here
```

**Create `sanity-studio/sanity.config.ts`:**
```typescript
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'MelJonesAI Content',
  projectId: 'YOUR_PROJECT_ID',
  dataset: 'production',
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
})
```

### 3. Setup Git Workflow

```bash
# Create develop branch if not exists
git checkout -b develop
git push -u origin develop

# Protect main branch on GitHub
# Settings → Branches → Add rule
# - Branch name pattern: main
# - ✅ Require pull request before merging
# - ✅ Require status checks to pass
# - ❌ Do not allow force pushes

# Start first milestone
git checkout -b feature/m1-firebase-setup
```

### 4. Start Development Servers

**Terminal 1 - Sanity Studio:**
```bash
cd ~/Work/meljonesai
npm run studio:dev
# Opens at http://localhost:3333
```

**Terminal 2 - Next.js App:**
```bash
cd ~/Work/meljonesai
npm run web:dev
# Opens at http://localhost:3000
```

### 5. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "MelJonesAI"
3. Enable Google Sign-In:
   - Authentication → Sign-in method → Google → Enable
4. Generate service account:
   - Project settings → Service accounts → Generate new private key
   - Copy credentials to .env.local

### 6. Configure n8n on Hostinger

1. SSH into VPS: `ssh user@your-vps.com`
2. Access n8n: `http://your-vps.com:5678`
3. Create new workflow: "Job Application Generator"
4. Get webhook URL from first node
5. Add to `web/.env.local`

---

## 🗺️ DEVELOPMENT ROADMAP

### Timeline: 8 Hours Total

```
M1: Firebase Setup           [1.5 hours] → feature/m1-firebase-setup
M2: n8n Workflow             [2 hours]   → feature/m2-n8n-workflow
M3: Sanity Schemas           [1 hour]    → feature/m3-sanity-schemas
M4: Admin Interface          [1.5 hours] → feature/m4-admin-interface
M5: Content Generation       [1 hour]    → feature/m5-content-generation
M6: Testing & Deployment     [1 hour]    → feature/m6-testing-deployment
```

---

## 🔄 GIT WORKFLOW CHEATSHEET

### Starting a Milestone

```bash
# Get latest develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/m[N]-[name]

# Example
git checkout -b feature/m1-firebase-setup
```

### During Development

```bash
# Make changes...

# Stage and commit (atomic commits)
git add [files]
git commit -m "feat(m1): add Firebase client configuration

- Initialize Firebase app
- Singleton pattern
- TypeScript types"

# Push regularly (backup work)
git push origin feature/m1-firebase-setup
```

### Completing a Milestone

```bash
# Final commit
git add .
git commit -m "feat(m1): complete Firebase setup

✅ Client config
✅ Admin SDK
✅ Auth middleware
✅ Login page
✅ Protected routes

Tested locally, all auth flows working."

# Push
git push origin feature/m1-firebase-setup

# Create Pull Request
gh pr create \
  --title "M1: Firebase Setup Complete" \
  --body "All tasks completed and tested locally." \
  --base develop \
  --head feature/m1-firebase-setup

# After PR merged
git checkout develop
git pull origin develop
git branch -d feature/m1-firebase-setup

# Start next milestone
git checkout -b feature/m2-n8n-workflow
```

### Commit Message Format

```bash
# Format: [type](milestone): [description]

feat(m1): add Firebase auth middleware
fix(m2): correct webhook validation logic
docs(m3): update schema documentation
refactor(m4): extract form validation
test(m5): add API error handling
chore(m6): update deployment config
```

---

## 🚀 MILESTONE WORKFLOWS

### M1: Firebase Setup

**Branch:** `feature/m1-firebase-setup`

**Tasks:**
1. ✅ Create `web/src/lib/firebase/config.ts` (client)
2. ✅ Create `web/src/lib/firebase/admin.ts` (server)
3. ✅ Create `web/src/middleware.ts` (auth protection)
4. ✅ Create `web/src/app/login/page.tsx`
5. ✅ Create `web/src/app/admin/page.tsx`

**Copilot Context:**
```
I'm starting M1: Firebase Setup for MelJonesAI.
Branch: feature/m1-firebase-setup
Stack: Next.js 15, Firebase v10, TypeScript
Working on: [current task]
```

**Git:**
```bash
# After each task
git add [files]
git commit -m "feat(m1): [task name]"

# At end
git push origin feature/m1-firebase-setup
gh pr create --title "M1: Firebase Setup Complete" --base develop
```

**Test:**
```bash
# Test auth flow
npm run web:dev
# Open http://localhost:3000/login
# Sign in with Google
# Should redirect to /admin
# Try accessing /admin/new without auth (should redirect to /login)
```

---

### M2: n8n Workflow

**Branch:** `feature/m2-n8n-workflow`

**Tasks:**
1. ✅ Node 1: Webhook Trigger
2. ✅ Node 2: Validate Input
3. ✅ Node 3: Company Research
4. ✅ Node 4: Prepare Gemini Prompt
5. ✅ Node 5: Call Gemini API
6. ✅ Node 6: Parse AI Response
7. ✅ Node 7: Map to Sanity Format
8. ✅ Node 8: Create Sanity Draft
9. ✅ Node 9: Send Notification
10. ✅ Node 10: Error Handler
11. ✅ Node 11: Return Response

**Save n8n Workflow:**
```bash
# Export workflow JSON from n8n
mkdir -p n8n-workflows
# Download workflow JSON
# Save as n8n-workflows/job-application-generator.json

git add n8n-workflows/
git commit -m "feat(m2): add n8n workflow configuration"
```

**Test:**
```bash
# Test webhook manually
curl -X POST https://your-vps.com/webhook/job-application \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "We need a senior frontend developer...",
    "companyName": "Atlassian",
    "roleTitle": "Senior Frontend Engineer"
  }'

# Check Sanity Studio for new draft
# Open http://localhost:3333
# Look for new jobApplication with status "ai-generated"
```

---

### M3: Sanity Schemas

**Branch:** `feature/m3-sanity-schemas`

**Tasks:**
1. ✅ Create `sanity-studio/schemas/jobApplication.ts`
2. ✅ Create `sanity-studio/schemas/project.ts`
3. ✅ Update `sanity-studio/schemas/index.ts`
4. ✅ Test schemas in Studio

**Test:**
```bash
# Restart Sanity Studio
cd sanity-studio
npm run dev

# Open http://localhost:3333
# Check for "Job Application" and "Project" document types
# Create test documents
```

---

### M4: Admin Interface

**Branch:** `feature/m4-admin-interface`

**Tasks:**
1. ✅ Create `web/src/app/admin/new/page.tsx` (form)
2. ✅ Create `web/src/app/api/trigger-workflow/route.ts`
3. ✅ Add form validation
4. ✅ Add loading/success states

**Test:**
```bash
npm run web:dev
# Open http://localhost:3000/admin/new
# Fill out form
# Submit
# Check n8n execution log
# Check Sanity for new draft
```

---

### M5: Content Generation

**Branch:** `feature/m5-content-generation`

**Tasks:**
1. ✅ Test Gemini API integration
2. ✅ Refine prompts for better output
3. ✅ Add error handling
4. ✅ Create 2-3 sample applications

**Test:**
```bash
# Submit 3 different job descriptions
# Review AI-generated content in Sanity
# Manually edit if needed
# Publish one application
# View at http://localhost:3000/[slug]
```

---

### M6: Testing & Deployment

**Branch:** `feature/m6-testing-deployment`

**Tasks:**
1. ✅ End-to-end testing
2. ✅ Production build
3. ✅ Deploy to Hostinger
4. ✅ Update documentation

**Test:**
```bash
# Build production
cd web
npm run build

# Test production build locally
npm run start

# Check all pages work
# Check Lighthouse scores
# Deploy to Hostinger
```

---

## 📝 DAILY WORKFLOW

### Morning Routine (5 min)
```bash
# Pull latest changes
git checkout develop
git pull origin develop

# Check current milestone
cat MILESTONE_SUMMARY.md

# Start/continue feature branch
git checkout feature/m[N]-[name] || git checkout -b feature/m[N]-[name]

# Open Copilot, paste project context
# Open task-specific documentation
```

### During Development
```bash
# Work on task
# Test frequently
# Commit often (atomic commits)
git add [files]
git commit -m "[type](m[N]): [description]"
git push origin [feature-branch]
```

### Evening Routine (30 min)
```bash
# Complete current task
# Commit and push

# Update CHANGES.md
# Create EOD learning resources (if milestone complete)

# Push all changes
git add .
git commit -m "docs: update session progress"
git push origin [feature-branch]

# If milestone complete, create PR
gh pr create --title "M[N]: [Name] Complete" --base develop
```

---

## 🎯 COPILOT INTEGRATION

### Every Session Start
1. Open VS Code
2. Open Copilot Chat (Cmd/Ctrl + I)
3. Paste general project context
4. Paste current milestone context

### For Each Task
1. Copy task-specific prompt
2. Paste to Copilot
3. Review generated code
4. Test locally
5. Commit if working

### When Stuck
```
I'm getting this error: [paste error]

Context:
- File: [path]
- Task: [description]
- Expected: [what should happen]
- Actual: [what's happening]

Code: [paste snippet]

Fix this for Next.js 15 App Router with TypeScript.
```

---

## ✅ PROGRESS TRACKING

### Check Current Status
```bash
# View milestone summary
cat MILESTONE_SUMMARY.md

# Check git status
git status

# View commit history
git log --oneline --graph --all
```

### Update Progress
```bash
# After completing task
# Update MILESTONE_SUMMARY.md
# Mark task as complete with ✅

# After completing milestone
# Update CHANGES.md
# Create EOD learning resources
# Create PR to develop
```

---

## 🚨 TROUBLESHOOTING

### Servers Won't Start
```bash
# Check ports
lsof -iTCP:3000 -sTCP:LISTEN
lsof -iTCP:3333 -sTCP:LISTEN

# Kill if needed
kill -9 [PID]

# Restart
npm run web:dev
npm run studio:dev
```

### Firebase Auth Not Working
```bash
# Check .env.local has correct values
# Check Firebase console for enabled auth methods
# Check network tab for 401 errors
# Verify NEXT_PUBLIC_ prefix for client vars
```

### Sanity Data Not Showing
```bash
# Check .env.local has correct project ID
# Check Sanity Studio has documents
# Check GROQ query syntax
# Test query in Sanity Vision tool
```

### n8n Workflow Failing
```bash
# Check n8n execution log
# Check webhook URL is correct
# Check environment variables in n8n
# Test each node individually
# Check Gemini API key is valid
```

---

## 📚 KEY DOCUMENTS

- **[COPILOT_GUIDE_COMPLETE.md](./COPILOT_GUIDE_COMPLETE.md)** - Full Copilot reference with prompts
- **[MILESTONE_SUMMARY.md](./MILESTONE_SUMMARY.md)** - Progress tracking
- **[GIT_STRATEGY.md](./GIT_STRATEGY.md)** - Detailed Git workflow
- **[CHANGES.md](./CHANGES.md)** - Session history

---

## 🎉 DEFINITION OF DONE

MVP is complete when:

```
✅ All 6 milestones merged to develop
✅ End-to-end flow works (form → AI → Sanity → page)
✅ 2-3 sample applications published
✅ Firebase auth protects /admin routes
✅ n8n workflow executes successfully
✅ Gemini API generates quality content
✅ Public pages render correctly
✅ Mobile responsive
✅ Production build succeeds
✅ Deployed to Hostinger
✅ Lighthouse score >85
✅ Documentation complete
✅ All tests passing
```

---

## 🚀 LET'S GO!

```bash
# Start now
cd ~/Work/meljonesai
git checkout -b feature/m1-firebase-setup
npm run studio:dev &  # Terminal 1
npm run web:dev &     # Terminal 2

# Open Copilot, copy M1 context from COPILOT_GUIDE_COMPLETE.md
# Start building!
```

**You've got this! 8 hours to MVP. Let's ship! 💪**

---

*QUICKSTART v2.0 • Generated 2025-11-09 • MelJonesAI Project*
