Title: M5 — Content Generation & Testing

Description

This issue implements Milestone 5: validate the AI content generation quality and create sample applications. It includes testing criteria and deliverables.

Robust instructions (from Milestone summary & guide)

- Tasks:
  1. Iterate Gemini prompts to produce high-quality outputs
  2. Generate 3 sample job applications using the pipeline
  3. Validate content for factuality, style, and metrics
  4. Create at least one published sample application and verify public rendering

Key deliverables

- 3 sample generated job applications (saved as drafts in Sanity)
- At least 1 published public page for a sample application
- Notes documenting prompt changes and quality observations

Testing checklist

- AI output is coherent, professional, and tailored to company and role
- No hallucinated or fabricated project metrics
- Sanity drafts created correctly and can be published
- Public pages render with expected content and images

Important pragmatic decisions

- Start with Gemini 2.0 Flash and a conservative temperature (0.7) to balance creativity vs determinism
- If CI or production issues occur, testing can be performed locally with real API keys in `.env.local` (do NOT commit secrets)

Checklist

- [ ] Generate 3 sample applications
- [ ] Publish 1 sample and validate public page
- [ ] Document prompt iterations and results
