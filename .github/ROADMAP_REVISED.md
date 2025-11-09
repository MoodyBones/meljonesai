# MelJonesAI - REVISED EOD Roadmap (Full Automation)

**Start Time:** 2025-11-09 (Now)  
**Target Completion:** 2025-11-09 EOD (18:00)  
**Total Time Available:** ~8 hours  
**Mode:** SPRINT - Full automation must work

---

## ⚡ EXECUTIVE TIMELINE

```
NOW → 10:30   | M1: Foundation + Firebase Setup (1.5h)
10:30 → 13:00 | M2: n8n Workflow Build (2.5h) ← CRITICAL PATH
13:00 → 14:00 | LUNCH BREAK
14:00 → 15:30 | M3: Sanity Schemas + Projects (1.5h)
15:30 → 17:00 | M4: Admin Interface (1.5h)
17:00 → 17:45 | M5: End-to-End Testing (45min)
17:45 → 18:00 | M6: Documentation (15min)
```

**Critical Path:** n8n workflow is the bottleneck - allocate maximum time  
**Buffer:** Built into each milestone for unexpected issues

---

## 🎯 MILESTONE 1: FOUNDATION + FIREBASE SETUP
**Duration:** 1.5 hours  
**Goal:** Environment ready, Firebase Auth working

### Task 1.1: Verify Current Setup (15 min)

```bash
# Priority: P0 - BLOCKING

cd ~/Work/meljonesai

# Start Sanity Studio
npm run studio:dev
# Verify: http://localhost:3333

# Start Next.js (new terminal)
npm run web:dev
# Verify: http://localhost:3000

# Verify Sanity env vars exist
cd web
cat .env.local
# Should see:
# NEXT_PUBLIC_SANITY_PROJECT_ID=...
# NEXT_PUBLIC_SANITY_DATASET=...
```

**Acceptance Criteria:**
- [ ] Both dev servers running without errors
- [ ] Sanity credentials confirmed
- [ ] No TypeScript compilation errors

---

### Task 1.2: Create Firebase Project (30 min)

```bash
# Priority: P0 - BLOCKING

# Go to: https://console.firebase.google.com/
```

**Steps:**
1. Create new Firebase project: "meljonesai"
2. Enable Google Authentication:
   - Go to Authentication → Sign-in method
   - Enable "Google" provider
   - Add your Google account email to authorized users
3. Get Web App credentials:
   - Project Settings → General
   - Click "Add app" → Web
   - Copy config object
4. Create Service Account:
   - Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download JSON file

**Save credentials to `web/.env.local`:**

```env
# Add to existing .env.local

# Firebase Public (from Web App config)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=meljonesai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=meljonesai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=meljonesai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (from Service Account JSON)
FIREBASE_PROJECT_ID=meljonesai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@meljonesai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# n8n Configuration
N8N_WEBHOOK_URL=https://your-hostinger-domain.com/webhook/generate-application
N8N_WEBHOOK_SECRET=generate_a_random_secret_key_here
```

**Acceptance Criteria:**
- [ ] Firebase project created
- [ ] Google Auth enabled
- [ ] Web app registered
- [ ] Service account JSON downloaded
- [ ] All credentials in .env.local

---

### Task 1.3: Install Firebase Dependencies (15 min)

```bash
# Priority: P0 - BLOCKING

cd web
npm install firebase firebase-admin
npm install --save-dev @types/node
```

**Create Firebase config files:**

```bash
# Create directory structure
mkdir -p src/lib/firebase
```

**Create `web/src/lib/firebase/config.ts`:**

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
```

**Create `web/src/lib/firebase/admin.ts`:**

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

export const adminApp = getApps().length === 0 
  ? initializeApp(firebaseAdminConfig, 'admin') 
  : getApps()[0];

export const adminAuth = getAuth(adminApp);
```

