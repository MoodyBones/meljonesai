Title: M6 — Testing & Deployment

Description

This issue implements Milestone 6: end-to-end testing and production deployment. It includes test plans, deployment steps, and deliverables.

Robust instructions (from Milestone summary & guide)

- Tasks:
  1. End-to-end testing across the pipeline (admin form → n8n → Gemini → Sanity → public page)
  2. Performance testing (Lighthouse, Lighthouse CI if desired)
  3. Production build and verification (`npm run build`, `npm run start`)
  4. Deploy to Hostinger VPS (clone repo, set env vars, build, configure reverse proxy)
  5. Update README and `CHANGES.md` with deployment notes

Key deliverables

- E2E test report (pass/fail, issues found)
- Deployment instructions and scripts (if any)
- Production environment checklist (env vars, secrets, firewall rules)
- Post-deploy smoke checks (auth, public pages, webhook connectivity)

Important pragmatic decisions

- Use Hostinger VPS for MVP hosting. Set up n8n and app on the VPS or use separate hosts; document choices.
- Ensure secrets are managed via environment variables and GitHub Secrets for CI.
- If production environment requires scaling, document options (e.g., move static assets to CDN, run Sanity on dedicated project)

Checklist

- [ ] Run full E2E tests
- [ ] Run Lighthouse and document results
- [ ] Deploy to Hostinger and verify
- [ ] Update docs and CHANGES.md
