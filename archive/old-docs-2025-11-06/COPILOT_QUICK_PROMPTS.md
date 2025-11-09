# GitHub Copilot - Quick Prompts by Milestone

**Copy-paste these as you work through each task**

---

## 🎯 GENERAL CONTEXT (Start Every Session)

```
I'm building MelJonesAI - an AI job application generator.

Stack: Next.js 15 + Sanity + Firebase Auth + n8n + Gemini API

Flow: Admin Form → API → n8n → Gemini → Sanity Draft → Review → Publish

Current: [Milestone X, Task Y]
```

---

## M1: FIREBASE SETUP (1.5 hours)

### Firebase Client Config
```
Create web/src/lib/firebase/config.ts for Next.js 15 client-side.
Use Firebase v10 modular SDK, singleton pattern, NEXT_PUBLIC_ env vars.
Export auth instance. Complete TypeScript file.
```

### Firebase Admin Config
```
Create web/src/lib/firebase/admin.ts for Next.js 15 server-side.
Use Firebase Admin SDK, service account from env vars.
Handle escaped newlines in private key. Export adminAuth.
```

### Login Page
```
Create web/src/app/login/page.tsx with Google Sign-In.
Client component, signInWithPopup, save token to cookie, redirect to /admin.
Tailwind styling, TypeScript.
```

### Admin Dashboard
```
Create web/src/app/admin/page.tsx - protected dashboard.
Check auth with onAuthStateChanged, redirect if not logged in.
Show user email, link to /admin/new. Tailwind, TypeScript.
```

---

## M2: N8N WORKFLOW (2.5 hours)

### Validate Input Node
```
n8n Function node: validate webhook input.
Check jobDescription, companyName, roleTitle (non-empty after trim).
Throw error if missing. Return { json: { cleanedData, timestamp } }.
Access via $input.item.json
```

### Prepare Gemini Prompt Node
```
n8n Function node: create prompt for Gemini API.
Include: job description, skill matrix, 5 projects with metrics.
Request JSON response with specific structure.
Access previous node: $node['Webhook Trigger'].json
Return { json: { prompt: "..." } }
```

### Parse Gemini Response Node
```
n8n Function node: parse Gemini API JSON response.
Extract from $json.candidates[0].content.parts[0].text
Handle markdown code blocks (```json ... ```)
Fallback to template content if parsing fails.
Validate required fields. Return structured data.
```

### Generate Slug Node
```
n8n Function node: create URL-safe slug.
Input: companyName, roleTitle from previous nodes.
Output: lowercase, hyphens, no special chars, max 50 chars for role.
Format: company-name-role-title
Return { json: { slug, ...previousData } }
```

---

## M3: SANITY SCHEMAS (1.5 hours)

### jobApplication Schema
```
Create sanity-studio/schemas/jobApplication.ts for Sanity v3.

Fields:
- slug (from company + role)
- targetCompany, targetRoleTitle (strings, required)
- customIntroduction, closingStatement (text, required)
- cxDesignAlignment, automationAndTechFit (array of text, 3-4 items)
- linkedProjects (array of references to 'project')
- jobUrl (url), yourNotes (text)
- priority (string options: high/medium/low)
- status (string options: ai-generated, in-review, approved, published, archived)
- companyResearch (text)
- createdAt, publishedAt (datetime)

Include validation, preview config. TypeScript, export default.
```

### project Schema
```
Create sanity-studio/schemas/project.ts for Sanity v3.

Fields:
- projectId (string, format: P-01, P-02, required)
- name, focus (strings, required)
- keyMetric (text, required)
- description (text, optional)
- year (number, 2020-2030)
- technologies (array of strings)

Validation, preview config. TypeScript, export default.
```

---

## M4: ADMIN INTERFACE (1.5 hours)

### Admin Form Page
```
Create web/src/app/admin/new/page.tsx - job application form.

Client component ('use client'), TypeScript.

Fields:
1. jobDescription (textarea, required, 10 rows, char counter)
2. companyName (text, required)
3. roleTitle (text, required)
4. jobUrl (url, optional)
5. notes (textarea, optional, 3 rows)
6. priority (select: high/medium/low)

On submit:
- Get Firebase token from auth.currentUser
- POST to /api/generate with Authorization header
- Show loading state
- On success: alert + open Sanity Studio URL in new tab
- On error: display error message

Tailwind CSS: max-w-3xl container, rounded inputs, blue buttons.
```

### API Route
```
Create web/src/app/api/generate/route.ts - POST endpoint.

Flow:
1. Get token from Authorization header or auth-token cookie
2. Verify with adminAuth.verifyIdToken() (from '@/lib/firebase/admin')
3. Validate body: jobDescription, companyName, roleTitle required
4. Fetch N8N_WEBHOOK_URL with X-Webhook-Secret header
5. Return success with sanityStudioUrl or error

TypeScript, proper error handling, status codes (401, 400, 500).
Use NextRequest, NextResponse from 'next/server'.
```

