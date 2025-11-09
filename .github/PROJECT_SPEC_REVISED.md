# MelJonesAI - REVISED Project Specification

**Generated:** 2025-11-09 (CORRECTED VERSION)  
**Target Completion:** EOD 2025-11-09  
**Repository:** https://github.com/MoodyBones/meljonesai

---

## ⚠️ CRITICAL CORRECTION

**PREVIOUS UNDERSTANDING WAS WRONG:**
- ❌ I incorrectly suggested deferring n8n automation to Phase 2
- ❌ I misunderstood the core value proposition

**ACTUAL PROJECT:**
- ✅ n8n automation is CORE to MVP, not optional
- ✅ Admin interface is separate from public site
- ✅ Full automation pipeline must work EOD

---

## EXECUTIVE SUMMARY

**What It Is:** An AI-powered application generation system where you submit job descriptions through a private admin interface, n8n automatically researches the company and generates personalized content via Gemini AI, creates a draft in Sanity for your review, and publishes professional application pages to your public portfolio.

**Core Value Proposition:** Reduce application creation time from 2-4 hours to 5 minutes of form input + 2-3 minutes of review/editing.

**Key Innovation:** Automated company research + AI content generation + seamless CMS integration.

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│  YOU (Job Seeker)                                           │
│  ↓                                                           │
│  Find job posting → Copy details                            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  ADMIN INTERFACE - /admin (Firebase Auth Protected)         │
│                                                              │
│  Form Fields:                                               │
│  • Job Description (full text) *                            │
│  • Company Name *                                           │
│  • Role Title *                                             │
│  • Job URL (for reference)                                  │
│  • Your Notes/Thoughts                                      │
│  • Priority (high/medium/low)                               │
│                                                              │
│  [Generate Application Button]                              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  NEXT.JS API ROUTE - /api/generate                          │
│                                                              │
│  Security:                                                  │
│  • Verify Firebase Auth token                              │
│  • Validate form data                                       │
│  • Rate limiting (prevent abuse)                            │
│  • Log request                                              │
│                                                              │
│  Action:                                                    │
│  • POST to n8n webhook on Hostinger                         │
│  • Return immediate response to user                        │
│  • Provide link to Sanity Studio draft                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  n8n WORKFLOW - Self-hosted on Hostinger VPS                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. WEBHOOK TRIGGER                                   │  │
│  │    • Receive job data from API                       │  │
│  │    • Verify webhook secret                           │  │
│  │    • Parse JSON payload                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                     ↓                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 2. COMPANY RESEARCH (Minimal for MVP)                │  │
│  │    • HTTP Request to company website                 │  │
│  │    • Extract: mission, values, about info            │  │
│  │    • LinkedIn API or scrape (if possible)            │  │
│  │    • Store research data in variables                │  │
│  └──────────────────────────────────────────────────────┘  │
│                     ↓                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 3. AI CONTENT GENERATION (Gemini 2.0 Flash)         │  │
│  │    Input to Gemini:                                  │  │
│  │    • Job description                                 │  │
│  │    • Company research data                           │  │
│  │    • Copilot instructions (skill matrix)            │  │
│  │    • Project portfolio (P-01 to P-05)               │  │
│  │                                                      │  │
│  │    Gemini generates:                                 │  │
│  │    • targetRoleTitle                                 │  │
│  │    • customIntroduction                              │  │
│  │    • cxDesignAlignment (3-4 bullets)                 │  │
│  │    • automationAndTechFit (3-4 bullets)              │  │
│  │    • closingStatement                                │  │
│  │    • selectedProjects (array of IDs)                 │  │
│  │    • companyInsights (research summary)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                     ↓                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 4. CREATE SANITY DRAFT DOCUMENT                      │  │
│  │    • Generate slug from company + role               │  │
│  │    • Create jobApplication document                  │  │
│  │    • Set status = "ai-generated"                     │  │
│  │    • Mark as DRAFT (not published)                   │  │
│  │    • Link to relevant projects                       │  │
│  │    • Store company research                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                     ↓                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 5. NOTIFICATION                                      │  │
│  │    • Return success to API route                     │  │
│  │    • Include Sanity Studio URL                       │  │
│  │    • Optional: Send email notification               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  SANITY CMS                                                  │
│                                                              │
│  Draft Document Created:                                    │
│  • Status: "ai-generated"                                   │
│  • All fields populated by AI                               │
│  • Ready for your review                                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  YOU REVIEW IN SANITY STUDIO                                │
│                                                              │
│  Actions:                                                   │
│  • Read AI-generated content                                │
│  • Edit/refine as needed                                    │
│  • Change status to "in-review"                             │
│  • When satisfied → status = "approved"                     │
│  • Click "Publish" button                                   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  NEXT.JS PUBLIC SITE - Automatic Revalidation               │
│                                                              │
│  • Next.js detects new published document                   │
│  • Regenerates static page at /[slug]                       │
│  • Page goes live automatically                             │
│  • Recruiters can view your application                     │
└─────────────────────────────────────────────────────────────┘
```

---

## DETAILED TECHNICAL SPECIFICATION

### 1. ADMIN INTERFACE

**Location:** `web/src/app/admin/`

**Authentication:** Firebase Auth (Google Sign-In only)
- Only your Google account whitelisted
- All /admin routes protected
- Token validation on API routes

**Routes:**

```typescript
/admin                    → Dashboard (list all applications)
/admin/new               → New application form
/admin/applications      → Manage existing applications
/admin/settings          → Configuration (API keys, etc.)
```

**New Application Form Fields:**

```typescript
interface NewApplicationForm {
  jobDescription: string      // Required, textarea, 100-10000 chars
  companyName: string         // Required, text, 2-100 chars
  roleTitle: string           // Required, text, 2-200 chars
  jobUrl: string             // Optional, URL validation
  notes: string              // Optional, textarea
  priority: 'high' | 'medium' | 'low'  // Required, select
}
```

**Form Behavior:**
- Real-time validation
- Character counters
- Submit button shows loading state
- On success: Redirect to Sanity Studio draft
- On error: Show error message, allow retry

---

### 2. API LAYER

**Location:** `web/src/app/api/generate/route.ts`

**Security:**
```typescript
// Middleware checks:
1. Firebase Auth token verification
2. Request rate limiting (10 per hour)
3. Input validation (Zod schema)
4. Webhook secret verification

