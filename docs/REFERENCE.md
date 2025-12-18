# MelJonesAI Technical Reference

**Last Updated:** 2025-12-18
**Status:** Phase 1 MVP in progress

This document provides the technical architecture and milestone overview for MelJonesAI. For detailed task-specific instructions, see [.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/).

---

## Table of Contents

**Part 1: Architecture**
- [Strategic Overview](#strategic-overview)
- [Two-Phase Approach](#two-phase-approach)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Data Models](#data-models)

**Part 2: Milestones**
- [Phase 1: MVP](#phase-1-mvp)
- [Phase 2: Scale](#phase-2-scale)
- [Milestone Details](#milestone-details)

---

# Part 1: Architecture

## Strategic Overview

**What It Is:** A career storytelling platform that transforms job applications into personalised, portfolio-worthy pages. The system demonstrates craft under constraint, systems thinking applied to content, and good judgment in technical tradeoffs.

**Two Purposes:**
1. **Utility** — Generate polished application pages
2. **Portfolio** — Demonstrate design engineering skills

**Key Insight:** The schema is designed as a *thinking tool*. Research context fields (inputs) inform content fields (outputs). This works for both manual curation (Phase 1) and automated generation (Phase 2).

---

## Two-Phase Approach

### Phase 1: MVP (Current)

**Goal:** Ship one polished, publicly-accessible application page.

```
┌─────────────────────────────────────────────────────────────┐
│  YOU research the company and role                          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  SANITY STUDIO                                               │
│  - Fill research context (pain points, proof points, tone)  │
│  - Write/refine content fields                              │
│  - Link relevant projects                                   │
│  - Set status: draft → ready → published                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  NEXT.JS PUBLIC SITE                                         │
│  - SSG generates page at /[slug]                            │
│  - Polished, accessible, mobile-friendly                    │
│  - OG image for social sharing                              │
└─────────────────────────────────────────────────────────────┘
```

**What This Demonstrates:**
- Craft under constraint (one page, done well)
- Systems thinking (structured content architecture)
- Judgment (ship what's needed, not what's cool)

### Phase 2: Scale (Future)

**Goal:** Automate content generation for multiple applications.

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN INTERFACE (/admin)                                    │
│  - Firebase Auth Protected                                  │
│  - Submit: Job Description, Company, Role                   │
│  - Click "Generate Application"                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  n8n WORKFLOW (11 nodes)                                     │
│  1. Receive webhook data                                    │
│  2. Research company (HTTP requests)                        │
│  3. Generate content with Gemini 2.0 Flash                  │
│  4. Populate research context + content fields              │
│  5. Create Sanity draft (status: ai-generated)              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  YOU REVIEW IN SANITY STUDIO                                │
│  - Refine AI-generated content                              │
│  - Change status → in-review → ready → published            │
└─────────────────────────────────────────────────────────────┘
```

**The Same Schema Serves Both Phases:**
- Phase 1: You fill `researchContext` manually
- Phase 2: n8n/Gemini fills `researchContext`, you review

---

## Tech Stack

### Frontend (Next.js 15)
- **Framework:** Next.js 15 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Rendering:** SSG with `generateStaticParams()`

### Authentication
- **Service:** Firebase Authentication
- **Method:** Google OAuth (single whitelisted account)
- **Session:** httpOnly cookies (XSS/CSRF protection)

### Content Management
- **CMS:** Sanity v4 (headless)
- **Studio:** Separate workspace (sanity-studio/)
- **Content:** Job applications + Projects

### Automation (Phase 2)
- **Workflow:** n8n (self-hosted)
- **AI Model:** Gemini 2.0 Flash
- **Integration:** Webhook triggers, Sanity API

---

## Data Models

### Job Application Schema

```typescript
jobApplication {
  // === TARGET ROLE ===
  slug: slug                      // URL-friendly: "atlassian-senior-designer"
  targetCompany: string           // Required
  targetRoleTitle: string         // Required
  jobUrl: url                     // Original job posting

  // === RESEARCH CONTEXT (inputs - the thinking tool) ===
  researchContext: {
    companyPainPoints: string[]   // Challenges you can address
    roleKeywords: string[]        // Terms from JD to echo
    proofPoints: [{               // Your evidence
      claim: string
      evidence: text
      relevance: string           // Why relevant to this role
    }]
    companyResearch: text         // Culture, products, news
    toneAdjustments: enum         // formal | warm | bold | technical
  }

  // === CONTENT (outputs) ===
  customIntroduction: text        // 2-3 paragraphs, min 50 chars
  alignmentPoints: [{             // 2-4 items showing role fit
    heading: string
    body: text
  }]
  linkedProjects: reference[]     // Max 3 project references
  closingStatement: text          // Brief closing with CTA

  // === METADATA ===
  priority: enum                  // high | medium | low
  status: enum                    // See lifecycle below
  yourNotes: text                 // Private (not displayed)
  createdAt: datetime
  publishedAt: datetime
}
```

### Content Lifecycle

**Phase 1 (Manual):**
```
📝 draft        → Content being created/edited
👀 in-review    → Ready for review
✅ ready        → Approved, ready to publish
🌐 published    → Live on public site
📦 archived     → No longer active
```

**Phase 2 (Automated) adds:**
```
🤖 ai-generated → Fresh from automation, needs review
```

### Project Schema

```typescript
project {
  projectId: string              // P-01, P-02, etc. (required, unique)
  name: string                   // Required
  focus: string                  // Primary focus area
  keyMetric: text                // Main business impact
  description: text              // Detailed description
  technologies: string[]         // Tech stack
  year: string                   // Year completed
}
```

### Environment Variables

**Public (Browser + Build):**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
```

**Private (Server-Only):**
```bash
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY           # Never expose
SANITY_WRITE_TOKEN
```

**Phase 2 additions:**
```bash
NEXT_PUBLIC_N8N_WEBHOOK_URL
N8N_WEBHOOK_SECRET
GEMINI_API_KEY
```

---

# Part 2: Milestones

## Phase 1: MVP

| Milestone | Description | Status |
|-----------|-------------|--------|
| **M0** | Planning & Documentation | ✅ Complete |
| **M1** | Firebase Authentication | ✅ Complete |
| **M3** | Sanity Schemas + Content | 🎯 In Progress |
| **M6a** | MVP Deployment | Pending |

**Critical Path:** M1 → M3 → M6a

**Definition of Done:**
- [ ] Sanity schemas implemented
- [ ] One application with curated content
- [ ] Public page at `/[slug]`
- [ ] Lighthouse accessibility >= 90
- [ ] Works on mobile Safari
- [ ] OG image renders correctly
- [ ] Deployed to production

## Phase 2: Scale

| Milestone | Description | Status |
|-----------|-------------|--------|
| **M2** | n8n Workflow | Planned |
| **M4** | Admin Interface | Planned |
| **M5** | Content Generation Testing | Planned |
| **M6b** | Full Production Deployment | Planned |

**Critical Path:** M2 → M4 → M5 → M6b

---

## Milestone Details

### M1: Firebase Authentication ✅

**Completed:** 2025-11-17

**What Was Built:**
- Google OAuth sign-in
- httpOnly session cookies (XSS/CSRF protection)
- Server-side token verification
- Protected `/admin` routes
- Playwright smoke tests

**Files:**
- `web/src/lib/firebase/config.ts` - Client config
- `web/src/lib/firebase/admin.ts` - Server Admin SDK
- `web/src/app/login/page.tsx` - Sign-in page
- `web/src/app/admin/` - Protected admin area
- `web/src/middleware.ts` - Edge auth checks

**Details:** [.github/ISSUE_BODIES/M1-Firebase-Setup.md](../.github/ISSUE_BODIES/M1-Firebase-Setup.md)

---

### M3: Sanity Schemas 🎯

**Status:** In Progress
**Dependencies:** None

**Objective:** Define content models for job applications and projects.

**Key Deliverables:**
- `sanity-studio/schemaTypes/jobApplication.ts`
- `sanity-studio/schemaTypes/project.ts`
- `sanity-studio/schemaTypes/index.ts`
- Seed data: At least one curated application

**Schema Design Principles:**
1. Research context as *input fields* (thinking tool)
2. Content as *output fields* (what gets displayed)
3. Status lifecycle supports both manual and automated workflows
4. Validation ensures content quality

**Details:** [.github/ISSUE_BODIES/M3-Sanity-Schemas.md](../.github/ISSUE_BODIES/M3-Sanity-Schemas.md)

---

### M6a: MVP Deployment

**Status:** Pending
**Dependencies:** M3

**Objective:** Deploy one polished application page to production.

**Key Tasks:**
1. Build Next.js with SSG
2. Create public page component at `/[slug]/page.tsx`
3. Fetch and render Sanity content
4. Add OG image, meta tags
5. Deploy to Hostinger
6. Verify on real devices

**Success Criteria:**
- Page loads in < 2s
- Lighthouse accessibility >= 90
- Works on mobile Safari
- OG image renders when shared

---

### M2: n8n Workflow (Phase 2)

**Status:** Planned
**Dependencies:** M3 (schemas must exist)

**Objective:** Automate content generation.

**11-Node Workflow:**
1. Webhook Trigger
2. Input Validation
3. Company Research
4. Prepare Prompt
5. Gemini API Call
6. Parse Response
7. Map to Schema (including researchContext)
8. Create Sanity Draft
9. Send Notification
10. Error Handler
11. Response

**Details:** [.github/ISSUE_BODIES/M2-n8n-Workflow.md](../.github/ISSUE_BODIES/M2-n8n-Workflow.md)

---

### M4: Admin Interface (Phase 2)

**Status:** Planned
**Dependencies:** M1, M2, M3

**Objective:** Build admin UI for triggering automation.

**Routes:**
- `/admin` - Dashboard with application list
- `/admin/new` - Form to submit job descriptions
- `/api/trigger-workflow` - Calls n8n webhook

**Details:** [.github/ISSUE_BODIES/M4-Admin-Interface.md](../.github/ISSUE_BODIES/M4-Admin-Interface.md)

---

### M5: Content Generation Testing (Phase 2)

**Status:** Planned
**Dependencies:** M2, M4

**Objective:** Validate AI-generated content quality.

**Key Tasks:**
- Generate 3 sample applications
- Verify content is coherent and accurate
- Iterate on Gemini prompts
- Document prompt engineering decisions

**Details:** [.github/ISSUE_BODIES/M5-Content-Generation.md](../.github/ISSUE_BODIES/M5-Content-Generation.md)

---

### M6b: Full Production Deployment (Phase 2)

**Status:** Planned
**Dependencies:** M5

**Objective:** Deploy complete system with automation.

**Key Tasks:**
- n8n hosted and accessible
- Admin UI deployed
- E2E tests passing
- Documentation updated

**Details:** [.github/ISSUE_BODIES/M6-Testing-Deployment.md](../.github/ISSUE_BODIES/M6-Testing-Deployment.md)

---

## Milestone Dependencies

```
Phase 1 (MVP):
M0 (Planning) → M1 (Auth) → M3 (Schemas) → M6a (Deploy MVP)

Phase 2 (Scale):
M3 (Schemas) → M2 (n8n) → M4 (Admin UI) → M5 (Testing) → M6b (Full Deploy)
```

---

## Next Steps

**Immediate (Phase 1):**
1. Implement M3 schemas aligned with this spec
2. Enter content for one application
3. Build public page component
4. Deploy MVP

**Future (Phase 2):**
1. Set up n8n on Hostinger VPS
2. Build automation workflow
3. Create admin interface
4. Test and iterate

---

**Last Updated:** 2025-12-18
