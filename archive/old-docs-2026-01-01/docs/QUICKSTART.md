# MelJonesAI - Quickstart Guide

**Last Updated:** 2025-11-19
**Purpose:** Environment setup and daily development workflow

---

## 🎯 What You'll Set Up

- Next.js 15 web application
- Sanity CMS studio
- Firebase authentication
- Required environment variables
- Development servers

**Time Required:** 15-20 minutes

---

## ⚡ Setup (15-20 minutes)

### 1. Clone & Install

```bash
cd ~/Work
git clone https://github.com/MoodyBones/meljonesai
cd meljonesai

# Install dependencies
npm install

# Install workspace dependencies
cd web && npm install
cd ../sanity-studio && npm install
```

### 2. Configure Environment Variables

**Create `web/.env.local`:**

```bash
# Firebase (client-side - public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (server-side - PRIVATE)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_WRITE_TOKEN=your_write_token

# n8n Webhook
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-vps.com/webhook/generate
N8N_WEBHOOK_SECRET=your_secret_key

# Gemini AI
GEMINI_API_KEY=your_gemini_key
```

**⚠️ Security Warning:**
- NEVER commit `.env.local` files
- NEVER make `FIREBASE_PRIVATE_KEY` public
- See [.github/copilot-instructions.md](../.github/copilot-instructions.md) for security details

**Create `sanity-studio/.env.local`:**

```bash
SANITY_STUDIO_PROJECT_ID=your_sanity_project
SANITY_STUDIO_DATASET=production
```

### 3. Verify Installation

```bash
# Check web workspace
cd web
npm run typecheck  # Should pass
npm run lint       # Should pass

# Check Sanity
cd ../sanity-studio
# Sanity config should exist
```

### 4. Start Development Servers

```bash
# Terminal 1: Next.js web app
npm run web:dev
# → http://localhost:3000

# Terminal 2: Sanity Studio
npm run studio:dev
# → http://localhost:3333
```

**Verify:**
- Next.js loads without errors
- Sanity Studio accessible at :3333
- No TypeScript compilation errors

---

## 🚀 Daily Development Workflow

### 1. Start Development Servers

```bash
# Terminal 1: Next.js web app
npm run web:dev
# → http://localhost:3000

# Terminal 2: Sanity Studio
npm run studio:dev
# → http://localhost:3333
```

### 2. Make Changes

Follow the feature-branch workflow:

```bash
# Pull latest
git pull origin develop

# Create feature branch
git checkout -b feature/m2-n8n-workflow

# Make changes, commit with conventional commits
git add .
git commit -m "feat(m2): add n8n webhook endpoint"

# Push and create PR
git push -u origin feature/m2-n8n-workflow
gh pr create --base develop
```

**For complete Git workflow details**, see [.github/copilot-instructions.md](../.github/copilot-instructions.md).

### 3. Reference Documentation

While developing, keep these open:

- **[.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/)** - Task-specific Copilot prompts
- **[.github/copilot-instructions.md](../.github/copilot-instructions.md)** - Development guidelines
- **[docs/REFERENCE.md](./REFERENCE.md)** - Architecture and data models
- **[docs/CHANGES.md](./CHANGES.md)** - Session history

### 4. Before Committing

```bash
# Run checks before committing
npm --workspace=web run typecheck
npm --workspace=web run lint
npm --workspace=web run build  # Ensure build succeeds
```

### 5. End of Day

Update session history:

```bash
# Document what you accomplished
vim docs/CHANGES.md

# Create learning resources (if significant work done)
# See: .github/copilot-instructions.md - EOD Knowledge Routine
```

---

## 🛠️ Common Commands

### Web (Next.js)

```bash
cd web

# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server

# Quality checks
npm run typecheck    # TypeScript compilation
npm run lint         # ESLint
npm run lint:fix     # Auto-fix linting issues

# Testing
npm run test         # Run tests
npm run test:e2e     # Playwright E2E tests
```

### Sanity Studio

```bash
cd sanity-studio

npm run dev          # Start studio
npm run build        # Build studio
npm run deploy       # Deploy to Sanity hosting
```

### Git

```bash
# Daily workflow
git pull origin develop
git checkout -b feature/mX-name
git push -u origin feature/mX-name

# Commit with convention
git commit -m "feat(m2): add webhook endpoint"

# Create PR
gh pr create --base develop

# Merge and cleanup
git checkout develop
git pull
git branch -d feature/mX-name
```

**For complete Git workflow**, see [.github/copilot-instructions.md](../.github/copilot-instructions.md).

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run web:dev
```

### Missing Environment Variables

```bash
# Check what's loaded
node -e "console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)"

# Restart dev server after .env changes
# Kill server (Ctrl+C) and run npm run dev again
```

### TypeScript Errors

```bash
# Rebuild types
cd web
npm run build

# Check specific file
npx tsc --noEmit src/app/page.tsx
```

### Native Module Errors (CI)

If you see errors about `lightningcss` or `@tailwindcss/oxide`:

```bash
# Install platform-specific modules
npm install --no-save lightningcss-linux-x64-gnu@1.30.2
npm install --no-save @tailwindcss/oxide-linux-x64-gnu@4.1.16
```

See [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Native Modules section for details.

---

## 📚 Next Steps

1. **Review architecture:** [docs/REFERENCE.md](./REFERENCE.md)
2. **Start building:** Pick a milestone from [.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/)
3. **Reference guidelines:** [.github/copilot-instructions.md](../.github/copilot-instructions.md)
4. **Track progress:** Update [docs/CHANGES.md](./CHANGES.md)

---

**Last Updated:** 2025-11-19
**Version:** 3.0 (Streamlined, removed redundant Git details)
