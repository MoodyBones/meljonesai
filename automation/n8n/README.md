# n8n Workflows

Automation workflows for MelJonesAI content generation.

## Workflow: Job Application Generator

**Live endpoint:** `https://n8n.goodsomeday.com/webhook/job-application`

**Flow (6 nodes):**
```
Webhook → Wait (1s) → Gemini → Parse → Sanity → Response
```

### Request

```bash
curl -X POST https://n8n.goodsomeday.com/webhook/job-application \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Canva",
    "roleTitle": "Senior Frontend Engineer",
    "jobDescription": "We are looking for..."
  }'
```

### Response

```json
{
  "success": true,
  "message": "Draft created",
  "company": "Canva",
  "role": "Frontend Engineer, Design Systems",
  "studioUrl": "https://meljonesai.sanity.studio/structure/jobApplication;..."
}
```

## Nodes

| # | Node | Purpose |
|---|------|---------|
| 1 | Receive Job Description | Webhook trigger |
| 2 | Rate Limit Buffer | 1 second wait (Gemini free tier) |
| 3 | Generate Content | Gemini 2.5 Flash API call |
| 4 | Parse Response | Extract JSON, generate slug |
| 5 | Create Sanity Draft | Mutation API |
| 6 | Return Success | Webhook response |

## Gemini Prompt

Uses context from `.gemini/CONTEXT_CONTENT_GEN.md`:
- Voice & tone guidelines
- Skill matrix
- Project evidence table (P-01 to P-05)

## Rate Limits (Gemini 2.5 Flash Free Tier)

| Limit | Value |
|-------|-------|
| RPD | 1,500/day |
| RPM | 15/minute |
| TPM | 1M tokens/minute |

The 1-second wait node provides buffer. For bulk processing (>15 jobs), enable batching.