// Headers required:
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Request/Response:**

```typescript
// POST /api/generate
Request {
  jobDescription: string
  companyName: string
  roleTitle: string
  jobUrl?: string
  notes?: string
  priority: 'high' | 'medium' | 'low'
}

Response {
  success: true
  message: "Application draft created"
  sanityDraftUrl: "https://meljonesai.sanity.studio/desk/jobApplication;draft-abc123"
  estimatedTime: "Processing complete"
}

Error Response {
  success: false
  error: "Error message"
  code: "VALIDATION_ERROR" | "N8N_ERROR" | "RATE_LIMIT"
}
```

**Implementation Details:**
- Uses `fetch()` to call n8n webhook
- 60-second timeout
- Retry logic (2 attempts)
- Logging to console/file
- Returns immediately (async processing)

---

### 3. n8n WORKFLOW

**Webhook URL:** `https://your-hostinger-vps.com/webhook/generate-application`

**Nodes Structure:**

```
1. Webhook Trigger
   ↓
2. Validate Input (Function node)
   ↓
3. Company Research (HTTP Requests)
   ↓
4. Prepare Gemini Prompt (Function node)
   ↓
5. Gemini API Call (HTTP Request)
   ↓
6. Parse AI Response (Function node)
   ↓
7. Generate Slug (Function node)
   ↓
8. Create Sanity Document (HTTP Request)
   ↓
9. Response (Return success)
```

