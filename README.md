# MelJonesAI

**A career storytelling platform** that transforms job applications into personalised, portfolio-worthy pages.

[![Phase](https://img.shields.io/badge/Phase_2-Scale-green)]()
[![Status](https://img.shields.io/badge/Status-Deployed-brightgreen)]()

---

## What This Is

A **personalised content architecture** that demonstrates:

1. **Craft under constraint** — Ship something polished within a tight scope
2. **Systems thinking** — Structure data to enable both manual curation and future automation
3. **Judgment** — Make good tradeoffs, don't over-engineer

Each application page is generated from structured content: your research about the company, proof points mapped to role requirements, and curated project references.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| **CMS** | Sanity Studio v4 (headless) |
| **Auth** | Firebase Authentication |
| **Automation** | n8n + Gemini 2.5 Flash |
| **Deployment** | Netlify |

---

## Project Structure

```
meljonesai/
├── web/                # Next.js application
├── sanity-studio/      # Sanity CMS
├── automation/         # n8n workflows
└── .gemini/            # AI context documents
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

## Milestones

| Milestone | Description | Status |
|-----------|-------------|--------|
| M1 | Firebase Authentication | ✅ Complete |
| M3 | Sanity Schemas | ✅ Complete |
| M2 | n8n Workflow | ✅ Complete |
| M4 | Admin Interface | ✅ Complete |
| M5 | Content Generation Testing | In Progress |
| M6 | Production Deployment | ✅ Deployed |

**Live:** [meljonesai.netlify.app](https://meljonesai.netlify.app) · [Sanity Studio](https://meljonesai.sanity.studio)

---

## Key Files

| File | Purpose |
|------|---------|
| `.gemini/CONTEXT_CONTENT_GEN.md` | Voice & tone guidelines for AI generation |
| `automation/n8n/workflows/` | Versioned n8n workflow JSON |
| `sanity-studio/schemaTypes/` | Sanity document schemas |

---

## Success Criteria

- [x] Sanity schemas implemented
- [x] Firebase auth working
- [x] n8n workflow generating content
- [x] Admin forms for job/project input
- [x] Deployed to Netlify
- [ ] Lighthouse accessibility score >= 90
- [ ] OG image renders correctly

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
