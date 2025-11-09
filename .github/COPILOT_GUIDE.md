# GitHub Copilot - Project Context Guide

**Project:** MelJonesAI - AI-Powered Job Application Generator  
**Purpose:** Help Copilot understand the project architecture and assist effectively

---

## 🎯 PROJECT OVERVIEW (For Copilot)

This is a **Next.js + Sanity + n8n automation pipeline** that transforms job descriptions into personalized application pages.

**Tech Stack:**
- Frontend: Next.js 15 (App Router, TypeScript, Tailwind CSS)
- CMS: Sanity (with draft/publish workflow)
- Auth: Firebase (Google Sign-In, single user)
- Automation: n8n (self-hosted on Hostinger)
- AI: Gemini 2.0 Flash (free tier)
- Deployment: Vercel (Next.js) + Sanity Cloud (Studio)

**Architecture Flow:**
```
Admin Form (/admin/new) 
  → API Route (/api/generate)
  → n8n Webhook (Hostinger)
  → Gemini API (content generation)
  → Sanity Draft Document (status: "ai-generated")
  → Manual Review in Sanity Studio
  → Publish → Live Page (/[slug])
```

---

## 📁 PROJECT STRUCTURE

```
meljonesai/
├── web/                           # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Minimal homepage
│   │   │   ├── login/page.tsx    # Firebase Google Sign-In
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx      # Protected dashboard
│   │   │   │   └── new/page.tsx  # Application form (6 fields)
│   │   │   ├── [slug]/page.tsx   # Dynamic application pages
│   │   │   └── api/
│   │   │       └── generate/route.ts  # API endpoint to n8n
│   │   ├── lib/
│   │   │   ├── firebase/
│   │   │   │   ├── config.ts     # Client-side Firebase
│   │   │   │   └── admin.ts      # Server-side Firebase Admin
│   │   │   └── sanity/
│   │   │       ├── client.ts     # Sanity client (EXISTS)
│   │   │       └── queries.ts    # GROQ queries (EXISTS)
│   │   └── components/
│   │       ├── ProjectCard.tsx
│   │       └── ContentSection.tsx
│   └── .env.local                # All environment variables
│
└── sanity-studio/                # Sanity CMS
    └── schemas/
        ├── jobApplication.ts     # Main content type with status
        └── project.ts            # Portfolio projects (P-01 to P-05)
```

---

## 🔑 KEY CONCEPTS

### 1. Content States (Sanity)
```typescript
status: "ai-generated" | "in-review" | "approved" | "published" | "archived"
```
- **ai-generated**: Just created by n8n, needs review
- **published**: Live on public site (only these are visible)

### 2. Authentication Flow
- Single user (your Google account)
- Firebase Auth protects `/admin/*` routes
- API routes validate Firebase token

### 3. Project References
5 core projects stored in Sanity, referenced by applications:
- P-01: Pivot Platform (Product Strategy)
- P-02: Future-Proof Foundation (Frontend Architecture)
- P-03: Ops Autopilot (Automation)
- P-04: Knowledge Transfer Engine (Documentation)
- P-05: Career Stories Platform (AI Full-Stack)

### 4. Form Fields
```typescript
interface ApplicationFormData {
  jobDescription: string    // Required, 100-10000 chars
  companyName: string       // Required
  roleTitle: string         // Required
  jobUrl?: string          // Optional
  notes?: string           // Optional
  priority: 'high' | 'medium' | 'low'
}
```

### 5. AI-Generated Content Fields
```typescript
interface AIGeneratedContent {
  targetRoleTitle: string           // Customized job title
  customIntroduction: string        // 3-sentence hook
  cxDesignAlignment: string[]       // 3-4 bullet points
  automationAndTechFit: string[]    // 3-4 bullet points
  closingStatement: string          // Forward-looking CTA
  selectedProjects: string[]        // ["P-01", "P-04"]
  reasoning?: string                // AI's project selection logic
}
```

---

## 💻 COPILOT PROMPTING STRATEGIES

