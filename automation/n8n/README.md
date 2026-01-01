# n8n Workflows

Automation workflows for MelJonesAI content generation.

## Workflows

### job-to-application.json

Generates job application content from a job description.

**Flow:**
```
Webhook → Gemini API → Sanity Draft → Response
```

**Webhook expects POST with:**
```json
{
  "companyName": "Acme Corp",
  "roleTitle": "Senior Frontend Developer",
  "jobDescription": "We are looking for..."
}
```

**Returns:**
```json
{
  "success": true,
  "message": "Application draft created successfully",
  "sanityId": "drafts.acme-corp-senior-frontend-developer",
  "company": "Acme Corp",
  "role": "Senior Frontend Developer",
  "studioUrl": "https://meljonesai.sanity.studio/structure/jobApplication;..."
}
```

## Setup

1. Import `job-to-application.json` into n8n
2. Replace `YOUR_GEMINI_API_KEY` in the "Generate Introduction" node
3. Replace `YOUR_SANITY_TOKEN` in the "Create Sanity Draft" node
4. Activate the workflow
5. Copy the production webhook URL

## Credentials Required

| Credential | Where to get it |
|------------|-----------------|
| Gemini API Key | [Google AI Studio](https://aistudio.google.com/apikey) |
| Sanity Token | [sanity.io/manage](https://sanity.io/manage) → API → Tokens (Editor role) |