**Acceptance Criteria:**
- [ ] Dependencies installed
- [ ] Firebase config files created
- [ ] No TypeScript errors
- [ ] Dev server still running

---

### Task 1.4: Test Firebase Auth (30 min)

**Create simple login page: `web/src/app/login/page.tsx`:**

```typescript
'use client';

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Store token in cookie
      const token = await result.user.getIdToken();
      document.cookie = `auth-token=${token}; path=/; max-age=3600`;
      
      // Redirect to admin
      router.push('/admin');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Admin Login</h1>
        <button
          onClick={handleGoogleSignIn}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
```

**Create protected admin page: `web/src/app/admin/page.tsx`:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, {user.email}!</p>
      <div className="mt-8">
        <a 
          href="/admin/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Create New Application
        </a>
      </div>
    </div>
  );
}
```

**Test:**
1. Restart Next.js dev server (to load new env vars)
2. Go to http://localhost:3000/login
3. Click "Sign in with Google"
4. Verify redirect to /admin
5. Verify you see your email

**Acceptance Criteria:**
- [ ] Can sign in with Google
- [ ] Token stored in cookie
- [ ] Redirects to /admin
- [ ] User email displayed
- [ ] Non-authenticated users redirected to /login

---

## 🤖 MILESTONE 2: n8n WORKFLOW BUILD
**Duration:** 2.5 hours (CRITICAL PATH)  
**Goal:** Working automation from webhook to Sanity

### Task 2.1: n8n Basic Setup (15 min)

```bash
# Priority: P0 - BLOCKING

# SSH into your Hostinger VPS
ssh user@your-hostinger-ip

# Verify n8n is running
ps aux | grep n8n
# OR
systemctl status n8n

# Access n8n web interface
# http://your-hostinger-ip:5678
# (or whatever port n8n is configured on)
```

**Set up webhook authentication:**
1. Generate strong webhook secret:
   ```bash
   openssl rand -base64 32
   ```
2. Save this secret to your notes (you'll need it for Next.js)

**Acceptance Criteria:**
- [ ] Can access n8n web interface
- [ ] Webhook secret generated
- [ ] SSL certificate verified (if using HTTPS)

---

### Task 2.2: Get Gemini API Key (15 min)

```bash
# Priority: P0 - BLOCKING
```

**Steps:**
1. Go to: https://aistudio.google.com/
2. Sign in with Google account
3. Click "Get API Key"
4. Create new API key (free tier)
5. Copy key

**Test Gemini API:**

```bash
# Test with curl
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, Gemini!"
      }]
    }]
  }'

# Should return JSON response with generated text
```

**Save to n8n environment variables:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Acceptance Criteria:**
- [ ] Gemini API key obtained
- [ ] API key tested and working
- [ ] Key saved securely

---

### Task 2.3: Get Sanity Write Token (10 min)

```bash
# Priority: P0 - BLOCKING
```

**Steps:**
1. Go to: https://www.sanity.io/manage
2. Select your project
3. Go to "API" → "Tokens"
4. Click "Add API token"
5. Name: "n8n-writer"
6. Permissions: "Editor" (can create/edit documents)
7. Copy token immediately (shown only once)

**Save to n8n environment:**
```env
SANITY_WRITE_TOKEN=your_sanity_write_token_here
```

**Acceptance Criteria:**
- [ ] Sanity write token created
- [ ] Token has Editor permissions
- [ ] Token saved securely

---

### Task 2.4: Build n8n Workflow - Part 1 (30 min)

**Create new workflow in n8n:** "Generate Job Application"

**Node 1: Webhook Trigger**
- Type: Webhook
- HTTP Method: POST
- Path: `generate-application`
- Authentication: Header Auth
  - Name: `X-Webhook-Secret`
  - Value: `{{ $env.WEBHOOK_SECRET }}`
- Response Mode: "When Last Node Finishes"

**Node 2: Validate Input (Function)**

```javascript
// Validate required fields
const data = $input.item.json;
const required = ['jobDescription', 'companyName', 'roleTitle'];