### General Rules
1. **Always mention the framework**: "In Next.js 15 App Router..."
2. **Specify TypeScript**: All code should be TypeScript
3. **Reference existing patterns**: "Following the pattern in client.ts..."
4. **Be explicit about dependencies**: "Using Firebase Auth..."

---

## 📝 TASK-SPECIFIC PROMPTS

### MILESTONE 1: Firebase Setup

**When creating Firebase config files:**

```
Create a Firebase client configuration file for Next.js 15 App Router with TypeScript.

Context:
- File location: web/src/lib/firebase/config.ts
- Use Firebase v10+ modular SDK
- Client-side only (runs in browser)
- Environment variables from .env.local with NEXT_PUBLIC_ prefix
- Singleton pattern to prevent multiple initializations
- Export auth instance for use in components

Include proper TypeScript types and error handling.
```

**When creating Firebase Admin config:**

```
Create a Firebase Admin SDK configuration for Next.js 15 server-side use.

Context:
- File location: web/src/lib/firebase/admin.ts
- Server-side only (Node.js environment)
- Use service account credentials from environment variables
- No NEXT_PUBLIC_ prefix (these are private)
- Export adminAuth for token verification in API routes
- Handle the case where private key has escaped newlines

TypeScript with proper types from firebase-admin package.
```

---

### MILESTONE 2: n8n Workflow

**General n8n guidance for Copilot:**

```
I'm building an n8n workflow with 11 nodes. The workflow:
1. Receives webhook with job application data
2. Validates input
3. Does minimal company research
4. Calls Gemini API to generate content
5. Creates a draft document in Sanity

Help me write the JavaScript for [specific node].

Context:
- n8n Function nodes use $json to access previous node data
- Access nodes by name: $node['Node Name'].json
- Environment variables via $env.VARIABLE_NAME
- Return format: { json: { ...data } }
```

**For specific nodes, be explicit:**

```
Write a Function node for n8n that validates webhook input.

Requirements:
- Check for required fields: jobDescription, companyName, roleTitle
- Each must be non-empty after trimming
- Throw error if missing with clear message
- Return cleaned data with timestamp
- TypeScript-style JavaScript

Input is available as $input.item.json
Return format must be { json: { ...cleanedData } }
```

```
Write a Function node that prepares a prompt for Gemini API.

Context:
- This is for generating personalized job application content
- Include these in the prompt:
  - Job description from previous node
  - Skill matrix (Frontend, Product, Automation)
  - 5 project portfolio items with metrics
  - Instructions to return JSON only

Requirements:
- Access data from $node['Webhook Trigger'].json
- Create a detailed prompt string
- Request specific JSON structure in response
- Return { json: { prompt: "..." } }
```

---

### MILESTONE 3: Sanity Schemas

**When creating Sanity schemas:**

```
Create a Sanity schema for a job application document type.

Context:
- File: sanity-studio/schemas/jobApplication.ts
- Uses Sanity v3 schema format
- Export default object with name, title, type, fields

Required fields:
- slug (from company + role)
- targetCompany (string, required)
- targetRoleTitle (string, required)
- customIntroduction (text, required)
- cxDesignAlignment (array of text)
- automationAndTechFit (array of text)
- closingStatement (text, required)
- linkedProjects (array of references to 'project' type)
- jobUrl (url)
- yourNotes (text)
- priority (string, options: high/medium/low)
- status (string, options: ai-generated, in-review, approved, published, archived)
- companyResearch (text)
- createdAt (datetime)
- publishedAt (datetime)

Include validation rules and preview configuration.
Use TypeScript.
```

---

### MILESTONE 4: Admin Interface

**When creating the admin form:**

```
Create a Next.js 15 client component for a job application form.

Context:
- File: web/src/app/admin/new/page.tsx
- Use 'use client' directive
- TypeScript with proper types
- Tailwind CSS for styling
- React hooks for form state

Form fields:
1. jobDescription (textarea, required, rows=10)
2. companyName (text, required)
3. roleTitle (text, required)
4. jobUrl (url, optional)
5. notes (textarea, optional, rows=3)
6. priority (select: high/medium/low)

On submit:
- POST to /api/generate
- Include Firebase Auth token in Authorization header
- Show loading state during submission
- Handle success (show message, open Sanity Studio URL)
- Handle errors (display error message)

Include form validation and character counter for jobDescription.
```