**Node 1: Webhook Trigger**
```json
{
  "method": "POST",
  "path": "generate-application",
  "authentication": "headerAuth",
  "responseMode": "lastNode"
}
```

**Node 2: Validate Input**
```javascript
// Function node
const data = $input.item.json;
const required = ['jobDescription', 'companyName', 'roleTitle'];

for (const field of required) {
  if (!data[field]) {
    throw new Error(`Missing required field: ${field}`);
  }
}

return { json: data };
```

**Node 3: Company Research**
```
HTTP Request 1: Fetch company website
  URL: {{ $json.companyWebsite }}
  Method: GET
  Extract: meta description, about page content

HTTP Request 2: LinkedIn (if API available)
  URL: https://api.linkedin.com/v2/organizations?search=...
  Extract: company size, industry, description
```

**Node 4: Prepare Gemini Prompt**
```javascript
// Function node
const prompt = `You are a senior UX strategist and technical copywriter helping create a personalized job application.

Job Description:
${$json.jobDescription}

Company Information:
- Name: ${$json.companyName}
- Research: ${$json.companyResearch}

Candidate's Skill Matrix:
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Performance optimization
- Product: User Story Mapping, A/B Testing, Funnel Optimization, Design Systems
- AI/Automation: LLM APIs, n8n workflows, Serverless functions

Candidate's Project Portfolio:
- P-01: Pivot Platform → Product Strategy (Transformed near-zero returns to active engagement)
- P-02: Future-Proof Foundation → Frontend Architecture (Saved 6+ months dev time)
- P-03: Ops Autopilot → Workflow Automation (Eliminated manual job matching)
- P-04: Knowledge Transfer Engine → Documentation (Reduced onboarding from weeks to 20 min)
- P-05: Career Stories Platform → AI Full-Stack (0 to 1 using AI acceleration)

Generate a JSON response with:
{
  "targetRoleTitle": "A specific, tailored job title (50-100 chars)",
  "customIntroduction": "3-sentence compelling opening (200-300 words)",
  "cxDesignAlignment": ["bullet 1", "bullet 2", "bullet 3"],
  "automationAndTechFit": ["bullet 1", "bullet 2", "bullet 3"],
  "closingStatement": "Forward-looking CTA sentence (100-150 words)",
  "selectedProjects": ["P-01", "P-04"],
  "companyInsights": "Brief summary of company research"
}

Requirements:
- Be metric-driven and specific
- Reference actual projects by ID
- Professional, confident tone
- Australian English
- No jargon without backing data`;

return { json: { prompt } };
```

**Node 5: Gemini API Call**
```
HTTP Request:
  URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
  Method: POST
  Authentication: API Key (header)
  
Body:
{
  "contents": [{
    "parts": [{
      "text": "{{ $json.prompt }}"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 2048
  }
}
```

**Node 6: Parse AI Response**
```javascript
// Function node
const response = $json.candidates[0].content.parts[0].text;

// Extract JSON from markdown code blocks if present
const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                  response.match(/\{[\s\S]*\}/);

if (!jsonMatch) {
  throw new Error('Invalid JSON response from Gemini');
}

const aiContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);

return { json: {
  ...aiContent,
  originalInput: $node['Webhook Trigger'].json
}};
```

**Node 7: Generate Slug**
```javascript
// Function node
const company = $json.originalInput.companyName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-');

const role = $json.originalInput.roleTitle
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .slice(0, 50);

const slug = `${company}-${role}`;

return { json: { ...$json, slug } };
```

