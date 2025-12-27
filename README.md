# MelJonesAI

**A career storytelling platform** that transforms job applications into personalised, portfolio-worthy pages.

[![Phase](https://img.shields.io/badge/Phase_1-MVP-blue)]()
[![Status](https://img.shields.io/badge/Status-In_Progress-yellow)]()

---

## What This Is

A **personalised content architecture** that demonstrates:

1. **Craft under constraint** — Ship something polished within a tight scope
2. **Systems thinking** — Structure data to enable both manual curation and future automation
3. **Judgment** — Make good tradeoffs, don't over-engineer

Each application page is generated from structured content: your research about the company, proof points mapped to role requirements, and curated project references.

---

## Two-Phase Approach

### Phase 1: MVP (Current)

**Goal:** One polished, publicly-accessible application page.

```
Research Company → Curate Content in Sanity → Publish → Live Page
```

- Manually curate content using structured schema
- Schema designed as a *thinking tool* (research context informs output)
- Ship craft, demonstrate systems thinking

### Phase 2: Scale (Future)

**Goal:** Automate content generation for multiple applications.

```
Admin Form → n8n Workflow → Gemini AI → Sanity Draft → Review → Publish
```

- Same schema, automated population
- n8n workflow with company research + AI generation
- Human review before publishing

**The schema serves both phases.** What you curate manually in Phase 1, automation fills in Phase 2.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| **CMS** | Sanity Studio v4 (headless) |
| **Auth** | Firebase Authentication |
| **Automation** | n8n + Gemini 2.0 Flash (Phase 2) |
| **Deployment** | Hostinger VPS |

---

## Project Structure

```
meljonesai/
├── web/                # Next.js application
├── sanity-studio/      # Sanity CMS
├── docs/               # Documentation
└── .github/            # CI/CD, issue templates, copilot instructions
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/MoodyBones/meljonesai.git
cd meljonesai
npm install
```

### Development

```bash
# Terminal 1 - Sanity Studio (port 3333)
npm run studio:dev

# Terminal 2 - Next.js App (port 3000)
npm run web:dev
```

### Environment Variables

Create `web/.env.local`:

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

---

## Content Model

### Job Application

The schema structures your thinking before generating content:

**Research Context (inputs):**
- Company pain points you can address
- Role-specific keywords from the JD
- Your proof points with evidence
- Tone adjustments for company culture

**Content (outputs):**
- Custom introduction tailored to company
- Alignment points showing role fit
- Linked portfolio projects (max 3)
- Closing statement

**Lifecycle:**
```
draft → in-review → ready → published → archived
        ↑
    ai-generated (Phase 2)
```

### Project

Portfolio projects referenced by applications:

- Project ID (P-01, P-02, etc.)
- Name, focus area, key metric
- Technologies and skills applied
- Description

---

## Milestones

### Phase 1: MVP

| Milestone | Description | Status |
|-----------|-------------|--------|
| M1 | Firebase Authentication | ✅ Complete |
| M3 | Sanity Schemas | 🎯 In Progress |
| M6a | Deploy MVP (one page) | Pending |

### Phase 2: Scale

| Milestone | Description | Status |
|-----------|-------------|--------|
| M2 | n8n Workflow | Planned |
| M4 | Admin Interface | Planned |
| M5 | Content Generation Testing | Planned |
| M6b | Full Production Deployment | Planned |

**Critical Path (Phase 1):** M1 → M3 → M6a

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/README.md](docs/README.md) | Documentation overview |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Setup guide |
| [docs/REFERENCE.md](docs/REFERENCE.md) | Architecture & milestones |
| [docs/CHANGES.md](docs/CHANGES.md) | Session history |

---

## MVP Success Criteria

**Phase 1 Definition of Done:**

- [ ] Sanity schemas implemented and validated
- [ ] One application with manually curated content
- [ ] Public page renders at `/[slug]`
- [ ] Lighthouse accessibility score >= 90
- [ ] Works on mobile Safari
- [ ] OG image renders correctly when shared
- [ ] Deployed to production URL

---

## The Strategic Frame

This project serves three purposes:

1. **Immediate utility** — A polished application page to link to
2. **Portfolio evidence** — Demonstrates craft, systems thinking, shipping discipline
3. **Interview material** — Concrete example for "tell me about a recent project"

The automation story (Phase 2) stays ready. If asked about scale or future plans, the n8n architecture is scoped. But Phase 1 shows restraint—build what's needed, not what's cool.

---

## Scripts

```bash
# Development
npm run web:dev          # Next.js dev server
npm run studio:dev       # Sanity Studio

# Build
npm run web:build        # Production build
npm run studio:build     # Studio build

# Quality
npm run web:typecheck    # TypeScript
npm run web:lint         # ESLint
```

---

## License

MIT License - See [LICENSE](LICENSE)

---

**Mel Jones** · [@MoodyBones](https://github.com/MoodyBones)
