# n8n Workflows

This directory contains n8n workflow definitions for the MelJonesAI automation pipeline.

## Workflows

### job-to-application-phase2.json

**Phase 2 workflow** that automates job application generation using Gemini API.

**Flow:**
1. Receives webhook POST with job description, company name, and role title
2. Validates input fields
3. Optionally researches company (non-blocking)
4. Prepares structured prompt for Gemini API
5. Calls Gemini 2.0 Flash to generate application content
6. Parses JSON response
7. Generates URL-friendly slug
8. Maps project references
9. Creates draft in Sanity CMS with status `ai-generated`
10. Returns success response

**Required Environment Variables:**
```bash
GEMINI_API_KEY           # Google AI API key for Gemini
SANITY_PROJECT_ID        # Sanity project ID
SANITY_DATASET          # Sanity dataset (usually 'production')
SANITY_TOKEN            # Sanity write token
SANITY_API_VERSION      # Optional, defaults to '2023-05-03'
```

**Webhook Endpoint:**
```
POST https://your-n8n-instance/webhook/job-to-application
```

**Request Body:**
```json
{
  "jobDescription": "Full job description text...",
  "companyName": "Acme Corporation",
  "roleTitle": "Senior UX Designer",
  "companyWebsite": "https://acme.com" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "slug": "acme-corporation-senior-ux-designer",
  "message": "Application draft created successfully",
  "status": "ai-generated"
}
```

## Node Functions

Extracted function code is stored in `automation/n8n/nodes/` for version control:

- **validate-input.js** - Validates required webhook fields
- **prepare-prompt.js** - Builds Gemini API prompt with Phase 2 structure
- **parse-response.js** - Extracts and validates JSON from Gemini response
- **generate-slug.js** - Creates URL-friendly slug
- **map-project-references.js** - Converts project IDs to Sanity references
- **format-response.js** - Formats success response

These files serve as documentation and backup. The actual code runs inside n8n's function nodes.

## Phase 2 Schema Structure

The workflow generates applications using the Phase 2 schema:

### alignmentPoints
Array of objects with structured alignment bullets:
```javascript
[
  { category: "cx-design", content: "Bullet point text" },
  { category: "automation", content: "Bullet point text" },
  { category: "technical", content: "Bullet point text" }
]
```

**Categories:**
- `cx-design` - User experience, design thinking, product strategy
- `automation` - Process automation, workflow optimization
- `technical` - Technical skills, tools, technologies
- `general` - General fit, culture, values

### researchContext
Structured object for company research inputs:
```javascript
{
  painPoints: ["Challenge 1", "Challenge 2"],
  keywords: ["keyword1", "keyword2", "keyword3"],
  proofPoints: ["metric1", "metric2"],
  notes: "Optional additional context"
}
```

## Installation

1. **Import workflow to n8n:**
   - Open n8n interface
   - Go to Workflows → Import from File
   - Select `job-to-application-phase2.json`

2. **Configure environment variables:**
   - Go to Settings → Environments
   - Add all required variables listed above

3. **Activate workflow:**
   - Click "Active" toggle in workflow editor
   - Test with sample webhook request

## Testing Locally

```bash
# Test webhook (replace URL with your n8n instance)
curl -X POST https://your-n8n-instance/webhook/job-to-application \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "We are looking for a Senior UX Designer...",
    "companyName": "Test Company",
    "roleTitle": "Senior UX Designer"
  }'
```

Expected response:
```json
{
  "success": true,
  "slug": "test-company-senior-ux-designer",
  "message": "Application draft created successfully",
  "status": "ai-generated"
}
```

## Error Handling

The workflow includes:
- Input validation (throws error if required fields missing)
- Non-blocking company research (continues on failure)
- JSON parsing with fallback for malformed responses
- Field validation warnings logged to console
- Comprehensive error messages in responses

## Version History

- **v2.0 (Phase 2)** - Updated schema with alignmentPoints and researchContext
- **v1.0** - Original workflow with flat field structure (deprecated)

## Dependencies

- **M3 (Sanity Schemas)** - Schema must be deployed before running this workflow
- **Gemini API** - Requires valid API key with sufficient quota
- **Sanity CMS** - Requires project with write permissions

## See Also

- [M2 Specification](../../.github/ISSUE_BODIES/M2-n8n-Workflow.md)
- [M3 Specification](../../.github/ISSUE_BODIES/M3-Sanity-Schemas.md)
- [COPILOT_GUIDE](../../.github/copilot-instructions.md)
