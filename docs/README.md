# MelJonesAI Documentation

**A career storytelling platform** that transforms job applications into personalised, portfolio-worthy pages.

**Status:** Phase 1 MVP in progress | M3 (Schemas) 🎯
**Last Updated:** 2025-12-18

---

## Development Philosophy

**Craft over complexity.** Ship what's needed, not what's cool.

**Core principles:**
- **Craft under constraint** — One polished page beats ten mediocre ones
- **Systems thinking** — Structure data to enable both manual curation and future automation
- **Judgment** — Make good tradeoffs, document why
- **Sustainable pace** — Energy management over speed
- **Knowledge preservation** — Document to remember, not to impress

---

## What is MelJonesAI?

A structured content system for creating job applications:

**Phase 1 (MVP):**
1. Research company and role
2. Curate content in Sanity Studio (research context → content)
3. Publish to public page at `/[slug]`
4. Ship one polished, portfolio-worthy application

**Phase 2 (Scale):**
1. Submit job description via admin form
2. n8n workflow researches company + generates content (Gemini AI)
3. Review and refine AI-generated draft
4. Publish to public page

**The same schema serves both phases.** What you curate manually in Phase 1, automation fills in Phase 2.

**Tech Stack:** Next.js 15 | Firebase Auth | Sanity CMS | n8n + Gemini (Phase 2)

---

## Documentation Quick Start

### For New Contributors

**Read in this order (15 min):**

1. **[QUICKSTART.md](./QUICKSTART.md)** (5 min)
   - Environment setup
   - Dev server commands

2. **[REFERENCE.md](./REFERENCE.md)** (10 min)
   - Two-phase approach
   - Architecture & milestones
   - Data models

### For Active Development

**Primary References:**
- **[.github/copilot-instructions.md](../.github/copilot-instructions.md)** — Development guidelines
- **[.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/)** — Task prompts for each milestone

**Progress Tracking:**
- **[CHANGES.md](./CHANGES.md)** — Session history

---

## Documentation Structure

```
docs/
├── README.md              # This file
├── QUICKSTART.md          # Setup & daily workflow
├── REFERENCE.md           # Architecture & milestones
├── CHANGES.md             # Session history
└── learning-resources/
    ├── questions/         # Spaced repetition
    └── posts/             # Technical deep dives

.github/
├── copilot-instructions.md   # Development guidelines
├── ISSUE_BODIES/             # M1-M6 task prompts
└── README_SECRETS.md         # Secrets setup
```

---

## Current Status

### Phase 1: MVP

| Milestone | Description | Status |
|-----------|-------------|--------|
| M0 | Planning & Documentation | ✅ Complete |
| M1 | Firebase Authentication | ✅ Complete |
| M3 | Sanity Schemas | 🎯 In Progress |
| M6a | MVP Deployment | Pending |

### Phase 2: Scale (Planned)

| Milestone | Description | Status |
|-----------|-------------|--------|
| M2 | n8n Workflow | Planned |
| M4 | Admin Interface | Planned |
| M5 | Content Generation | Planned |
| M6b | Full Deployment | Planned |

### What's Been Built

**Authentication (M1)**
- Secure session cookies (httpOnly)
- Google OAuth integration
- Protected admin routes

**CI/CD**
- Time-boxed credentials (1hr tokens)
- Two-layer caching (90% faster)
- Graceful degradation

---

## Quick Navigation

**"How do I set up the project?"**
→ [QUICKSTART.md](./QUICKSTART.md)

**"What's the architecture?"**
→ [REFERENCE.md](./REFERENCE.md) - Part 1

**"What are the milestones?"**
→ [REFERENCE.md](./REFERENCE.md) - Part 2

**"What's the schema design?"**
→ [.github/ISSUE_BODIES/M3-Sanity-Schemas.md](../.github/ISSUE_BODIES/M3-Sanity-Schemas.md)

**"What was done recently?"**
→ [CHANGES.md](./CHANGES.md)

---

## The Strategic Frame

This project serves three purposes:

1. **Immediate utility** — A polished application page to link to
2. **Portfolio evidence** — Demonstrates craft, systems thinking, shipping discipline
3. **Interview material** — Concrete example for "tell me about a recent project"

The automation story (Phase 2) stays ready. If asked about scale or future plans, the n8n architecture is scoped. But Phase 1 shows restraint—build what's needed, not what's cool.

---

## Security Notes

**NEVER commit:**
- `.env.local` files
- `FIREBASE_PRIVATE_KEY`
- Service account credentials

**Use GitHub Secrets for CI:**
- See [.github/README_SECRETS.md](../.github/README_SECRETS.md)

---

## Getting Help

1. **Architecture:** [REFERENCE.md](./REFERENCE.md)
2. **Setup:** [QUICKSTART.md](./QUICKSTART.md)
3. **Specific tasks:** [.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/)
4. **Troubleshooting:** [.github/copilot-instructions.md](../.github/copilot-instructions.md)

---

**Current phase:** Phase 1 MVP | M3 in progress

*For session history: [CHANGES.md](./CHANGES.md)*
