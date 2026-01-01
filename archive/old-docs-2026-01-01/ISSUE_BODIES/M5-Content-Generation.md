Title: M5 — Content Generation Testing (Phase 2)

## Description

**Phase:** 2 (Scale)
**Status:** Planned
**Dependencies:** M2 (n8n Workflow), M4 (Admin Interface)

This milestone validates the AI-generated content quality and iterates on Gemini prompts. This is Phase 2 work—testing the automation pipeline after it's built.

---

## Why Phase 2?

Phase 1 ships one manually curated application. The content quality is guaranteed because you write it yourself.

Phase 2 introduces AI generation, which requires testing:
- Is the output coherent and professional?
- Does it accurately reflect your experience?
- Are the right projects being selected?
- Does the tone match the target company?

---

## Objectives

1. **Generate sample applications** — Create 3 test applications via the automation pipeline
2. **Evaluate quality** — Review AI output against quality criteria
3. **Iterate prompts** — Refine Gemini prompts based on findings
4. **Document learnings** — Record what works and what doesn't

---

## Quality Criteria

### Content Quality

- [ ] Introduction is personalised to company (not generic)
- [ ] Alignment points are relevant to the role
- [ ] Proof points cite real evidence from your experience
- [ ] Closing statement has clear call to action
- [ ] Tone matches the selected adjustment (formal/warm/bold/technical)

### Accuracy

- [ ] No hallucinated project details
- [ ] Key metrics are accurate
- [ ] Company research reflects reality
- [ ] Role keywords actually appear in the JD

### Schema Compliance

- [ ] All required fields populated
- [ ] `researchContext` object complete
- [ ] 2-4 `alignmentPoints` generated
- [ ] Appropriate projects selected (max 3)
- [ ] Status is `ai-generated`

---

## Test Cases

### Test 1: Design Role at Large Tech Company

- Company: Atlassian, Canva, or similar
- Role: Senior Product Designer
- Expected tone: Warm, collaborative
- Expected projects: P-01, P-02 (product-focused)

### Test 2: Technical Role at Startup

- Company: Early-stage startup
- Role: Design Engineer / Frontend
- Expected tone: Bold, technical
- Expected projects: P-02, P-03 (technical)

### Test 3: Leadership Role

- Company: Established company
- Role: Design Lead / Manager
- Expected tone: Formal, strategic
- Expected projects: P-01, P-04 (leadership/process)

---

## Prompt Iteration Process

1. **Generate** — Run test case through pipeline
2. **Review** — Evaluate against quality criteria
3. **Identify** — Note specific issues (e.g., "introduction too generic")
4. **Adjust** — Modify prompt with specific instructions
5. **Re-test** — Generate again and compare

### Prompt Adjustment Examples

**Problem:** Introduction too generic
**Fix:** Add instruction: "Reference a specific product or recent news from the company"

**Problem:** Wrong projects selected
**Fix:** Add project descriptions with keywords that match role requirements

**Problem:** Tone inconsistent
**Fix:** Add tone examples: "For 'warm' tone, use phrases like 'I'd love to...' and 'excited about...'"

---

## Key Deliverables

- 3 sample generated applications in Sanity
- At least 1 published to public page
- Prompt iteration log documenting changes
- Final prompt templates for each tone

---

## Prompt Template Structure

```
You are helping create a job application for [ROLE] at [COMPANY].

## Context
- Job Description: [JD]
- Company Research: [RESEARCH]
- My Portfolio Projects: [PROJECTS]
- Desired Tone: [TONE]

## Output Format
Return JSON matching this schema:
{
  "researchContext": { ... },
  "customIntroduction": "...",
  "alignmentPoints": [...],
  "closingStatement": "...",
  "linkedProjects": [...]
}

## Quality Requirements
- Introduction must reference something specific about [COMPANY]
- Each alignment point should cite evidence from my experience
- Select 2-3 most relevant projects based on role requirements
- Tone should be [TONE]: [TONE_EXAMPLES]
```

---

## Testing Checklist

- [ ] Generate 3 sample applications
- [ ] Review each against quality criteria
- [ ] Iterate prompts at least once
- [ ] Publish 1 sample to public page
- [ ] Verify public page renders correctly
- [ ] Document prompt changes and rationale

---

## Definition of Done

- [ ] 3 sample applications generated
- [ ] 1 sample published and verified
- [ ] Quality criteria met for all samples
- [ ] Prompt templates documented
- [ ] Iteration log completed
