Title: M3 — Sanity CMS Schemas

Description

This issue implements Milestone 3: Sanity schemas for `jobApplication` and `project` (Sanity v3). It includes field specs, validation, preview configuration, and deliverables.

Robust instructions (from Copilot guide)

- Schema requirements for `jobApplication` (Phase 2 structure):

  - Document type: `jobApplication`
  - Fields:
    - slug (type: slug, from: [targetCompany, targetRoleTitle])
    - targetCompany (string, required)
    - targetRoleTitle (string, required)
    - customIntroduction (text, required, rows: 4) — min length validation (e.g. 50 chars)
    - alignmentPoints (array of objects) — min 2 items
      - Each item: { category: string, content: text }
      - Categories: 'cx-design', 'automation', 'technical', 'general'
    - closingStatement (text, required)
    - linkedProjects (array of references to `project`, max 3)
    - researchContext (object) — Research inputs (supports both manual and AI workflows)
      - painPoints: array of text — Company/role challenges identified
      - keywords: array of text — Key terms, technologies, values
      - proofPoints: array of text — Evidence/metrics to highlight
      - notes: text (optional) — Additional research notes
    - jobUrl (url)
    - yourNotes (text)
    - priority (string: high/medium/low, default medium)
    - status (string: draft, ai-generated, in-review, approved, published, archived; default draft)
    - createdAt (datetime)
    - publishedAt (datetime)
  - Preview: show `targetCompany` and `targetRoleTitle`.
  
  **Note:** This replaces the old `cxDesignAlignment` and `automationAndTechFit` arrays with a unified `alignmentPoints` structure, and moves company research into a structured `researchContext` object.
  
  **Phase Considerations:**
  - Phase 1 (Manual): Status defaults to `draft`. Users manually populate `researchContext` and content fields.
  - Phase 2 (Automated): n8n workflow sets status to `ai-generated` and populates all fields via Gemini API.

- Schema requirements for `project`:
  - Document type: `project`
  - Fields:
    - name (string, required)
    - projectId (string, unique, e.g., P-01)
    - focus (string)
    - keyMetric (text)
    - technologies (array of strings)
    - year (string)
    - description (text)
  - Preview: show name and projectId

Key deliverables

- `sanity-studio/schemas/jobApplication.ts`
- `sanity-studio/schemas/project.ts`
- `sanity-studio/schemas/index.ts` that exports `schemaTypes`

Important pragmatic decisions

- Sanity Studio is v3 (desk-tool); structure follows v3 conventions.
- Content lifecycle states used across the project: `ai-generated`, `in-review`, `approved`, `published`, `archived`.

Checklist

- [ ] Implement jobApplication schema with validation
- [ ] Implement project schema
- [ ] Export schemas in `index.ts`
- [ ] Test in Sanity Studio locally