**When creating the API route:**

```
Create a Next.js 15 API route that receives form data and triggers n8n webhook.

Context:
- File: web/src/app/api/generate/route.ts
- POST endpoint only
- TypeScript
- Use next/server imports

Flow:
1. Verify Firebase Auth token (from Authorization header or cookie)
2. Validate request body (required fields)
3. Call n8n webhook with data
   - URL from process.env.N8N_WEBHOOK_URL
   - Secret in X-Webhook-Secret header
4. Return success response with Sanity Studio URL
5. Handle errors with appropriate status codes

Use Firebase Admin SDK (from '@/lib/firebase/admin') for token verification.
Include proper error handling and TypeScript types.
```

---

## 🔧 COMMON COPILOT PATTERNS

### Pattern 1: Accessing Environment Variables

```typescript
// In Next.js client components:
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

// In API routes or server components:
const secret = process.env.N8N_WEBHOOK_SECRET
```

**Copilot prompt:**
```
In Next.js 15, access environment variables for Firebase config.
- Client-side variables start with NEXT_PUBLIC_
- Server-side variables have no prefix
Show both patterns with TypeScript.
```

---

### Pattern 2: Fetching from Sanity

```typescript
// Existing pattern in your project:
const data = await sanityFetch(QUERY, params)
```

**Copilot prompt:**
```
Using the existing sanityFetch function from @/lib/sanity/client,
write a GROQ query that fetches all published job applications
with their linked projects.

Return only applications where status === "published"
Include all application fields plus expanded project references.
```

---

### Pattern 3: Firebase Auth in Components

```typescript
// Get current user
const user = auth.currentUser

// Get ID token
const token = await user.getIdToken()
```

**Copilot prompt:**
```
In a Next.js client component using Firebase Auth,
get the current user's ID token and include it in a fetch request.

Use the auth instance from '@/lib/firebase/config'
Handle the case where user is null.
TypeScript with proper error handling.
```

---

## 🎨 TAILWIND CSS GUIDELINES

**When asking Copilot for styling:**

```
Style this form with Tailwind CSS following these patterns:
- Container: max-w-3xl mx-auto px-4 py-8
- Form fields: w-full border rounded-lg p-3
- Labels: block text-sm font-medium mb-2
- Buttons: bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700
- Error messages: bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded

Use only Tailwind utility classes, no custom CSS.
Responsive design with mobile-first approach.
```

---

## 🐛 DEBUGGING WITH COPILOT

### When Something Breaks

**Prompt format:**
```
I'm getting this error in [file/component]:
[paste error message]

Context:
- Using Next.js 15 App Router
- [relevant context about what you're trying to do]
- [relevant code snippet if helpful]

What's causing this and how do I fix it?
```

**Example:**
```
I'm getting "Error: Cannot find module 'firebase-admin'" in my API route.

Context:
- Next.js 15 API route at /api/generate
- Trying to verify Firebase token
- I installed firebase-admin with npm install firebase-admin
- The import statement: import { adminAuth } from '@/lib/firebase/admin'

What's wrong?
```

---

## ⚡ QUICK REFERENCE PROMPTS

### "Create a component that..."
```
Create a React component that displays a project card.

Props:
- name: string
- focus: string
- keyMetric: string

Style with Tailwind CSS:
- Card with border and rounded corners
- Hover effect
- Responsive design

TypeScript, export as default.
```

### "Write a function that..."
```
Write a TypeScript function that generates a URL-safe slug.

Input: company name and role title (strings)
Output: slug string (lowercase, hyphens, no special chars)

Example: "Atlassian" + "Senior Product Designer" → "atlassian-senior-product-designer"
```

### "Fix this code..."
```
Fix this code to properly handle async/await:

[paste code]

The issue is [describe what's not working]
Use Next.js 15 best practices and TypeScript.
```

---

## 📚 REFERENCE ARCHITECTURE

### When Starting New Files