for (const field of required) {
  if (!data[field] || data[field].trim() === '') {
    throw new Error(`Missing required field: ${field}`);
  }
}

// Clean and structure data
return {
  json: {
    jobDescription: data.jobDescription.trim(),
    companyName: data.companyName.trim(),
    roleTitle: data.roleTitle.trim(),
    jobUrl: data.jobUrl || '',
    notes: data.notes || '',
    priority: data.priority || 'medium',
    timestamp: new Date().toISOString()
  }
};
```

**Node 3: Extract Company Website (HTTP Request)**

```
Method: GET
URL: https://www.google.com/search?q={{ $json.companyName }} official website
Headers:
  User-Agent: Mozilla/5.0 (compatible)

Options:
  - Follow Redirects: true
  - Timeout: 10000ms
  - Ignore SSL Issues: false
```

**Alternative (simpler for MVP):**
If company website extraction is complex, create a Function node:

```javascript
// For MVP: Use manual input or skip detailed research
const companyName = $json.companyName;

// Simple company website inference
const companyWebsite = `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`;

return {
  json: {
    ...$json,
    companyWebsite,
    companyResearch: `Researching ${companyName}...`
  }
};
```

**Test nodes 1-3:**
- Use "Test Workflow" button
- Send test POST request:
  ```bash
  curl -X POST https://your-n8n-url/webhook/generate-application \
    -H "Content-Type: application/json" \
    -H "X-Webhook-Secret: your_secret" \
    -d '{
      "jobDescription": "Test job",
      "companyName": "Test Company",
      "roleTitle": "Test Role"
    }'
  ```

**Acceptance Criteria:**
- [ ] Nodes 1-3 created
- [ ] Webhook receives data correctly
- [ ] Validation works (fails on missing fields)
- [ ] Company website extracted or inferred

---

### Task 2.5: Build n8n Workflow - Part 2 (45 min)

**Node 4: Prepare Gemini Prompt (Function)**

```javascript
const SKILL_MATRIX = {
  frontend: "Next.js (App Router), TypeScript, Tailwind CSS, Performance optimization (Lighthouse, Core Web Vitals), Component reusability",
  product: "User Story Mapping, A/B Testing, Funnel Optimization, Design Systems implementation, Data-driven decision making",
  automation: "LLM API integration (Gemini/Claude), n8n workflow design, Serverless/Edge Functions, GitHub Actions"
};

const PROJECTS = [
  {
    id: "P-01",
    name: "Pivot Platform",
    focus: "Product Strategy & User Research",
    metric: "Transformed near-zero user returns to active re-engagement"
  },
  {
    id: "P-02",
    name: "Future-Proof Foundation",
    focus: "Frontend Architecture & Design Systems",
    metric: "Saved 6+ months development time by building scalable Nuxt.js website"
  },
  {
    id: "P-03",
    name: "Ops Autopilot",
    focus: "Internal Tooling & Workflow Automation",
    metric: "Eliminated manual job matching process, enabling automated personalized recommendations"
  },
  {
    id: "P-04",
    name: "Knowledge Transfer Engine",
    focus: "Documentation & Systems Design",
    metric: "Reduced new volunteer onboarding from weeks to 20 minutes despite 80% team turnover"
  },
  {
    id: "P-05",
    name: "Career Stories Platform",
    focus: "AI-Assisted Full-Stack Development",
    metric: "Taking mission-driven platform from 0 to 1 using AI tools (Claude/n8n) to accelerate development"
  }
];

