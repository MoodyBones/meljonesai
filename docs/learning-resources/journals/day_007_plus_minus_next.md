# Day 7 — Plus, Minus, Next

**Date:** 2026-01-02

---

## Plus (What went well)

- **Two-agent architecture implemented end-to-end.** Designed and built both Profile Builder and Job Matcher workflows with clear separation of concerns. Human-authored fields are protected from AI overwrites.

- **n8n API mastery.** Learned to import workflows via API, embed credentials, and activate webhooks programmatically. Much faster than manual UI work.

- **Clean schema design.** Profile schema uses Sanity field groups to visually separate human vs AI fields. Makes the editing experience intuitive.

- **Match scoring logic.** Three-tier system (MATCH/PARTIAL/REJECT) with dealBreaker short-circuiting gives honest, actionable feedback instead of forcing weak applications.

- **CI cleanup.** Removed stale secrets (ANTHROPIC_API_KEY, N8N_WEBHOOK_SECRET) that were causing false warnings. Documentation now matches reality.

---

## Minus (What could be improved)

- **No end-to-end testing yet.** Workflows are deployed but not tested with real data. Need to create initial profile and run through both agents.

- **Credentials in workflow JSON.** API keys are embedded directly in n8n workflow files. Works for single-user project but not production-ready. Should use n8n credentials store.

- **Context window management.** Long conversation caused context overflow requiring summarisation. Could structure sessions better to avoid mid-task summaries.

---

## Next (Tomorrow's priorities)

1. **Create initial profile in Sanity Studio.** Fill in human-authored fields: values, dealBreakers, requirements, voiceNotes.

2. **Test Profile Builder.** Trigger from admin dashboard, verify AI fields are populated correctly.

3. **Test Job Matcher.** Submit a real job description, verify MATCH/PARTIAL/REJECT branching works.

4. **Fix any workflow issues.** Debug based on real execution results.

---

## Key Learnings

1. **Patch vs Replace** — Use Sanity `patch` mutations when you only want to update specific fields without touching others.

2. **n8n Switch node** — The `rules` mode with multiple conditions enables clean branching logic without nested if-else.

3. **Merge commits > Squash** — Squash merging breaks branch synchronisation. Stick with merge commits for cleaner git history.

4. **API-first workflow management** — Importing n8n workflows via API with embedded credentials is faster than manual setup.