**Node 8: Create Sanity Document**
```
HTTP Request:
  URL: https://[PROJECT-ID].api.sanity.io/v2021-06-07/data/mutate/[DATASET]
  Method: POST
  Authentication: Bearer token (Sanity write token)

Body:
{
  "mutations": [{
    "create": {
      "_type": "jobApplication",
      "slug": { "current": "{{ $json.slug }}" },
      "targetCompany": "{{ $json.originalInput.companyName }}",
      "targetRoleTitle": "{{ $json.targetRoleTitle }}",
      "customIntroduction": "{{ $json.customIntroduction }}",
      "cxDesignAlignment": {{ $json.cxDesignAlignment }},
      "automationAndTechFit": {{ $json.automationAndTechFit }},
      "closingStatement": "{{ $json.closingStatement }}",
      "linkedProjects": [
        { "_type": "reference", "_ref": "project-p01" },
        { "_type": "reference", "_ref": "project-p04" }
      ],
      "jobUrl": "{{ $json.originalInput.jobUrl }}",
      "yourNotes": "{{ $json.originalInput.notes }}",
      "priority": "{{ $json.originalInput.priority }}",
      "status": "ai-generated",
      "companyResearch": "{{ $json.companyInsights }}",
      "createdAt": "{{ $now }}"
    }
  }]
}
```

**Node 9: Response**
```json
{
  "success": true,
  "message": "Draft created successfully",
  "slug": "{{ $json.slug }}",
  "sanityDraftUrl": "https://meljonesai.sanity.studio/desk/jobApplication;draft-{{ $json.slug }}"
}
```

---

### 4. SANITY SCHEMAS

**jobApplication.ts**

```typescript
export default {
  name: 'jobApplication',
  title: 'Job Application',
  type: 'document',
  fields: [
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: (doc) => `${doc.targetCompany}-${doc.targetRoleTitle}`,
        maxLength: 96
      }
    },
    {
      name: 'targetCompany',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'targetRoleTitle',
      title: 'Role Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'customIntroduction',
      title: 'Introduction',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required()
    },
    {
      name: 'cxDesignAlignment',
      title: 'CX & Product Alignment',
      type: 'array',
      of: [{ type: 'text' }],
      validation: (Rule) => Rule.required().min(3).max(4)
    },
    {
      name: 'automationAndTechFit',
      title: 'Automation & Tech Fit',
      type: 'array',
      of: [{ type: 'text' }],
      validation: (Rule) => Rule.required().min(3).max(4)
    },
    {
      name: 'closingStatement',
      title: 'Closing Statement',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required()
    },
    {
      name: 'linkedProjects',
      title: 'Featured Projects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
      validation: (Rule) => Rule.max(3)
    },
    {
      name: 'jobUrl',
      title: 'Job Posting URL',
      type: 'url'
    },
    {
      name: 'yourNotes',
      title: 'Your Notes',
      type: 'text',
      rows: 3
    },
    {
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          { title: 'High', value: 'high' },
          { title: 'Medium', value: 'medium' },
          { title: 'Low', value: 'low' }
        ]
      },
      initialValue: 'medium'
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: '🤖 AI Generated', value: 'ai-generated' },
          { title: '👀 In Review', value: 'in-review' },
          { title: '✅ Approved', value: 'approved' },
          { title: '🌐 Published', value: 'published' },
          { title: '📦 Archived', value: 'archived' }
        ]
      },
      initialValue: 'ai-generated',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'companyResearch',
      title: 'Company Research',
      type: 'text',
      rows: 5,
      description: 'AI-generated company insights'
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    }
  ],
  preview: {
    select: {
      title: 'targetCompany',
      subtitle: 'targetRoleTitle',
      status: 'status'
    },
    prepare({ title, subtitle, status }) {
      return {
        title: `${title} - ${subtitle}`,
        subtitle: status
      }
    }
  }
}
```

**project.ts**