const prompt = `You are a senior UX strategist and technical copywriter. Create a hyper-personalized job application.

COMPANY: ${$json.companyName}
ROLE: ${$json.roleTitle}

JOB DESCRIPTION:
${$json.jobDescription}

CANDIDATE PROFILE:

Skills:
- Frontend: ${SKILL_MATRIX.frontend}
- Product/CX: ${SKILL_MATRIX.product}
- AI/Automation: ${SKILL_MATRIX.automation}

Proven Projects:
${PROJECTS.map(p => `- ${p.id}: ${p.name} (${p.focus}) → ${p.metric}`).join('\n')}

REQUIREMENTS:
1. Analyze the job description and identify key requirements
2. Match requirements to candidate's skills and projects
3. Select 2-3 most relevant projects
4. Generate compelling, metric-driven content

OUTPUT (Valid JSON only, no markdown):
{
  "targetRoleTitle": "Specific tailored title (e.g., 'Senior Product Designer & Frontend Specialist')",
  "customIntroduction": "3-sentence compelling opening paragraph. Professional, confident tone. Mention specific alignment with company.",
  "cxDesignAlignment": [
    "Bullet 1: Specific CX/Product achievement with metric",
    "Bullet 2: Another relevant achievement",
    "Bullet 3: Third achievement with business impact"
  ],
  "automationAndTechFit": [
    "Bullet 1: Technical capability relevant to role",
    "Bullet 2: AI/automation expertise",
    "Bullet 3: Frontend/technical skill"
  ],
  "closingStatement": "Forward-looking sentence that prompts interview discussion",
  "selectedProjects": ["P-01", "P-04"],
  "reasoning": "Brief explanation of project selection"
}

CRITICAL: Return ONLY valid JSON. No markdown code blocks. No explanation outside JSON.`;

return {
  json: {
    ...$json,
    prompt,
    projectsData: PROJECTS
  }
};
```

**Node 5: Gemini API Call (HTTP Request)**

```
Method: POST
URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={{ $env.GEMINI_API_KEY }}

Headers:
  Content-Type: application/json

Body (JSON):
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
    "maxOutputTokens": 2048,
    "responseMimeType": "application/json"
  }
}

Options:
  - Timeout: 30000ms
  - Response Format: JSON
```

**Node 6: Parse Gemini Response (Function)**

```javascript
try {
  // Get Gemini response
  const geminiResponse = $json.candidates[0].content.parts[0].text;
  
  // Try to parse JSON directly
  let aiContent;
  try {
    aiContent = JSON.parse(geminiResponse);
  } catch (e) {
    // If wrapped in markdown code blocks, extract JSON
    const jsonMatch = geminiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      geminiResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }
    
    aiContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  }
  
  // Validate required fields
  const required = ['targetRoleTitle', 'customIntroduction', 'cxDesignAlignment', 
                    'automationAndTechFit', 'closingStatement', 'selectedProjects'];
  
  for (const field of required) {
    if (!aiContent[field]) {
      throw new Error(`Missing required field in AI response: ${field}`);
    }
  }
  
  return {
    json: {
      originalInput: $node['Webhook Trigger'].json,
      aiContent,
      success: true
    }
  };
  
} catch (error) {
  // Fallback: Use template content
  return {
    json: {
      originalInput: $node['Webhook Trigger'].json,
      aiContent: {
        targetRoleTitle: `${$node['Webhook Trigger'].json.roleTitle}`,
        customIntroduction: `I am applying for the ${$node['Webhook Trigger'].json.roleTitle} position at ${$node['Webhook Trigger'].json.companyName}.`,
        cxDesignAlignment: [
          "Product strategy and user research experience",
          "Design systems implementation",
          "Data-driven decision making"
        ],
        automationAndTechFit: [
          "Frontend development with Next.js and TypeScript",
          "AI/LLM integration experience",
          "Workflow automation with n8n"
        ],
        closingStatement: "I look forward to discussing how my experience aligns with your needs.",
        selectedProjects: ["P-01", "P-02"],
        reasoning: "Fallback content used due to AI generation error"
      },
      success: false,
      error: error.message
    }
  };
}
```

**Test nodes 4-6:**
- Execute test workflow
- Verify Gemini returns valid JSON
- Check fallback works if JSON parsing fails

**Acceptance Criteria:**
- [ ] Prompt properly formatted
- [ ] Gemini API responds
- [ ] JSON parsing works
- [ ] Fallback content triggers on error

---

### Task 2.6: Build n8n Workflow - Part 3 (45 min)

**Node 7: Generate Slug (Function)**

```javascript
const company = $json.originalInput.companyName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const role = $json.originalInput.roleTitle
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 50);