---

## M5: TESTING (45 minutes)

### Update Dynamic Page Query
```
Update web/src/app/[slug]/page.tsx to only show published apps.

In generateStaticParams():
Query: *[_type == "jobApplication" && status == "published"]{ "slug": slug.current }

In page component:
Add status == "published" filter to query.
If no app found, call notFound() from 'next/navigation'.

TypeScript, use existing sanityFetch pattern.
```

---

## 🔧 DEBUGGING PROMPTS

### Error: Module Not Found
```
Getting "Cannot find module [X]" error in [file].
Using Next.js 15 App Router, TypeScript.
I installed it with: npm install [package]
Import statement: [paste import]
What's wrong?
```

### Error: Hydration Mismatch
```
Getting hydration mismatch error in [component].
This is a client component ('use client').
Code: [paste relevant code]
Using Next.js 15. How to fix?
```

### Error: API Route Not Working
```
API route /api/generate not responding.
Error: [paste error]
Code: [paste route.ts]
Using Next.js 15 App Router. What's the issue?
```

### TypeScript Error
```
TypeScript error in [file]:
[paste error message]

Context: [what you're trying to do]
Code: [paste code]

Fix this with proper types.
```

---

## 🎨 STYLING PROMPTS

### Tailwind Button
```
Style this button with Tailwind CSS:
- Blue background (blue-600)
- White text
- Rounded corners (rounded-lg)
- Padding: py-3 px-6
- Hover: darker blue (blue-700)
- Disabled state: gray-400

No custom CSS, utilities only.
```

### Tailwind Form
```
Style this form with Tailwind CSS:
- Max width container (max-w-3xl mx-auto px-4 py-8)
- Input fields: w-full border rounded-lg p-3
- Labels: block text-sm font-medium mb-2
- Spacing between fields: space-y-6
- Error messages: bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded

Mobile-first responsive design.
```

---

## ⚡ QUICK FIXES

### Add Loading State
```
Add loading state to this form component.
Show "Generating..." in button when loading.
Disable button when loading.
TypeScript with useState.
```

### Add Error Handling
```
Add error handling to this async function.
Try-catch block, log error, return user-friendly message.
TypeScript with proper error types.
```

### Add Form Validation
```
Add validation to this form:
- Field X: required, min length Y
- Field Z: valid URL format
- Show error messages below each field
TypeScript, use React state.
```

---

## 💡 PRO TIPS

### Always Include:
✅ "Next.js 15 App Router"
✅ "TypeScript"
✅ "Complete file with imports"
✅ Specific file path

### Reference Existing:
✅ "Following pattern in [existing file]"
✅ "Using existing [function/type] from [path]"

### Break Down Complex Tasks:
```
First: Create the basic component structure
Then: Add form validation
Then: Add API integration
Then: Add error handling
Then: Add Tailwind styling
```

---

## 📋 CURRENT STATUS TEMPLATE

**Update this as you progress:**

```
✅ M1: Firebase Setup - COMPLETE
✅ M2: n8n Workflow - COMPLETE
⏳ M3: Sanity Schemas - IN PROGRESS
   ✅ Task 3.1: Schemas created
   ⏳ Task 3.2: Adding projects (3/5 done)
   ⏹️ Task 3.3: Not started

Current file: sanity-studio/schemas/project.ts
Next task: Add P-04 project in Sanity Studio
```

---

## 🎯 MILESTONE CHECKLIST

Copy this to track progress:

```
M1: Foundation + Firebase (1.5h)
□ Task 1.1: Verify setup
□ Task 1.2: Create Firebase project
□ Task 1.3: Install dependencies
□ Task 1.4: Test auth flow

M2: n8n Workflow (2.5h)
□ Task 2.1: Basic setup
□ Task 2.2: Get Gemini API key
□ Task 2.3: Get Sanity write token
□ Task 2.4: Build nodes 1-3
□ Task 2.5: Build nodes 4-6
□ Task 2.6: Build nodes 7-11

M3: Sanity Schemas (1.5h)
□ Task 3.1: Create schemas
□ Task 3.2: Add 5 projects
□ Task 3.3: Test API access

M4: Admin Interface (1.5h)
□ Task 4.1: Create form page
□ Task 4.2: Create API route
□ Task 4.3: Test end-to-end

M5: Testing (45min)
□ Task 5.1: Test complete workflow
□ Task 5.2: Update public pages

M6: Documentation (15min)
□ Task 6.1: Update README
□ Task 6.2: Create EOD docs
```

---

**Keep this open in a separate window and copy-paste prompts as needed!**
