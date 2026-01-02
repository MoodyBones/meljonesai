# n8n Workflows

Automation workflows for MelJonesAI content generation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Workflow 1: Profile Builder (Agent 1)                      │
│  Trigger: POST /webhook/build-profile                       │
│                                                             │
│  Sanity Projects → Gemini Analysis → Patch Profile          │
│  (preserves human-authored fields, regenerates AI fields)   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Workflow 2: Job Matcher (Agent 2)                          │
│  Trigger: POST /webhook/match-job                           │
│                                                             │
│  Job Description + Profile → Gemini Matching → Branch       │
│     ├── MATCH (70%+)   → Create jobApplication              │
│     ├── PARTIAL (40-70%) → Create with gaps noted           │
│     └── REJECT (<40%)  → Return explanation (no document)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Workflow 1: Profile Builder

**Endpoint:** `POST https://n8n.goodsomeday.com/webhook/build-profile`

**Purpose:** Analyse all projects and update the profile's AI-derived fields.

### Request

```bash
curl -X POST https://n8n.goodsomeday.com/webhook/build-profile
```

No body required — fetches projects from Sanity.

### Response

```json
{
  "success": true,
  "message": "Profile analysed",
  "profileId": "profile-main",
  "capabilitiesFound": 5,
  "analysedAt": "2025-01-02T10:30:00Z"
}
```

### Nodes (8)

| # | Node | Purpose |
|---|------|---------|
| 1 | Trigger Build | Webhook trigger |
| 2 | Fetch Projects | Get all projects from Sanity |
| 3 | Fetch Existing Profile | Get current profile (human fields) |
| 4 | Merge Data | Combine for processing |
| 5 | Rate Limit Buffer | 1 second wait |
| 6 | Analyse with Gemini | Agent 1 prompt |
| 7 | Parse & Build Patch | Extract AI fields |
| 8 | Patch Profile | Update only AI fields in Sanity |

---

## Workflow 2: Job Matcher

**Endpoint:** `POST https://n8n.goodsomeday.com/webhook/match-job`

**Purpose:** Compare job against profile, score fit, generate content or reject.

### Request

```bash
curl -X POST https://n8n.goodsomeday.com/webhook/match-job \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Canva",
    "roleTitle": "Senior Frontend Engineer",
    "jobUrl": "https://...",
    "jobDescription": "We are looking for..."
  }'
```

### Response (MATCH)

```json
{
  "success": true,
  "matchCategory": "match",
  "matchScore": 85,
  "company": "Canva",
  "role": "Senior Frontend Engineer",
  "studioUrl": "https://meljonesai.sanity.studio/structure/jobApplication;drafts.canva-senior-frontend-engineer-abc123"
}
```

### Response (PARTIAL)

```json
{
  "success": true,
  "matchCategory": "partial",
  "matchScore": 55,
  "gaps": [
    {
      "requirement": "5 years React",
      "gap": "3 years Next.js",
      "reframe": "Modern React architecture including App Router"
    }
  ],
  "message": "Review gaps before publishing"
}
```

### Response (REJECT)

```json
{
  "success": false,
  "matchCategory": "reject",
  "matchScore": 25,
  "reason": "Role requires on-site Sydney, conflicts with remote requirement",
  "dealBreakersTriggered": [],
  "requirementsNotMet": ["Remote or hybrid"],
  "notNow": false,
  "message": "No application created"
}
```

### Nodes (11)

| # | Node | Purpose |
|---|------|---------|
| 1 | Receive Job | Webhook trigger |
| 2 | Fetch Profile | Get complete profile |
| 3 | Rate Limit Buffer | 1 second wait |
| 4 | Match with Gemini | Agent 2 prompt |
| 5 | Parse Response | Extract match result |
| 6 | Branch by Category | Switch on MATCH/PARTIAL/REJECT |
| 7 | Create Application (MATCH) | Sanity mutation |
| 8 | Create Application (PARTIAL) | Sanity mutation with gaps |
| 9 | Return MATCH | Success response |
| 10 | Return PARTIAL | Success with gaps |
| 11 | Return REJECT | Rejection explanation |

---

## Rate Limits (Gemini 2.5 Flash Free Tier)

| Limit | Value |
|-------|-------|
| RPD | 1,500/day |
| RPM | 15/minute |
| TPM | 1M tokens/minute |

Both workflows include 1-second wait nodes.

---

## Setup

1. Import workflows into n8n
2. Replace `YOUR_GEMINI_API_KEY` with actual key
3. Replace `YOUR_SANITY_TOKEN` with actual token
4. Activate workflows

---

## Legacy Workflow

`job-to-application.json` — Original single-agent workflow (deprecated, kept for reference).
