# MelJonesAI

**A career storytelling platform** that transforms job applications into personalised, portfolio-worthy pages using a two-agent AI architecture.

[![Status](https://img.shields.io/badge/Status-Deployed-brightgreen)]()

**Live:** [curate-company-content.netlify.app](https://curate-company-content.netlify.app) · [Sanity Studio](https://meljonesai.sanity.studio)

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  Agent 1: Profile Builder                                   │
│  POST /webhook/build-profile                                │
│                                                             │
│  Projects → Gemini Analysis → Patch Profile                 │
│  (generates AI-derived fields, preserves human-authored)   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Agent 2: Job Matcher                                       │
│  POST /webhook/match-job                                    │
│                                                             │
│  Job + Profile → Gemini Matching → Branch                   │
│     ├── MATCH (70%+)   → Create application                 │
│     ├── PARTIAL (40-70%) → Create with gaps noted           │
│     └── REJECT (<40%)  → Return explanation only            │
└─────────────────────────────────────────────────────────────┘
```

**Key concept:** Human-authored fields (values, dealBreakers, requirements, voiceNotes) are never overwritten. Agent 1 only patches AI-derived fields.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| **CMS** | Sanity Studio v4 |
| **Auth** | Firebase Authentication |
| **Automation** | n8n + Gemini 2.5 Flash |
| **Deployment** | Netlify |

---

## Project Structure

```
meljonesai/
├── web/                      # Next.js application
├── sanity-studio/            # Sanity CMS
├── automation/n8n/workflows/ # n8n workflow JSON files
└── .gemini/                  # AI prompts and context docs
```

---

## Quick Start

```bash
git clone https://github.com/MoodyBones/meljonesai.git
cd meljonesai
npm install

# Terminal 1 - Sanity Studio (port 3333)
npm run studio:dev

# Terminal 2 - Next.js App (port 3000)
npm run web:dev
```

---

## Milestones

| Milestone | Description | Status |
|-----------|-------------|--------|
| M1 | Firebase Authentication | ✅ |
| M2 | n8n Workflow | ✅ |
| M3 | Sanity Schemas | ✅ |
| M4 | Admin Interface | ✅ |
| M6 | Production Deployment | ✅ |
| M7 | Two-Agent Architecture | ✅ |

---

## Key Files

| File | Purpose |
|------|---------|
| `sanity-studio/schemaTypes/profile.ts` | Profile schema (human vs AI fields) |
| `sanity-studio/schemaTypes/jobApplication.ts` | Job application with match scoring |
| `automation/n8n/workflows/profile-builder.json` | Agent 1 workflow |
| `automation/n8n/workflows/job-matcher.json` | Agent 2 workflow |
| `.gemini/PROMPT_AGENT_*.md` | AI prompts for each agent |

---

## Scripts

```bash
npm run web:dev          # Next.js dev server
npm run studio:dev       # Sanity Studio
npm run web:build        # Production build
npm run web:typecheck    # TypeScript check
npm run web:lint         # ESLint
```

---

## License

MIT License - See [LICENSE](LICENSE)

---

**Mel Jones** · [@MoodyBones](https://github.com/MoodyBones)
