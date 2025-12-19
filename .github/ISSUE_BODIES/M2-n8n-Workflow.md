Title: M2 — n8n Workflow Implementation (Phase 2)

Description

⚠️ **Phase 2 Milestone** — This milestone has been moved to Phase 2 of the project roadmap.

**Phase Dependency:** This milestone now depends on M3 (Sanity Schemas) being completed first, as the workflow needs to populate the updated schema structure.

This issue implements Milestone 2: the n8n automation workflow that receives admin form data, calls Gemini, and creates a Sanity draft using the Phase 2 schema structure. It contains the node-level tasks, integration details, deliverables, and relevant decisions.

Robust instructions (from Copilot guide)

- Workflow nodes and responsibilities:

  1. Webhook Trigger - receive job application data
  2. Validate Input - check required fields (jobDescription, companyName, roleTitle)
  3. Company Research - optional enrichment (non-blocking, populates researchContext)
  4. Prepare Prompt - build Gemini prompt ensuring JSON-only output with Phase 2 structure
  5. Gemini API Call - call Gemini 2.0 Flash (generativelanguage API)
  6. Parse Response - extract and parse JSON from model output
  7. Map to Sanity - construct `jobApplication` Sanity document with Phase 2 fields
  8. Create Draft - Sanity mutate API to create draft with status='ai-generated'
  9. Send Notification - optional notification on success
  10. Error Handler - capture and log workflow failures
  11. Response - return success/error to the client

- Implementation details:
  - Save each Function-node's code to source-controlled files (e.g. `automation/n8n/nodes/`) for version history.
  - For the Gemini step use the REST endpoint described in the guide and include `?key={{ $env.GEMINI_API_KEY }}`.
  - Parse model output carefully: remove code fences and parse JSON; validate required fields before continuing.
  - Keep company research non-blocking: if it fails, proceed with minimal researchContext placeholders.
  - Use environment variables in n8n for sensitive values: `GEMINI_API_KEY`, `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_TOKEN`.
  
- Phase 2 Schema Structure:
  - **alignmentPoints**: Array of objects with `{ category: string, content: text }`
    - Categories: 'cx-design', 'automation', 'technical', 'general'
    - Replaces the old `cxDesignAlignment` and `automationAndTechFit` arrays
    - Minimum 2 items required
  - **researchContext**: Object containing structured company research inputs
    - `painPoints`: array of text — Company/role challenges identified during research
    - `keywords`: array of text — Key terms, technologies, values to emphasize
    - `proofPoints`: array of text — Evidence/metrics to highlight in application
    - `notes`: optional text field for additional context
  - **status**: Must be set to 'ai-generated' for all workflow-created drafts
  - **linkedProjects**: Array of project references, max 3 items

Key deliverables

- Exported n8n workflow JSON (e.g. `automation/n8n/workflows/job-to-application.json`) using Phase 2 schema
- Node function code saved under `automation/n8n/nodes/` (validation, prompt builder, parser, mapper)
- Updated prompts that instruct Gemini to generate the Phase 2 structure
- Documentation in the issue describing how to run and test the workflow locally or on the Hostinger instance

Important pragmatic decisions

- n8n will be self-hosted (Hostinger VPS) for the MVP. This affects webhook URLs and environment management.
- Gemini model: use `gemini-2.0-flash` as chosen in the project guide.
- Keep the workflow tolerant: avoid failing the entire pipeline for non-critical enrichment (company research).

Checklist

- [ ] Implement each node and save code artifacts
- [ ] Export workflow JSON and commit to repo
- [ ] Configure environment variables in the n8n host
- [ ] Test end-to-end: admin form → n8n → Gemini → Sanity draft
- [ ] Add error handling and logging
