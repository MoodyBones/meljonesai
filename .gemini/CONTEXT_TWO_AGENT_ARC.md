# MelJonesAI: Two-Agent Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           SANITY CMS                                │
│                                                                     │
│   Projects    Skills    Values    Past Roles    Requirements        │
│      ▲                                                              │
│      │ (Mel updates periodically)                                   │
└──────┼──────────────────────────────────────────────────────────────┘
       │
       │ fetch
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AGENT 1: Profile Builder                         │
│                                                                     │
│   "Who is Mel? What has she proven? What does she need?"            │
│                                                                     │
│   Input:  All projects + context from Sanity                        │
│   Process: Analyze, theme, rate, extract patterns                   │
│   Output:  Structured Mel Profile (JSON)                            │
│                                                                     │
│   Runs: On-demand or when Sanity content changes                    │
└─────────────────────────────────────────────────────────────────────┘
       │
       │ Mel Profile JSON
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         MEL PROFILE                                 │
│                     (cached in n8n or Sanity)                       │
│                                                                     │
│   • Proven capabilities (with evidence)                             │
│   • Themes across projects                                          │
│   • Strongest differentiators                                       │
│   • Values & requirements                                           │
│   • Deal-breakers                                                   │
│   • Growth edges (areas of interest, less proven)                   │
└─────────────────────────────────────────────────────────────────────┘
       │
       │ reference
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   AGENT 2: Job Matcher                              │
│                                                                     │
│   "Does this role fit Mel?"                                         │
│                                                                     │
│   Input:  Job description + Mel Profile                             │
│   Process:                                                          │
│      1. Extract role requirements                                   │
│      2. Compare against Mel Profile                                 │
│      3. Score fit → MATCH / PARTIAL / REJECT                        │
│      4. Branch based on outcome                                     │
└─────────────────────────────────────────────────────────────────────┘
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼                                         ▼
┌─────────────────────┐    ┌─────────────────────────────────────────┐
│   MATCH             │    │   PARTIAL                               │
│                     │    │                                         │
│   Generate content  │    │   Generate content                      │
│   for all Sanity    │    │   + Flag gaps                           │
│   fields            │    │   + Suggest reframe angle               │
│                     │    │   + Draft "challenge" language          │
│   → Push to Sanity  │    │                                         │
└─────────────────────┘    │   "Here's how to position this          │
                           │    despite the mismatch..."             │
       │                   │                                         │
       │                   │   → Push to Sanity (with notes)         │
       ▼                   └─────────────────────────────────────────┘
                                         │