**Always provide context:**
```
I'm creating [file path] in a Next.js 15 project.

Project context:
- [what this file does]
- [how it fits in the architecture]
- [what it needs to interact with]

Dependencies:
- [list relevant packages]

Requirements:
- [specific requirements]

Generate the complete file with TypeScript and proper imports.
```

---

## 🎯 MILESTONE-SPECIFIC CONTEXTS

### Currently Working On: Milestone 1 (Firebase)

**Copilot context:**
```
I'm setting up Firebase Authentication in a Next.js 15 project.

Requirements:
- Google Sign-In only
- Single user (my account)
- Protect /admin routes
- Token validation in API routes

Current task: [specific task you're on]

Files involved:
- web/src/lib/firebase/config.ts
- web/src/lib/firebase/admin.ts
- web/src/app/login/page.tsx
- web/src/middleware.ts (optional)

Help me [specific request].
```

### Working On: Milestone 2 (n8n)

**Copilot context:**
```
I'm building an n8n workflow that automates job application content generation.

Workflow steps:
1. Webhook trigger
2. Validate input
3. Call Gemini API
4. Create Sanity draft

Current node: [node number/name]

Help me write the [Function/HTTP Request] node that [does what].
```

### Working On: Milestone 4 (Admin Form)

**Copilot context:**
```
I'm building an admin form for submitting job applications.

Tech stack:
- Next.js 15 client component
- TypeScript
- Firebase Auth for user token
- Tailwind CSS for styling

Current task: [what you're working on]

Help me [specific request].
```

---

## 💡 PRO TIPS FOR COPILOT

### 1. Be Specific About Versions
- ✅ "Next.js 15 App Router"
- ❌ "Next.js"

### 2. Reference Existing Code
- ✅ "Following the pattern in web/src/lib/sanity/client.ts..."
- ❌ "Create a Sanity client"

### 3. Mention TypeScript Explicitly
- ✅ "TypeScript with proper types"
- ❌ "JavaScript"

### 4. Request Complete Solutions
- ✅ "Generate the complete file with all imports"
- ❌ "Give me a snippet"

### 5. Provide Error Messages Verbatim
- ✅ Paste the exact error from console
- ❌ Describe the error vaguely

### 6. Break Down Complex Requests
- ✅ "First, help me create the schema. Then I'll ask about the form."
- ❌ "Create everything for the admin interface"

---

## 🚀 SAMPLE WORKFLOW

### Starting a New Component

1. **Set context:**
```
I'm in Milestone 4 of building a job application generator.
Creating: web/src/app/admin/new/page.tsx
This is a form to submit job descriptions for AI processing.
```

2. **Request component:**
```
Create a Next.js 15 client component with [specific requirements from roadmap].
```

3. **Add features incrementally:**
```
Now add form validation that checks [specific rules].
```

4. **Add styling:**
```
Style this with Tailwind CSS following [specific pattern].
```

5. **Add error handling:**
```
Add error handling for [specific scenarios].
```

---

## 📖 WHEN TO REFERENCE DOCS

**Tell Copilot to reference your planning docs:**

```
Before generating code, review these requirements from my project spec:
[paste relevant section from ROADMAP_REVISED.md or PROJECT_SPEC_REVISED.md]

Now create [specific component/function] following these requirements.
```

---

## ✅ VERIFICATION PROMPTS

**After Copilot generates code:**

```
Review this code for:
1. TypeScript errors
2. Missing imports
3. Incorrect Next.js 15 patterns
4. Security issues
5. Missing error handling

[paste code]

Suggest improvements.
```

---

## 🎯 CURRENT STATUS

You're working on: **[Update based on milestone]**

Current file: **[File path]**

Next task: **[From roadmap]**

**Quick prompt template:**
```
In my Next.js 15 job application generator,
I'm creating [file] that [does what].

Requirements:
- [from roadmap]

Dependencies:
- [relevant packages]

Generate complete TypeScript code with proper imports.
```

---

**REMEMBER:** Copilot works best with clear, specific context. Always mention:
1. Framework version (Next.js 15)
2. What you're building (file/component purpose)
3. How it fits in the architecture
4. Specific requirements
5. TypeScript and styling preferences

**Happy coding! 🚀**