const slug = `${company}-${role}`;

return {
  json: {
    ...$json,
    slug
  }
};
```

**Node 8: Map Project References (Function)**

```javascript
// Map project IDs to Sanity references
// You'll need to get actual Sanity document IDs for projects

const projectMapping = {
  "P-01": "project-p01-id",  // Replace with actual Sanity _id
  "P-02": "project-p02-id",
  "P-03": "project-p03-id",
  "P-04": "project-p04-id",
  "P-05": "project-p05-id"
};

const selectedProjects = $json.aiContent.selectedProjects || [];
const linkedProjects = selectedProjects.map(projectId => ({
  _type: "reference",
  _ref: projectMapping[projectId] || projectMapping["P-01"]
}));

return {
  json: {
    ...$json,
    linkedProjects
  }
};
```

**Node 9: Create Sanity Draft Document (HTTP Request)**

```
Method: POST
URL: https://{{ $env.SANITY_PROJECT_ID }}.api.sanity.io/v2021-06-07/data/mutate/{{ $env.SANITY_DATASET }}

Headers:
  Content-Type: application/json
  Authorization: Bearer {{ $env.SANITY_WRITE_TOKEN }}

Body (JSON):
{
  "mutations": [{
    "create": {
      "_type": "jobApplication",
      "slug": {
        "_type": "slug",
        "current": "{{ $json.slug }}"
      },
      "targetCompany": "{{ $json.originalInput.companyName }}",
      "targetRoleTitle": "{{ $json.aiContent.targetRoleTitle }}",
      "customIntroduction": "{{ $json.aiContent.customIntroduction }}",
      "cxDesignAlignment": {{ JSON.stringify($json.aiContent.cxDesignAlignment) }},
      "automationAndTechFit": {{ JSON.stringify($json.aiContent.automationAndTechFit) }},
      "closingStatement": "{{ $json.aiContent.closingStatement }}",
      "linkedProjects": {{ JSON.stringify($json.linkedProjects) }},
      "jobUrl": "{{ $json.originalInput.jobUrl }}",
      "yourNotes": "{{ $json.originalInput.notes }}",
      "priority": "{{ $json.originalInput.priority }}",
      "status": "ai-generated",
      "companyResearch": "{{ $json.aiContent.reasoning }}",
      "createdAt": "{{ $json.originalInput.timestamp }}"
    }
  }]
}

Options:
  - Timeout: 15000ms
```

**Node 10: Format Response (Function)**

```javascript
const sanityResponse = $json;
const documentId = sanityResponse.results?.[0]?.id || 'unknown';

return {
  json: {
    success: true,
    message: "Draft application created successfully",
    slug: $node['Generate Slug'].json.slug,
    documentId,
    sanityStudioUrl: `https://meljonesai.sanity.studio/desk/jobApplication;${documentId}`,
    aiSuccess: $node['Parse Gemini Response'].json.success,
    timestamp: new Date().toISOString()
  }
};
```

**Node 11: Respond to Webhook (Respond to Webhook node)**

```
Response Code: 200
Response Body: {{ JSON.stringify($json) }}
```

**Test complete workflow:**
```bash
curl -X POST https://your-n8n-url/webhook/generate-application \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your_secret" \
  -d '{
    "jobDescription": "We are looking for a Senior Product Designer...",
    "companyName": "Test Company",
    "roleTitle": "Senior Product Designer",
    "jobUrl": "https://example.com/job",
    "notes": "Interesting company",
    "priority": "high"
  }'
