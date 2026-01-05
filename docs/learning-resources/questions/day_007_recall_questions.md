# Day 7 Recall Questions — Two-Agent Architecture, n8n API, CI Secrets

## Two-Agent Architecture

1. **What are the two agents and their responsibilities?**
   <details>
   <summary>Answer</summary>
   - **Agent 1 (Profile Builder):** Analyses projects, generates AI-derived profile fields (provenCapabilities, differentiators, growthEdges, themesSummary)
   - **Agent 2 (Job Matcher):** Compares job against profile, scores fit, generates application content or explains rejection
   </details>

2. **Why do we separate human-authored and AI-derived fields?**
   <details>
   <summary>Answer</summary>
   Human-authored fields (values, dealBreakers, requirements, voiceNotes) represent personal preferences that should never be overwritten by AI. Agent 1 only patches AI-derived fields, preserving human curation.
   </details>

3. **What are the three match categories and their score thresholds?**
   <details>
   <summary>Answer</summary>
   - **MATCH:** 70%+ — Strong fit, create application
   - **PARTIAL:** 40-70% — Gaps exist, create with notes
   - **REJECT:** <40% or dealBreaker triggered — No application created
   </details>

4. **What triggers an immediate REJECT regardless of score?**
   <details>
   <summary>Answer</summary>
   If any of the candidate's `dealBreakers` match signals in the job description (e.g., "crypto", "gambling", "on-site only when remote required").
   </details>

## Profile Schema Design

5. **Name the human-authored fields in the profile schema.**
   <details>
   <summary>Answer</summary>
   - `name`
   - `values` (array of strings)
   - `dealBreakers` (array of strings)
   - `requirements` (array of strings)
   - `voiceNotes` (object with `tone`, `framing`, `avoid`)
   </details>

6. **Name the AI-derived fields in the profile schema.**
   <details>
   <summary>Answer</summary>
   - `provenCapabilities` (array of objects with capability, strength, evidence, themes)
   - `differentiators` (array of strings)
   - `growthEdges` (array of strings)
   - `themesSummary` (text)
   - `lastAnalysed` (datetime)
   - `sourceProjects` (array of strings)
   </details>

7. **What are the three strength levels for provenCapabilities?**
   <details>
   <summary>Answer</summary>
   - **high:** Multiple projects with strong metrics
   - **medium:** Clear evidence but limited scope
   - **emerging:** Interest shown but thinner proof
   </details>

## n8n Workflow Design

8. **How many nodes are in the Profile Builder workflow?**
   <details>
   <summary>Answer</summary>
   9 nodes: Webhook → Fetch Projects + Fetch Profile (parallel) → Merge → Wait → Gemini → Parse → Patch → Return
   </details>

9. **How many nodes are in the Job Matcher workflow?**
   <details>
   <summary>Answer</summary>
   11 nodes: Webhook → Fetch Profile → Wait → Gemini → Parse → Switch (branch) → Create MATCH / Create PARTIAL / Return REJECT → Return responses
   </details>

10. **Why does Profile Builder use `patch` while Job Matcher uses `createOrReplace`?**
    <details>
    <summary>Answer</summary>
    - **Patch:** Updates only specified fields on existing document, preserving human-authored fields
    - **createOrReplace:** Creates a new document or overwrites existing. Job applications are new documents each time.
    </details>

## n8n API Operations

11. **How do you import a workflow via the n8n API?**
    <details>
    <summary>Answer</summary>
    ```bash
    curl -X POST "https://n8n.example.com/api/v1/workflows" \
      -H "X-N8N-API-KEY: your_key" \
      -H "Content-Type: application/json" \
      -d @workflow.json
    ```
    </details>

12. **How do you activate an imported workflow?**
    <details>
    <summary>Answer</summary>
    ```bash
    curl -X POST "https://n8n.example.com/api/v1/workflows/{id}/activate" \
      -H "X-N8N-API-KEY: your_key"
    ```
    Note: POST not PATCH for the activate endpoint.
    </details>

## CI and Secrets

13. **Why were ANTHROPIC_API_KEY and N8N_WEBHOOK_SECRET removed from CI checks?**
    <details>
    <summary>Answer</summary>
    - **ANTHROPIC_API_KEY:** Project uses Gemini, not Anthropic. Keys stored in n8n, not GitHub.
    - **N8N_WEBHOOK_SECRET:** n8n webhooks are public endpoints. No secret header validation implemented.
    </details>

14. **What three secrets are now required for CI?**
    <details>
    <summary>Answer</summary>
    - `SANITY_PREVIEW_SECRET`
    - `NEXT_PUBLIC_SITE_URL` (e.g., `https://curate-company-content.netlify.app/`)
    - `SANITY_WRITE_TOKEN`
    </details>

## Git Workflow

15. **What merge strategy should be used for PRs and why?**
    <details>
    <summary>Answer</summary>
    **Merge commit** (not squash). Squash merges cause branch sync issues because the squashed commit has a different SHA than the original commits, making git think branches have diverged.
    </details>

---

## Quick Reference

| Concept | Key Point |
|---------|-----------|
| Agent 1 | Profile Builder — patches AI fields only |
| Agent 2 | Job Matcher — branches on MATCH/PARTIAL/REJECT |
| Match thresholds | 70%+ match, 40-70% partial, <40% reject |
| Human fields | values, dealBreakers, requirements, voiceNotes |
| AI fields | provenCapabilities, differentiators, growthEdges, themesSummary |
| n8n activate | POST to `/api/v1/workflows/{id}/activate` |
| Merge strategy | Use merge commits, not squash |
