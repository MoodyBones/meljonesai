Title: M2 — n8n Workflow Implementation (Phase 2)

## Description

**Phase:** 2 (Scale)
**Status:** Planned
**Dependencies:** M3 (Sanity schemas must exist)

This milestone implements the n8n automation workflow that receives admin form data, calls Gemini for content generation, and creates a Sanity draft. This is Phase 2 work—the MVP ships first with manually curated content.

---

## Why Phase 2?

The "Career Storytelling" strategy prioritises:
1. **Phase 1:** Ship one polished page with manually curated content (demonstrates craft)
2. **Phase 2:** Add automation to scale (demonstrates systems thinking)

The automation becomes "invisible infrastructure—mentioned if asked, not featured." The visible output is the polished page.

---

## Workflow Overview

**11-node workflow:**

```
┌─────────────────────────────────────────────────────────────┐
│  1. Webhook Trigger                                          │
│     - Receive POST from /api/trigger-workflow                │
│     - Verify N8N_WEBHOOK_SECRET                              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Validate Input                                           │
│     - Check required: jobDescription, companyName, roleTitle │
│     - Return 400 if missing                                  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Company Research (non-blocking)                          │
│     - HTTP request to company website                        │
│     - Extract key info (About, Products, Culture)            │
│     - On failure: use placeholders, continue                 │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Prepare Prompt                                           │
│     - Combine: job description + company research + portfolio│
│     - Structure for JSON-only output                         │
│     - Include researchContext fields in expected output      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Gemini API Call                                          │
│     - POST to generativelanguage.googleapis.com              │
│     - Model: gemini-2.0-flash                                │
│     - Temperature: 0.7                                       │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Parse Response                                           │
│     - Strip code fences if present                           │
│     - Parse JSON                                             │
│     - Validate required fields                               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  7. Map to Sanity Schema                                     │
│     - Generate slug from company + role                      │
│     - Map AI output to jobApplication fields                 │
│     - Include researchContext object                         │
│     - Set status: "ai-generated"                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  8. Create Sanity Draft                                      │
│     - POST to Sanity mutations API                           │
│     - Create draft document                                  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  9. Send Notification (optional)                             │
│     - Email or webhook on success                            │
│     - Include Sanity Studio link                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  10. Error Handler                                           │
│      - Catch failures from any node                          │
│      - Log error details                                     │
│      - Continue to response node                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  11. Response                                                │
│      - Return success: { status, sanityUrl }                 │
│      - Return error: { status, message }                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Gemini Prompt Structure

The prompt should instruct Gemini to output JSON matching the Sanity schema:

```json
{
  "researchContext": {
    "companyPainPoints": ["..."],
    "roleKeywords": ["..."],
    "proofPoints": [
      {
        "claim": "...",
        "evidence": "...",
        "relevance": "..."
      }
    ],
    "companyResearch": "...",
    "toneAdjustments": "warm"
  },
  "customIntroduction": "...",
  "alignmentPoints": [
    {
      "heading": "...",
      "body": "..."
    }
  ],
  "closingStatement": "...",
  "linkedProjects": ["P-01", "P-03"]
}
```

---

## Key Deliverables

- `automation/n8n/workflows/job-to-application.json` — Exported workflow
- `automation/n8n/nodes/` — Source-controlled function code
  - `validate-input.js`
  - `prepare-prompt.js`
  - `parse-response.js`
  - `map-to-sanity.js`
- Documentation for local testing and Hostinger deployment

---

## Environment Variables (n8n)

```bash
GEMINI_API_KEY          # Google AI API key
SANITY_PROJECT_ID       # Sanity project ID
SANITY_DATASET          # production
SANITY_TOKEN            # Write token
N8N_WEBHOOK_SECRET      # Shared secret with Next.js
```

---

## Implementation Notes

### Tolerant workflow design

- Company research is non-blocking: if scraping fails, use placeholders
- Gemini response parsing handles code fences and malformed JSON
- Error handler captures failures without crashing workflow

### Schema alignment

The workflow must populate the same schema defined in M3:
- `researchContext` object with all sub-fields
- `alignmentPoints` array (not cxDesignAlignment/automationAndTechFit)
- Status set to `ai-generated` (Phase 2 entry point)

### Project selection

The prompt should include your portfolio projects so Gemini can select the most relevant 2-3 for `linkedProjects`. Pass project IDs (P-01, P-02, etc.) and brief descriptions.

---

## Testing Checklist

- [ ] Webhook receives POST and validates secret
- [ ] Input validation rejects incomplete requests
- [ ] Company research works or fails gracefully
- [ ] Gemini returns parseable JSON
- [ ] Sanity draft created with correct schema
- [ ] Status is set to "ai-generated"
- [ ] Error scenarios return proper error responses
- [ ] End-to-end: admin form → n8n → Sanity draft

---

## Definition of Done

- [ ] All 11 nodes implemented
- [ ] Workflow JSON exported and committed
- [ ] Function code source-controlled
- [ ] Environment variables documented
- [ ] Local testing verified
- [ ] Hostinger deployment documented
- [ ] Integration with M4 (admin interface) tested