```

**Acceptance Criteria:**
- [ ] All nodes connected properly
- [ ] Workflow executes end-to-end
- [ ] Sanity draft document created
- [ ] Response returns success with Sanity URL
- [ ] No errors in n8n logs

---

## 📊 MILESTONE 3: SANITY SCHEMAS + PROJECTS
**Duration:** 1.5 hours  
**Goal:** Schemas defined with status field, all 5 projects added

### Task 3.1: Create Sanity Schemas (30 min)

```bash
# Priority: P0 - BLOCKING

cd sanity-studio
mkdir -p schemas
```

**Create `schemas/project.ts`:** (See PROJECT_SPEC_REVISED.md for full schema)

**Create `schemas/jobApplication.ts`:** (See PROJECT_SPEC_REVISED.md for full schema)

Key fields to include:
- status field with 5 options (ai-generated, in-review, approved, published, archived)
- companyResearch field for AI insights
- All other fields from spec

**Update `schemas/index.ts`:**

```typescript
import jobApplication from './jobApplication'
import project from './project'

export const schemaTypes = [project, jobApplication]
```

**Restart Sanity Studio:**
```bash
# Ctrl+C to stop, then:
npm run dev
```

**Verify in Studio:**
- Go to http://localhost:3333
- Should see "Project" and "Job Application" document types
- Try creating a test document

**Acceptance Criteria:**
- [ ] Both schemas created
- [ ] Schemas appear in Sanity Studio
- [ ] Can create test documents
- [ ] Status field has 5 options
- [ ] No TypeScript errors

---

### Task 3.2: Add 5 Projects (45 min)

**In Sanity Studio, create 5 project documents:**

**P-01:**
```
Project ID: P-01
Name: Pivot Platform
Focus: Product Strategy & User Research
Key Metric: Transformed near-zero user returns to active re-engagement
Year: 2023
```

**P-02:**
```
Project ID: P-02
Name: Future-Proof Foundation
Focus: Frontend Architecture & Design Systems
Key Metric: Saved 6+ months development time by building scalable Nuxt.js website
Year: 2022
```

**P-03:**
```
Project ID: P-03
Name: Ops Autopilot
Focus: Internal Tooling & Workflow Automation
Key Metric: Eliminated manual job matching process, enabling automated personalized recommendations
Year: 2023
```

**P-04:**
```
Project ID: P-04
Name: Knowledge Transfer Engine
Focus: Documentation & Systems Design
Key Metric: Reduced new volunteer onboarding from weeks to 20 minutes despite 80% team turnover
Year: 2024
```

**P-05:**
```
Project ID: P-05
Name: Career Stories Platform
Focus: AI-Assisted Full-Stack Development
Key Metric: Taking mission-driven platform from 0 to 1 using AI tools (Claude/n8n) to accelerate development
Year: 2025
```

**Get Sanity Document IDs:**
After creating each project, note its `_id` from the URL or document inspector.

Example: `project-p01-abc123def456`

**Update n8n workflow Node 8** with actual Sanity IDs.

**Acceptance Criteria:**
- [ ] All 5 projects created
- [ ] All fields populated
- [ ] Projects published (not draft)
- [ ] Document IDs recorded
- [ ] n8n workflow updated with IDs

---

### Task 3.3: Test Sanity API Access (15 min)

```bash
# Test that n8n can create documents

curl -X POST \
  "https://YOUR_PROJECT_ID.api.sanity.io/v2021-06-07/data/mutate/production" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WRITE_TOKEN" \
  -d '{
    "mutations": [{
      "create": {
        "_type": "jobApplication",
        "slug": { "current": "test-application" },
        "targetCompany": "Test Co",
        "targetRoleTitle": "Test Role",
        "customIntroduction": "Test intro",
        "cxDesignAlignment": ["test"],
        "automationAndTechFit": ["test"],
        "closingStatement": "test",
        "status": "ai-generated"
      }
    }]
  }'
