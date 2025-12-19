# Migration Notes: Phase 1 to Phase 2 Schema

## Overview

The project has evolved from a flat schema structure to a more maintainable object-based design in Phase 2.

## Schema Changes

### Old Structure (v1.0 - Deprecated)

```javascript
{
  cxDesignAlignment: ["bullet 1", "bullet 2", "bullet 3"],
  automationAndTechFit: ["bullet 1", "bullet 2"],
  companyResearch: "Text blob of research notes",
  linkedProjects: [{ _ref: "P-01" }]  // max 2
}
```

### New Structure (v2.0 - Phase 2)

```javascript
{
  alignmentPoints: [
    { category: "cx-design", content: "bullet 1" },
    { category: "automation", content: "bullet 2" },
    { category: "technical", content: "bullet 3" }
  ],
  researchContext: {
    painPoints: ["Challenge 1", "Challenge 2"],
    keywords: ["keyword1", "keyword2", "keyword3"],
    proofPoints: ["metric1", "metric2"],
    notes: "Optional additional context"
  },
  linkedProjects: [{ _ref: "P-01" }]  // max 3
}
```

## Why This Change?

### Problem with Old Structure

1. **Rigid categorization**: Two hardcoded arrays (`cxDesignAlignment`, `automationAndTechFit`) couldn't handle other categories
2. **Unstructured research**: `companyResearch` was a text blob, hard to parse or query
3. **Limited flexibility**: Adding new categories required schema changes

### Benefits of New Structure

1. **Flexible categories**: `alignmentPoints` supports any category (`cx-design`, `automation`, `technical`, `general`)
2. **Structured research**: `researchContext` breaks research into queryable components
3. **Clear separation**: Research inputs vs. display outputs
4. **Better maintainability**: Easier to add fields or categories

## Migration Path

### For Existing Data

If you have existing job applications in Sanity with the old schema:

1. **Manual migration** (recommended for small datasets):
   - Open each document in Sanity Studio
   - Manually restructure fields
   - Delete old fields after verification

2. **Automated migration** (for large datasets):
   - Create a migration script using Sanity Migration Toolkit
   - Map old fields to new structure
   - Test on a copy of your dataset first

### Example Migration Script

```javascript
// Example Sanity migration (not production-ready)
import { getCliClient } from 'sanity/cli'

const client = getCliClient()

async function migrateJobApplication(doc) {
  // Convert old arrays to new structure
  const alignmentPoints = [
    ...(doc.cxDesignAlignment || []).map(content => ({
      category: 'cx-design',
      content
    })),
    ...(doc.automationAndTechFit || []).map(content => ({
      category: 'automation',
      content
    }))
  ]

  // Convert companyResearch to researchContext
  const researchContext = {
    painPoints: [],
    keywords: [],
    proofPoints: [],
    notes: doc.companyResearch || ''
  }

  // Return migration
  return {
    ...doc,
    alignmentPoints,
    researchContext,
    // Remove old fields (optional)
    cxDesignAlignment: undefined,
    automationAndTechFit: undefined,
    companyResearch: undefined
  }
}
```

## Backward Compatibility

### Old Workflow (v1.0)

File: `automation/n8n/workflows/job-to-application.json`

- **Status**: Deprecated
- **Still functional**: Yes, but creates documents with old schema
- **Recommendation**: Do not use for new applications
- **Purpose**: Reference only, historical record

### New Workflow (v2.0)

File: `automation/n8n/workflows/job-to-application-phase2.json`

- **Status**: Current
- **Use for**: All new applications in Phase 2
- **Schema**: Fully compliant with Phase 2 structure

## Phase Considerations

### Phase 1 (Manual Curation)

- Users manually populate `researchContext` and content fields in Sanity Studio
- Status defaults to `draft`
- No workflow automation needed

### Phase 2 (AI Automation)

- n8n workflow populates all fields via Gemini API
- Status set to `ai-generated`
- Requires workflow deployment

## Rollout Strategy

1. **Update schemas first** (M3)
2. **Deploy updated Sanity Studio**
3. **Test schema in Studio manually**
4. **Deploy Phase 2 workflow** (M2) when ready
5. **Keep old workflow disabled** as reference

## Questions?

See:
- [M2 Specification](.github/ISSUE_BODIES/M2-n8n-Workflow.md)
- [M3 Specification](.github/ISSUE_BODIES/M3-Sanity-Schemas.md)
- [Technical Reference](docs/REFERENCE.md)
