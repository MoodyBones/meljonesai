# MelJonesAI Technical Reference

**Last Updated:** 2025-11-19
**Status:** M1 Complete ✅ | M2-M6 Pending

This document provides the technical architecture and milestone overview for MelJonesAI. For detailed task-specific instructions, see [.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/).

---

## Table of Contents

**Part 1: Architecture**
- [Executive Summary](#executive-summary)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Data Models](#data-models)

**Part 2: Milestones**
- [Milestone Overview](#milestone-overview)
- [M1: Firebase Authentication](#m1-firebase-authentication)
- [M2: n8n Workflow](#m2-n8n-workflow)
- [M3: Sanity Schemas](#m3-sanity-schemas)
- [M4: Admin Interface](#m4-admin-interface)
- [M5: Content Generation](#m5-content-generation)
- [M6: Testing & Deployment](#m6-testing--deployment)

---

# Part 1: Architecture

## Executive Summary

**What It Is:** An AI-powered application generation system where you submit job descriptions through a private admin interface, n8n automatically researches the company and generates personalized content via Gemini AI, creates a draft in Sanity for review, and publishes professional application pages to your public portfolio.

**Core Value Proposition:** Reduce application creation time from 2-4 hours to 5 minutes of form input + 2-3 minutes of review/editing.

**Key Innovation:** Automated company research + AI content generation + seamless CMS integration.

---

## System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│  YOU → Find job posting → Copy details                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  ADMIN INTERFACE (/admin)                                    │
│  - Firebase Auth Protected                                  │
│  - Submit: Job Description, Company, Role, Notes            │
│  - Click "Generate Application"                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  NEXT.JS API ROUTE (/api/generate)                          │
│  - Verify Firebase Auth                                     │
│  - Validate form data                                       │
│  - POST to n8n webhook                                      │
│  - Return Sanity draft link                                 │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  n8n WORKFLOW (Self-hosted on Hostinger VPS)                │
│                                                              │
│  1. Receive webhook data                                    │
│  2. Research company (HTTP requests, scraping)              │
│  3. Generate content with Gemini 2.0 Flash                  │
│     Input: Job desc + Company research + Portfolio          │
│     Output: Introduction, alignment bullets, projects       │
│  4. Create Sanity draft (status: "ai-generated")            │
│  5. Return success notification                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  SANITY CMS                                                  │
│  - Draft document created                                   │
│  - Status: "ai-generated"                                   │
│  - All fields populated by AI                               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  YOU REVIEW IN SANITY STUDIO                                │
│  - Edit/refine AI content                                   │
│  - Change status → "in-review" → "approved"                 │
│  - Click "Publish"                                          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  NEXT.JS PUBLIC SITE                                         │
│  - Detects new published document                           │
│  - Regenerates static page at /[slug]                       │
│  - Page goes live automatically                             │
│  - Recruiters can view application                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend (Next.js 15)
- **Framework:** Next.js 15 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (with @tailwindcss/oxide)
- **Bundler:** Turbopack (faster than Webpack)
- **Features:** React Compiler enabled for auto-optimization

### Authentication
- **Service:** Firebase Authentication
- **Method:** Google OAuth (single whitelisted account)
- **Session:** httpOnly cookies (XSS/CSRF protection)
- **Pattern:** Lazy initialization for build compatibility

### Content Management
- **CMS:** Sanity (headless)
- **Studio:** Separate workspace (sanity-studio/)
- **Deployment:** Hosted separately from Next.js app
- **Content:** Job applications + Project portfolio

### Automation
- **Workflow:** n8n (self-hosted on Hostinger VPS)
- **AI Model:** Google Gemini 2.0 Flash
- **Integration:** Webhook triggers, Sanity API

### Development Tools
- **Package Manager:** npm workspaces (monorepo)
- **Version Control:** Git (feature-branch workflow)
- **CI/CD:** GitHub Actions
- **Testing:** Playwright (E2E smoke tests)

---

## Data Models

### Job Application (Sanity Schema)

```typescript
jobApplication {
  // Identity
  slug: string                    // URL-friendly: "acme-corp-senior-cx-designer"
  targetCompany: string           // "Acme Corporation"
  targetRoleTitle: string         // "Senior CX Designer"

  // AI-Generated Content
  customIntroduction: text        // 2-3 paragraphs tailored to company
  cxDesignAlignment: array<text>  // 3-4 bullet points
  automationAndTechFit: array<text> // 3-4 bullet points
  closingStatement: text          // 2-3 sentences

  // References
  linkedProjects: array<reference> // Max 3 project IDs (P-01, P-02, etc.)

  // Metadata
  jobUrl: url                     // Original job posting link
  yourNotes: text                 // Private notes (not published)
  priority: 'high' | 'medium' | 'low'
  status: 'ai-generated' | 'in-review' | 'approved' | 'published' | 'archived'
  companyResearch: text           // AI-generated company insights
  createdAt: datetime
  publishedAt: datetime
}
```

### Project (Sanity Schema)

```typescript
project {
  projectId: string              // P-01, P-02, P-03, P-04, P-05
  name: string                   // "BerlinOnline Accessibility Overhaul"
  focus: string                  // "Product Strategy & User Research"
  keyMetric: text                // Main business impact
  description: text              // Detailed project description
  technologies: array<string>    // Tech stack used
  skillsApplied: array<string>   // Skills demonstrated
  url: url                       // Live demo or case study link
}
```

### Environment Variables

**Public (Browser + Build):**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_N8N_WEBHOOK_URL
```

**Private (Server-Only):**
```bash
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY           # ⚠️ CRITICAL - Never make public
SANITY_WRITE_TOKEN
GEMINI_API_KEY
N8N_WEBHOOK_SECRET
```

---

# Part 2: Milestones

## Milestone Overview

| Milestone | Description | Time | Status |
|-----------|-------------|------|--------|
| **M0** | Planning & Documentation | 6h | ✅ Complete |
| **M1** | Firebase Authentication | 1.5h | ✅ Complete |
| **M2** | n8n Workflow Setup | 2.5h | 🎯 Next |
| **M3** | Sanity Schemas + Projects | 1.5h | Pending |
| **M4** | Admin Interface | 1.5h | Pending |
| **M5** | Content Generation Testing | 45min | Pending |
| **M6** | Testing & Deployment | 15min | Pending |

**Total Estimated Time:** 8 hours (excludes planning)
**Critical Path:** M2 (n8n) → M3 (Sanity) → M4 (Admin UI)

---

## M1: Firebase Authentication

**Status:** ✅ Complete
**Time Spent:** 3 hours (including CI/CD fixes)
**Completed:** 2025-11-17

### What Was Built

**Authentication Flow:**
1. User visits `/login`
2. Signs in with Google OAuth
3. Client receives ID token (ephemeral)
4. Token exchanged for httpOnly session cookie (server-side)
5. Session cookie stored securely (HttpOnly, SameSite=Strict, Secure)
6. User redirected to `/admin`

**Files Created:**
- `web/src/lib/firebase/config.ts` - Client Firebase config (lazy init)
- `web/src/lib/firebase/admin.ts` - Server Firebase Admin SDK
- `web/src/app/login/page.tsx` - Google Sign-In page
- `web/src/app/admin/page.tsx` - Protected admin dashboard
- `web/src/app/admin/layout.tsx` - Server-side auth verification
- `web/src/app/api/auth/session/route.ts` - Session management API
- `web/src/middleware.ts` - Edge middleware for fast cookie checks

**Security Features:**
- ✅ httpOnly session cookies (XSS protection)
- ✅ SameSite=Strict (CSRF protection)
- ✅ Server-side token verification (Firebase Admin SDK)
- ✅ Layered security (Edge + Server Component verification)

**Testing:**
- ✅ Playwright smoke tests
- ✅ CI token minting script (`web/scripts/ci-create-id-token.mjs`)

### Key Learnings

- Firebase Admin SDK requires lazy initialization (not module-level)
- Firebase client must handle SSR gracefully (`typeof window !== 'undefined'`)
- CI needs native modules: `lightningcss-linux-x64-gnu`, `@tailwindcss/oxide-linux-x64-gnu`
- Session cookies are superior to localStorage for production security

**Detailed Task Prompts:** [.github/ISSUE_BODIES/M1-Firebase-Setup.md](../.github/ISSUE_BODIES/M1-Firebase-Setup.md)

---

## M2: n8n Workflow

**Status:** 🎯 Next Up
**Estimated Time:** 2.5 hours
**Priority:** HIGH (Critical Path)

### Objective

Build fully automated workflow that:
1. Receives webhook from Next.js admin form
2. Researches company (HTTP requests, basic scraping)
3. Generates tailored content via Gemini 2.0 Flash
4. Creates draft in Sanity CMS
5. Returns success notification

### Key Tasks

1. **n8n Installation** (Hostinger VPS)
   - Install n8n via Docker or npm
   - Configure environment variables
   - Set up SSL/HTTPS
   - Create webhook endpoint

2. **Workflow Nodes**
   - Webhook trigger (verify secret)
   - HTTP request (company website)
   - Gemini AI node (content generation)
   - Sanity mutation (create draft)
   - Response node (return success)

3. **Gemini Prompt Engineering**
   - Input: Job description + company research + portfolio
   - Output: Structured JSON matching Sanity schema
   - Fallback handling for API errors

4. **Testing**
   - Manual webhook trigger (Postman/curl)
   - End-to-end test (admin form → Sanity draft)
   - Error scenarios (invalid data, API failures)

**Detailed Task Prompts:** [.github/ISSUE_BODIES/M2-n8n-Workflow.md](../.github/ISSUE_BODIES/M2-n8n-Workflow.md)

---

## M3: Sanity Schemas

**Status:** Pending
**Estimated Time:** 1.5 hours
**Dependencies:** None (can start anytime)

### Objective

Define content models for job applications and projects in Sanity Studio.

### Key Tasks

1. **Job Application Schema** (`sanity-studio/schemas/jobApplication.ts`)
   - All fields from data model above
   - Validation rules (required fields, min/max)
   - Status workflow (ai-generated → in-review → approved → published)
   - Preview configuration

2. **Project Schema** (`sanity-studio/schemas/project.ts`)
   - Project ID format: P-01, P-02, etc.
   - Skills and technologies arrays
   - Rich text description field

3. **Seed Data**
   - Create 5 sample projects (P-01 to P-05)
   - Populate with real portfolio projects
   - Test references from job applications

**Detailed Task Prompts:** [.github/ISSUE_BODIES/M3-Sanity-Schemas.md](../.github/ISSUE_BODIES/M3-Sanity-Schemas.md)

---

## M4: Admin Interface

**Status:** Pending
**Estimated Time:** 1.5 hours
**Dependencies:** M1 (Auth), M2 (n8n), M3 (Sanity)

### Objective

Build admin UI for submitting job applications and triggering automation.

### Key Routes

**`/admin` - Dashboard**
- List all applications (table view)
- Filter by status
- Quick actions (edit, archive, delete)

**`/admin/new` - New Application Form**
- Job Description (textarea, required)
- Company Name (text, required)
- Role Title (text, required)
- Job URL (url, optional)
- Notes (textarea, optional)
- Priority (select: high/medium/low)
- Submit button → POST to `/api/generate`

**`/api/generate` - API Route**
- Verify Firebase auth token
- Validate form data
- POST to n8n webhook
- Return Sanity draft URL

### UI Components

- Form with Tailwind styling
- Loading states (spinner during generation)
- Success notification (link to Sanity Studio)
- Error handling (display error message, allow retry)

**Detailed Task Prompts:** [.github/ISSUE_BODIES/M4-Admin-Interface.md](../.github/ISSUE_BODIES/M4-Admin-Interface.md)

---

## M5: Content Generation

**Status:** Pending
**Estimated Time:** 45 minutes
**Dependencies:** M1-M4 (all previous milestones)

### Objective

Test complete end-to-end flow and verify AI-generated content quality.

### Key Tasks

1. **End-to-End Test**
   - Submit real job posting via admin form
   - Verify n8n workflow executes
   - Check Sanity draft created
   - Review AI-generated content quality

2. **Content Quality Check**
   - Introduction personalized to company
   - Alignment bullets relevant to role
   - Appropriate projects selected
   - Company research accurate

3. **Iteration**
   - Refine Gemini prompts if needed
   - Adjust content structure
   - Test edge cases (missing company website, etc.)

**Detailed Task Prompts:** [.github/ISSUE_BODIES/M5-Content-Generation.md](../.github/ISSUE_BODIES/M5-Content-Generation.md)

---

## M6: Testing & Deployment

**Status:** Pending
**Estimated Time:** 15 minutes
**Dependencies:** M5 (all features complete)

### Objective

Final smoke tests and deployment verification.

### Key Tasks

1. **Smoke Tests**
   - Auth flow (login, logout)
   - Admin form submission
   - n8n webhook triggers
   - Sanity draft creation
   - Public page rendering

2. **Production Checklist**
   - All environment variables in GitHub Secrets
   - CI/CD passing
   - No console errors
   - Mobile responsive
   - SEO meta tags

3. **Documentation**
   - Update CHANGES.md with final session
   - Create EOD learning resources
   - Final commit and push

**Detailed Task Prompts:** [.github/ISSUE_BODIES/M6-Testing-Deployment.md](../.github/ISSUE_BODIES/M6-Testing-Deployment.md)

---

## Milestone Dependencies

```
M0 (Planning)
  ↓
M1 (Firebase Auth) ──────────────────┐
  ↓                                   ↓
M2 (n8n Workflow) ←──→ M3 (Sanity) ──┤
  ↓                      ↓             ↓
  └──────────────────→ M4 (Admin UI) ──┤
                         ↓             ↓
                       M5 (Testing) ───┤
                         ↓             ↓
                       M6 (Deployment)
```

**Critical Path:** M1 → M2 → M4 → M5 → M6
**Parallelizable:** M3 can be done anytime after M0

---

## Next Steps

1. **Start M2:** n8n workflow setup (highest priority)
2. **Parallel M3:** Sanity schemas (can start now)
3. **After M2+M3:** Build admin UI (M4)
4. **Integration test:** M5
5. **Ship:** M6

**For detailed task-by-task instructions, see:**
- [.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/) - Copy-paste Copilot prompts
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Development guidelines

---

**Last Updated:** 2025-11-19
**Document Version:** 1.0 (Consolidated from PROJECT_SPEC_REVISED + ROADMAP_REVISED)