```

**Should return success with document ID.**

**Delete test document in Sanity Studio.**

**Acceptance Criteria:**
- [ ] Can create documents via API
- [ ] Write token has correct permissions
- [ ] Test document deleted

---

## 💻 MILESTONE 4: ADMIN INTERFACE
**Duration:** 1.5 hours  
**Goal:** Form working, API route calling n8n

### Task 4.1: Create Admin Form Page (45 min)

**Create `web/src/app/admin/new/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    jobDescription: '',
    companyName: '',
    roleTitle: '',
    jobUrl: '',
    notes: '',
    priority: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate application');
      }

      // Redirect to Sanity Studio
      window.open(data.sanityStudioUrl, '_blank');
      
      // Show success message
      alert('Draft created! Check Sanity Studio to review.');
      
      // Reset form
      setFormData({
        jobDescription: '',
        companyName: '',
        roleTitle: '',
        jobUrl: '',
        notes: '',
        priority: 'medium'
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Create New Application</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Job Description *
          </label>
          <textarea
            required
            rows={10}
            value={formData.jobDescription}
            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
            className="w-full border rounded-lg p-3"
            placeholder="Paste the full job description here..."
          />
          <p className="text-sm text-gray-600 mt-1">
            {formData.jobDescription.length} characters
          </p>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Company Name *
          </label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full border rounded-lg p-3"
            placeholder="e.g., Atlassian"
          />
        </div>

        {/* Role Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Role Title *
          </label>
          <input
            type="text"
            required
            value={formData.roleTitle}
            onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
            className="w-full border rounded-lg p-3"
            placeholder="e.g., Senior Product Designer"
          />
        </div>

        {/* Job URL */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Job Posting URL
          </label>
          <input
            type="url"
            value={formData.jobUrl}
            onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
            className="w-full border rounded-lg p-3"
            placeholder="https://..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full border rounded-lg p-3"
            placeholder="Any thoughts or reminders about this application..."
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Priority *
          </label>
          <select
            required
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full border rounded-lg p-3"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Application'}
        </button>
      </form>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Form renders correctly
- [ ] All fields functional
- [ ] Validation works
- [ ] Loading state shows during submission
- [ ] Error messages display

---

### Task 4.2: Create API Route (30 min)

**Create `web/src/app/api/generate/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Firebase Auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    try {
      await adminAuth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const { jobDescription, companyName, roleTitle, jobUrl, notes, priority } = body;

    if (!jobDescription || !companyName || !roleTitle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3. Call n8n webhook
    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET!
      },
      body: JSON.stringify({
        jobDescription,
        companyName,
        roleTitle,
        jobUrl,
        notes,
        priority
      })
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      throw new Error(`n8n webhook failed: ${errorText}`);
    }

    const n8nData = await n8nResponse.json();

    // 4. Return success response
    return NextResponse.json({
      success: true,
      message: 'Application draft created successfully',
      sanityStudioUrl: n8nData.sanityStudioUrl,
      slug: n8nData.slug
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Update `web/src/app/admin/new/page.tsx` to send token:**

```typescript
// In handleSubmit function, add:
const user = auth.currentUser;
if (!user) {
  throw new Error('Not authenticated');
}
const token = await user.getIdToken();

const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(formData)
});
```

**Acceptance Criteria:**
- [ ] API route created
- [ ] Auth verification works
- [ ] Calls n8n webhook successfully
- [ ] Returns proper responses
- [ ] Error handling functional

---

### Task 4.3: Test End-to-End (15 min)

**Full test:**
1. Sign in at /login
2. Go to /admin/new
3. Fill out form with real job description
4. Submit
5. Verify:
   - Loading state shows
   - Success message appears
   - Sanity Studio opens in new tab
   - Draft document exists with status "ai-generated"
   - Content looks reasonable

**Acceptance Criteria:**
- [ ] Complete flow works
- [ ] Draft created in Sanity
- [ ] AI content generated
- [ ] Projects linked correctly
- [ ] Status set to "ai-generated"

---

## ✅ MILESTONE 5: END-TO-END TESTING
**Duration:** 45 minutes  
**Goal:** Verify full automation pipeline

### Task 5.1: Test Complete Workflow (30 min)

**Test scenario 1: High-priority application**
```
Company: Atlassian
Role: Senior Product Designer
Priority: High
Description: [Paste real Atlassian job description]
```

**Verify:**
- [ ] Form submits successfully
- [ ] n8n workflow executes
- [ ] Gemini generates content
- [ ] Draft created in Sanity
- [ ] Can edit in Sanity Studio
- [ ] Can change status to "in-review"
- [ ] Can publish document

**Test scenario 2: Error handling**
- Submit form with empty job description → should show validation error
- Submit with invalid auth token → should show 401 error
- Temporarily break n8n webhook → should show error message

**Acceptance Criteria:**
- [ ] Happy path works completely
- [ ] Error cases handled gracefully
- [ ] User gets clear feedback
- [ ] No data loss on errors

---

### Task 5.2: Update Public Pages (15 min)

**Update `web/src/app/[slug]/page.tsx` to only show published:**

```typescript
// Only fetch published applications
export async function generateStaticParams() {
  const slugs = await sanityFetch(
    `*[_type == "jobApplication" && status == "published"]{ 
      "slug": slug.current 
    }`
  )
  return slugs
}

export default async function ApplicationPage({ params }) {
  const app = await sanityFetch(
    `*[_type == "jobApplication" && slug.current == $slug && status == "published"][0]{
      ...,
      linkedProjects[]->
    }`,
    { slug: params.slug }
  )
  
  if (!app) {
    notFound()
  }
  
  // Render application...
}
```

**Test:**
1. Try accessing draft application → should 404
2. Publish application in Sanity
3. Wait for revalidation or trigger rebuild
4. Access published application → should work

**Acceptance Criteria:**
- [ ] Only published apps visible
- [ ] Drafts return 404
- [ ] Publishing workflow clear

---

## 📚 MILESTONE 6: DOCUMENTATION
**Duration:** 15 minutes  
**Goal:** Update README, create EOD docs

### Task 6.1: Update README (10 min)

**Add to README.md:**
- Firebase setup instructions
- n8n configuration steps
- Gemini API setup
- Environment variables list
- Testing instructions

**Acceptance Criteria:**
- [ ] README comprehensive
- [ ] Setup steps clear
- [ ] All env vars documented

---

### Task 6.2: Create EOD Docs (5 min)

**Following copilot-instructions.md Section V:**
- Create day_002_recall_questions.md
- Create day_002_linked_post_1.md (Technical: n8n + Gemini integration)
- Create day_002_linked_post_2.md (Product: Why automation is core value)

**Acceptance Criteria:**
- [ ] All 3 docs created
- [ ] Follow established format
- [ ] Cover key learnings

---

## 🎉 FINAL CHECKLIST

**MVP Complete when:**
- [ ] Can sign in with Firebase Auth
- [ ] Admin form works and is protected
- [ ] Form submits to n8n successfully
- [ ] n8n workflow generates AI content
- [ ] Gemini API responds with structured content
- [ ] Draft document created in Sanity
- [ ] Can review/edit in Sanity Studio
- [ ] Can publish applications
- [ ] Public site shows only published apps
- [ ] At least 1 real application created end-to-end
- [ ] Documentation updated
- [ ] Code committed to Git

---

**STATUS:** Ready for execution with full automation

**First command:** `cd ~/Work/meljonesai && npm run studio:dev`

**Good luck! 🚀 Focus on n8n workflow - it's the critical path.**