┌─────────────────────┐                  │
│   REJECT            │                  │
│                     │                  ▼
│   Don't generate    │    ┌─────────────────────────────────────────┐
│   Explain why:      │    │              SANITY CMS                 │
│   • Missing fit     │    │                                         │
│   • Value conflict  │    │   New jobApplication document created   │
│   • Red flags       │    │   with generated content                │
│                     │    │                                         │
│   → Log only        │    │   → Next.js renders the page            │
└─────────────────────┘    └─────────────────────────────────────────┘
```

---

## Agent 1: Profile Builder

### Purpose

Transform raw Sanity content into a structured understanding of Mel that Agent 2 can use for matching.

### Runs When

- Manually triggered ("refresh my profile")
- Webhook when Sanity content updates (optional)
- Before a batch of job applications

### Input (from Sanity)

- All projects with descriptions, outcomes, metrics
- Skills list (if stored separately)
- Values / requirements / deal-breakers
- Past role titles and contexts

### Processing Tasks

1. **Theme extraction:** What patterns appear across projects? (systems thinking, automation, design systems, etc.)
2. **Capability mapping:** What has Mel _proven_ she can do? (with specific evidence)
3. **Strength ranking:** Which capabilities have the strongest proof points?
4. **Values extraction:** What does Mel need from a role? What are deal-breakers?
5. **Growth edges:** Areas of interest where evidence is thinner (opportunities, not weaknesses)

### Output: Mel Profile JSON

```json
{
  "proven_capabilities": [
    {
      "capability": "Design Systems Implementation",
      "strength": "high",
      "evidence": ["P-02: Saved 6+ months dev time", "P-04: 20-min onboarding"],
      "themes": ["scalability", "developer experience"]
    }
  ],
  "differentiators": [
    "AI/automation integration (n8n + LLM)",
    "Documentation as product",
    "Systems thinking across product/engineering"
  ],
  "values": [
    "Kind, collaborative team",
    "Sustainable pace",
    "Meaningful impact"
  ],
  "deal_breakers": [
    "Toxic culture signals",
    "Pure execution role (no input on direction)",
    "Fully synchronous / always-on expectations"
  ],
  "growth_edges": [
    "Leadership title (experience exists, title doesn't)",
    "Specific frameworks (learnable, not blockers)"
  ],
  "voice_notes": {
    "framing": "Pattern observer, not just executor",
    "tone": "Direct, Australian, metric-backed"
  }
}
```

---

## Agent 2: Job Matcher

### Purpose

Compare a job description against Mel Profile. Decide fit. Generate content or explain rejection.

### Runs When

- Mel submits a job description (URL or pasted text)

### Input

- Job description (text)
- Mel Profile (JSON from Agent 1)

### Processing Steps

**Step 1: Extract role requirements**

- Must-haves vs nice-to-haves
- Implicit requirements (read between the lines)
- Culture signals
- Red flags

**Step 2: Compare against Mel Profile**

- Which proven capabilities match?
- Which requirements have no evidence?
- Any deal-breaker conflicts?
- Any value alignment signals?

**Step 3: Score and categorize**

| Score                | Category | Criteria                                         |
| -------------------- | -------- | ------------------------------------------------ |
| 70%+ match           | MATCH    | Strong alignment on must-haves, no deal-breakers |
| 40-70% match         | PARTIAL  | Some alignment, gaps that could be reframed      |
| <40% or deal-breaker | REJECT   | Poor fit or value conflict                       |

**Step 4: Branch to output**

---

## Output Branches

### MATCH → Generate Full Content

Produce content for all Sanity fields:

- `target_role_title`
- `custom_introduction`
- `cx_design_alignment`
- `automation_and_tech_fit`
- `closing_statement`
- `linkedProject`

Push directly to Sanity. Ready for review.

### PARTIAL → Generate + Flag

Produce content for all fields, plus:

- **Gap analysis:** "This role asks for X. Your profile shows Y instead."
- **Reframe suggestion:** "Position it as..."
- **Challenge language:** Draft text that reframes the requirement or challenges the company's assumptions

Example:

> "They want 5 years React. You have 3 years Next.js + systems design. Reframe: 'Modern React architecture including App Router, which many 5-year React devs haven't touched.'"

Push to Sanity with notes field populated.

### REJECT → Explain, Don't Generate

Return explanation only:

- Why it doesn't fit
- Which deal-breakers triggered
- Whether it's "not now" or "not ever"

Log for Mel's reference. Don't create Sanity document.

---

## n8n Workflow Structure

```
Workflow 1: Profile Builder
├── Trigger: Manual or Sanity webhook
├── Node: Fetch all projects from Sanity (HTTP Request)
├── Node: Fetch values/requirements from Sanity
├── Node: Gemini API — analyze and structure
├── Node: Store Mel Profile (Sanity document or n8n static data)
└── End

Workflow 2: Job Matcher
├── Trigger: Webhook (job description submitted)
├── Node: Fetch Mel Profile from storage
├── Node: Gemini API — compare and score
├── Branch: Switch on match category
│   ├── MATCH → Gemini generate content → Sanity create document
│   ├── PARTIAL → Gemini generate + flag → Sanity create with notes
│   └── REJECT → Format explanation → Return to UI (no Sanity push)
└── End
```

---

## Open Questions

1. **Where to store Mel Profile?** Options:

   - Sanity document (queryable, versioned)
   - n8n static data (simpler, faster)
   - JSON file in repo (version controlled)

2. **How does Mel submit job descriptions?** Options:

   - Simple form on the Next.js site
   - n8n webhook URL + paste
   - Browser extension that sends current page

3. **Review step before Sanity push?** Or trust the system and edit after?

4. **What Sanity schema changes are needed?** May need:
   - `melProfile` document type
   - `matchScore` field on jobApplication
   - `gaps` / `notes` fields for partial matches

---

## Next Steps

1. Confirm this architecture makes sense
2. Define Mel Profile schema (what fields matter most?)
3. Write Agent 1 prompt (Profile Builder)
4. Write Agent 2 prompt (Job Matcher)
5. Build n8n workflows

---

_One step at a time. This is the map. Now we pick the first trail._
