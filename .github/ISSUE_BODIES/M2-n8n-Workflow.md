Title: M2 — n8n Workflow Implementation (11-node automation)

Description

This issue implements Milestone 2: the n8n automation workflow that receives admin form data, calls Gemini, and creates a Sanity draft. It contains the node-level tasks, integration details, deliverables, and relevant decisions.

Robust instructions (from Copilot guide)

- Workflow nodes and responsibilities:

  1. Webhook Trigger - receive job application data
  2. Validate Input - check required fields (jobDescription, companyName, roleTitle)
  3. Company Research - optional enrichment (non-blocking)
  4. Prepare Prompt - build Gemini prompt ensuring JSON-only output
  5. Gemini API Call - call Gemini 2.0 Flash (generativelanguage API)
  6. Parse Response - extract and parse JSON from model output
  7. Map to Sanity - construct `jobApplication` Sanity document
  8. Create Draft - Sanity mutate API to create draft
  9. Send Notification - optional notification on success
  10. Error Handler - capture and log workflow failures
  11. Response - return success/error to the client

- Implementation details:
  - Save each Function-node's code to source-controlled files (e.g. `n8n-nodes/`) for version history.
  - For the Gemini step use the REST endpoint described in the guide and include `?key={{ $env.GEMINI_API_KEY }}`.
  - Parse model output carefully: remove code fences and parse JSON; validate required fields before continuing.
  - Keep company research non-blocking: if it fails, proceed with placeholders.
  - Use environment variables in n8n for sensitive values: `GEMINI_API_KEY`, `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_TOKEN`.

Key deliverables

- Exported n8n workflow JSON (e.g. `automation/n8n/workflows/job-to-application.json`)
- Node function code saved under `n8n-nodes/` (validation, prompt builder, parser, mapper)
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
