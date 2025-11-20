Title: M3 — Sanity CMS Schemas

Description

This issue implements Milestone 3: Sanity schemas for `jobApplication` and `project` (Sanity v3). It includes field specs, validation, preview configuration, and deliverables.

Robust instructions (from Copilot guide)

- Schema requirements for `jobApplication`:

  - Document type: `jobApplication`
  - Fields:
    - slug (type: slug, from: [targetCompany, targetRoleTitle])
    - targetCompany (string, required)
    - targetRoleTitle (string, required)
    - customIntroduction (text, required, rows: 4) — min length validation (e.g. 50 chars)
    - cxDesignAlignment (array of text objects) — min 2 items
    - automationAndTechFit (array of text objects) — min 2 items
    - closingStatement (text, required)
    - linkedProjects (array of references to `project`, max 2)
    - jobUrl (url)
    - yourNotes (text)
    - priority (string: high/medium/low, default medium)
    - status (string: ai-generated, in-review, approved, published, archived; default ai-generated)
    - companyResearch (text)
    - createdAt (datetime)
    - publishedAt (datetime)
  - Preview: show `targetCompany` and `targetRoleTitle`.

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
