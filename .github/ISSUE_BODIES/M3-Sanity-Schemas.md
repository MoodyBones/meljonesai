Title: M3 — Sanity CMS Schemas (Phase 1)

## Description

This issue implements Milestone 3: Sanity schemas for `jobApplication` and `project` (Sanity v4). The schema design supports both manual content curation (Phase 1) and future automation (Phase 2).

**Key Design Principle:** The schema is a *thinking tool*. Research context fields (inputs) inform content fields (outputs). This structure works for both manual curation and AI-assisted generation.

---

## Schema Requirements

### jobApplication

**Document type:** `jobApplication`

**Field Groups:**
- Target Role
- Research Context
- Content
- Metadata

**Fields:**

```
Target Role:
├── slug (slug, from: targetCompany + targetRoleTitle, required)
├── targetCompany (string, required)
├── targetRoleTitle (string, required)
└── jobUrl (url)

Research Context (nested object):
├── companyPainPoints (array of strings)
│   └── Description: Challenges you can address
├── roleKeywords (array of strings, tag layout)
│   └── Description: Terms from JD to echo naturally
├── proofPoints (array of objects)
│   ├── claim (string)
│   ├── evidence (text)
│   └── relevance (string) - Why relevant to this role
├── companyResearch (text, rows: 4)
│   └── Description: Culture, products, recent news
└── toneAdjustments (string enum: formal | warm | bold | technical)
    └── Description: How should this application feel?

Content:
├── customIntroduction (text, required, rows: 6, min: 50 chars)
│   └── Description: 2-3 paragraphs tailored to company
├── alignmentPoints (array of objects, min: 2, max: 4)
│   ├── heading (string)
│   └── body (text)
│   └── Description: Key points showing role fit
├── linkedProjects (array of references to project, max: 3)
│   └── Description: Most relevant projects for this role
└── closingStatement (text, required, rows: 3)
    └── Description: Brief closing with call to action

Metadata:
├── priority (string enum: high | medium | low, default: medium)
├── status (string enum, see lifecycle below)
├── yourNotes (text, rows: 3)
│   └── Description: Private notes (not displayed on public page)
├── createdAt (datetime, default: now)
└── publishedAt (datetime)
```

**Content Lifecycle States:**

Phase 1 (Manual):
- `draft` — Content being created/edited (default)
- `in-review` — Ready for self-review
- `ready` — Approved, ready to publish
- `published` — Live on public site
- `archived` — No longer active

Phase 2 (Automated) adds:
- `ai-generated` — Fresh from automation, needs review

**Preview:** Show `targetCompany` and `targetRoleTitle` with status emoji.

---

### project

**Document type:** `project`

**Fields:**

```
├── projectId (string, required, unique, format: P-01, P-02)
├── name (string, required)
├── focus (string)
│   └── Description: Primary focus area
├── keyMetric (text, rows: 2)
│   └── Description: Main business impact
├── description (text, rows: 4)
├── technologies (array of strings, tag layout)
└── year (string)
```

**Preview:** Show `name` and `projectId`.

---

## Key Deliverables

**Files to create:**
- `sanity-studio/schemaTypes/jobApplication.ts`
- `sanity-studio/schemaTypes/project.ts`
- `sanity-studio/schemaTypes/index.ts` — exports `schemaTypes`

**Note:** The existing project uses `schemaTypes/` directory (not `schemas/`). Follow this convention.

---

## Implementation Notes

### Why researchContext as a nested object?

1. **Grouped in Studio UI** — All research inputs appear together
2. **Clear mental model** — Inputs vs outputs are visually separated
3. **Automation-ready** — Phase 2 n8n workflow populates this object
4. **Portable** — Could be extracted to a separate document type if needed

### Why alignmentPoints instead of cxDesignAlignment + automationAndTechFit?

The original spec had two separate arrays with domain-specific names. The new design uses a generic `alignmentPoints` array because:

1. **Flexibility** — Works for any role, not just CX/automation
2. **Simpler schema** — One array with heading/body vs two parallel arrays
3. **Phase 2 compatible** — AI can generate any number of alignment points

### Status lifecycle design

Phase 1 uses `draft` as the default because content is manually created. Phase 2 adds `ai-generated` as an entry point when automation creates drafts. Both flows converge at `in-review → ready → published`.

---

## Validation Rules

**jobApplication:**
- `targetCompany` — Required
- `targetRoleTitle` — Required
- `customIntroduction` — Required, min 50 characters
- `alignmentPoints` — Min 2, max 4 items
- `linkedProjects` — Max 3 references
- `closingStatement` — Required

**project:**
- `projectId` — Required
- `name` — Required

---

## Testing Checklist

- [ ] Schemas compile without TypeScript errors
- [ ] `npm run studio:build` succeeds in sanity-studio/
- [ ] Both document types appear in Sanity Studio
- [ ] Field groups display correctly (Target Role, Research Context, etc.)
- [ ] Validation rules work (required fields, min/max)
- [ ] Preview shows company + role + status emoji
- [ ] Can create a draft jobApplication with all fields
- [ ] Can create a project and reference it from jobApplication

---

## Definition of Done

- [ ] Implement jobApplication schema with all fields and validation
- [ ] Implement project schema with all fields
- [ ] Export schemas in index.ts
- [ ] Update deskStructure.ts if needed
- [ ] Test in Sanity Studio locally
- [ ] Seed at least one project (P-01)
- [ ] Create at least one draft application with curated content