```typescript
export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'projectId',
      title: 'Project ID',
      type: 'string',
      validation: (Rule) => Rule.required().regex(/^P-\d{2}$/),
      description: 'Format: P-01, P-02, etc.'
    },
    {
      name: 'name',
      title: 'Project Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'focus',
      title: 'Focus Area',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., Product Strategy & User Research'
    },
    {
      name: 'keyMetric',
      title: 'Key Measurable Result',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
      description: 'The main business impact achieved'
    },
    {
      name: 'description',
      title: 'Detailed Description',
      type: 'text',
      rows: 5
    },
    {
      name: 'year',
      title: 'Year Completed',
      type: 'number',
      validation: (Rule) => Rule.min(2020).max(2030)
    },
    {
      name: 'technologies',
      title: 'Technologies Used',
      type: 'array',
      of: [{ type: 'string' }]
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'projectId',
      description: 'focus'
    }
  }
}
```

---

### 5. PUBLIC WEBSITE

**Homepage:** `web/src/app/page.tsx`

Minimal design showing:
- Brief professional introduction
- Link to published applications (if any)
- Contact information
- **No form** (form is in /admin only)

**Dynamic Application Pages:** `web/src/app/[slug]/page.tsx`

```typescript
// Only show PUBLISHED applications
export async function generateStaticParams() {
  const slugs = await sanityFetch(
    `*[_type == "jobApplication" && status == "published"]{ 
      "slug": slug.current 
    }`
  )
  return slugs
}

export default async function ApplicationPage({ params }) {
  const app = await sanityFetch(APPLICATION_BY_SLUG_QUERY, { 
    slug: params.slug,
    status: 'published' // Only fetch if published
  })
  
  if (!app) {
    notFound()
  }
  
  return (
    // Render application with Tailwind styling
  )
}
```

---

### 6. FIREBASE AUTHENTICATION

**Setup:**
```bash
npm install firebase firebase-admin
```

**Configuration Files:**

```typescript
// web/src/lib/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

```typescript
// web/src/lib/firebase/admin.ts (server-side)
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const adminApp = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

export const adminAuth = getAuth(adminApp);
```

**Auth Middleware:**

```typescript
// web/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Verify token (simplified - implement proper verification)
    try {
      // Verify with Firebase Admin SDK
      // If invalid, redirect to login
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

---

## ENVIRONMENT VARIABLES

### Next.js (`web/.env.local`)

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=v2025-01-01

# Firebase (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (Private)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# n8n Webhook
N8N_WEBHOOK_URL=https://your-hostinger-vps.com/webhook/generate-application
N8N_WEBHOOK_SECRET=your_webhook_secret_key
```

### n8n (Environment Variables on Hostinger)

```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Sanity Write Token
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_WRITE_TOKEN=your_sanity_write_token

# Webhook Secret
WEBHOOK_SECRET=your_webhook_secret_key
```

---

## SUCCESS METRICS

### Technical KPIs
- Form submission → Draft creation: < 30 seconds
- AI content quality: 80%+ usable without edits (target)
- Build time: < 60 seconds
- Lighthouse score: > 90

### Product KPIs
- Time to create application: < 5 minutes (form + review)
- Applications per week capacity: 10-20
- Manual editing time: < 5 minutes per application

---

## DEPLOYMENT STRATEGY

### Next.js (Vercel)
- Deploy `web/` directory
- Environment variables configured
- Automatic revalidation on Sanity publish

### Sanity Studio (Sanity Cloud)
- Deploy with `npm run studio:deploy`
- Or self-host on Vercel

### n8n (Hostinger VPS)
- Already installed ✓
- Expose webhook endpoint
- Set up SSL certificate
- Configure environment variables

---

## CRITICAL SUCCESS FACTORS

1. ✅ Firebase Auth properly configured
2. ✅ n8n webhook accessible from Next.js
3. ✅ Gemini API responding correctly
4. ✅ Sanity write token has correct permissions
5. ✅ Draft/published workflow works
6. ✅ At least 1 end-to-end test successful

---

**STATUS:** Ready for implementation with correct architecture

**Next Step:** See ROADMAP_REVISED.md for hour-by-hour execution plan
