# Automation Directory

This directory contains automation workflows and related documentation for the MelJonesAI project.

## Directory Structure

```
automation/
├── n8n/
│   ├── workflows/
│   │   ├── job-to-application-phase2.json  ✅ Current (v2.0)
│   │   └── job-to-application.json          ⚠️  Deprecated (v1.0)
│   ├── nodes/
│   │   ├── validate-input.js
│   │   ├── prepare-prompt.js
│   │   ├── parse-response.js
│   │   ├── generate-slug.js
│   │   ├── map-project-references.js
│   │   └── format-response.js
│   └── README.md                            📖 Workflow documentation
├── M2_IMPLEMENTATION_SUMMARY.md             📊 Implementation overview
├── MIGRATION_NOTES.md                       🔄 Schema migration guide
└── README.md                                👈 You are here
```

## Quick Start

### For Phase 1 (Manual Content - Current)

Phase 1 **does not require** n8n automation. Skip this directory and focus on:
1. Implementing Sanity schemas (M3)
2. Creating content manually in Sanity Studio
3. Deploying the public site (M6a)

### For Phase 2 (Automation - Future)

1. **Read the documentation:**
   - [M2 Implementation Summary](M2_IMPLEMENTATION_SUMMARY.md) - Overview of changes
   - [Migration Notes](MIGRATION_NOTES.md) - Schema evolution details
   - [n8n Workflow README](n8n/README.md) - Setup and testing guide

2. **Deploy n8n:**
   - Install n8n on your Hostinger VPS
   - Import `n8n/workflows/job-to-application-phase2.json`
   - Configure environment variables (see below)

3. **Test the workflow:**
   ```bash
   # Test webhook
   curl -X POST https://your-n8n-instance/webhook/job-to-application \
     -H "Content-Type: application/json" \
     -d '{
       "jobDescription": "We are looking for...",
       "companyName": "Acme Corp",
       "roleTitle": "Senior Designer"
     }'
   ```

## Environment Variables

Required for Phase 2 automation:

```bash
GEMINI_API_KEY           # Google AI API key for Gemini
SANITY_PROJECT_ID        # Sanity project ID
SANITY_DATASET          # Sanity dataset (usually 'production')
SANITY_TOKEN            # Sanity write token
SANITY_API_VERSION      # Optional, defaults to '2023-05-03'
```

## Schema Versions

### v1.0 (Deprecated)

Original flat structure with hardcoded categories:

```javascript
{
  cxDesignAlignment: ["bullet 1", "bullet 2"],
  automationAndTechFit: ["bullet 1", "bullet 2"],
  companyResearch: "text blob"
}
```

**Status:** ⚠️ Deprecated - Do not use for new applications

### v2.0 (Current - Phase 2)

Flexible object-based structure:

```javascript
{
  alignmentPoints: [
    { category: "cx-design", content: "bullet 1" },
    { category: "automation", content: "bullet 2" },
    { category: "technical", content: "bullet 3" }
  ],
  researchContext: {
    painPoints: ["Challenge 1", "Challenge 2"],
    keywords: ["keyword1", "keyword2"],
    proofPoints: ["metric1", "metric2"],
    notes: "Optional context"
  }
}
```

**Status:** ✅ Current - Use for all new implementations

## Key Documents

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [M2_IMPLEMENTATION_SUMMARY.md](M2_IMPLEMENTATION_SUMMARY.md) | Complete overview of Phase 2 changes | Start here for context |
| [MIGRATION_NOTES.md](MIGRATION_NOTES.md) | Schema migration guide | When migrating existing data |
| [n8n/README.md](n8n/README.md) | Workflow setup and testing | When deploying n8n |
| [n8n/nodes/*.js](n8n/nodes/) | Node function source code | For debugging or customization |

## Phase Dependencies

```
Phase 1 (MVP):
  M1 (Auth) → M3 (Schemas) → M6a (Deploy)
  
Phase 2 (Automation):
  M3 (Schemas) → M2 (n8n) → M4 (Admin UI) → M5 (Testing) → M6b (Deploy)
                   ↑
                You are here
```

## Workflow Features

The Phase 2 workflow includes:

✅ Input validation  
✅ Non-blocking company research  
✅ Gemini 2.0 Flash API integration  
✅ Structured JSON output with validation  
✅ Automatic slug generation  
✅ Project reference mapping (max 3)  
✅ Sanity draft creation  
✅ Error handling and logging  

## Support

### Issues & Questions

See the GitHub issue tracker:
- [Issue #48: M2 n8n Workflow (Phase 2)](https://github.com/MoodyBones/meljonesai/issues/48)
- [Issue #47: M3 Sanity Schemas](https://github.com/MoodyBones/meljonesai/issues/47)

### Related Documentation

- [Technical Reference](../docs/REFERENCE.md)
- [M2 Specification](../.github/ISSUE_BODIES/M2-n8n-Workflow.md)
- [M3 Specification](../.github/ISSUE_BODIES/M3-Sanity-Schemas.md)

## Contributing

When modifying workflows:

1. **Update node files** in `n8n/nodes/` first
2. **Update workflow JSON** to reference changes
3. **Test thoroughly** before deploying
4. **Document changes** in relevant README files
5. **Update version numbers** appropriately

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v2.0 | 2025-12-19 | Phase 2 schema with alignmentPoints + researchContext |
| v1.0 | 2025-11-XX | Initial workflow with flat schema (deprecated) |

## License

MIT - See [LICENSE](../LICENSE) for details
