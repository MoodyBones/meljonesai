# MelJonesAI

**AI-powered job application automation system**

Transforms job application creation from **2-4 hours to 8 minutes** through intelligent automation and AI-generated content.

[![Status](https://img.shields.io/badge/Planning-100%25-success)]()
[![Implementation](https://img.shields.io/badge/Implementation-Ready-blue)]()
[![Confidence](https://img.shields.io/badge/Confidence-90%25-brightgreen)]()

---

## 🎯 What It Does

**The Flow:**
```
Admin Form → Next.js API → n8n Workflow → 
→ Company Research → Gemini AI → Sanity Draft → 
→ Manual Review → Publish → Live Public Page
```

**Time Savings:** 95-97% per application

1. **Input** job description via admin form (2 min)
2. **Automate** AI generates tailored content (30 sec)
3. **Review** draft in Sanity CMS (3-5 min)
4. **Publish** to public portfolio page (1 click)

---

## 🛠️ Tech Stack

**Frontend & CMS**
- Next.js 16 (App Router, React 19, TypeScript)
- Sanity Studio v4 (Headless CMS)
- Tailwind CSS v4
- Turbopack + React Compiler

**Backend & Automation**
- n8n (self-hosted) - 11-node workflow
- Gemini 2.0 Flash API - AI content generation
- Firebase Auth - Admin authentication

**Deployment**
- Hostinger VPS

---

## 📁 Project Structure

```
meljonesai/
├── web/                # Next.js application (port 3000)
├── sanity-studio/      # Sanity CMS (port 3333)
├── docs/               # Comprehensive documentation (~260KB)
└── n8n-workflows/      # Automation workflows (to be created)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/MoodyBones/meljonesai.git
cd meljonesai

# Install dependencies (hoisted workspace)
npm install

# Or install separately
cd web && npm install
cd ../sanity-studio && npm install
```

### Development

**Run both dev servers (recommended):**

```bash
# Terminal 1 - Sanity Studio (port 3333)
npm run studio:dev

# Terminal 2 - Next.js App (port 3000)
npm run web:dev
```

**Or run individually:**

```bash
# Sanity Studio only
cd sanity-studio
npm run dev

# Next.js App only
cd web
npm run dev
```

### Environment Configuration

Create `.env.local` in the `web/` folder:

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=v2025-01-01

# Firebase Auth (add during M1)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# n8n Webhook (add during M2)
N8N_WEBHOOK_URL=your_webhook_url
```

---

## 📖 Documentation

**Start here:** [docs/START_HERE.md](docs/START_HERE.md) ⭐

### Essential Guides

| Document | Purpose |
|----------|---------|
| [Project Overview](docs/PROJECT_OVERVIEW.md) | Complete project summary |
| [Quick Reference](docs/QUICK_REFERENCE.md) | Fast lookups and commands |
| [Setup Guide](docs/QUICKSTART.md) | Environment configuration |
| [Milestone Tracking](docs/MILESTONE_SUMMARY.md) | Progress & task checklists |
| [Copilot Guide](docs/COPILOT_GUIDE_COMPLETE.md) | AI-assisted development |
| [Git Strategy](docs/GIT_STRATEGY.md) | Branching & workflow |
| [Complete Index](docs/INDEX.md) | Full documentation catalog |

### Documentation Stats

- **13 core files** (~260KB)
- **6 hours** of comprehensive planning
- **ROI:** 183-300% time savings in implementation

---

## 🎯 Implementation Plan (8 Hours)

| Time        | Milestone           | Duration | Status |
|-------------|---------------------|----------|--------|
| 00:00-01:30 | M1: Firebase Setup  | 1.5h     | ⏳ Pending |
| 01:30-04:00 | M2: n8n Workflow    | 2.5h     | ⏳ **CRITICAL** |
| 04:00-05:00 | Lunch Break         | 1h       | - |
| 05:00-06:30 | M3: Sanity Schemas  | 1.5h     | ⏳ Pending |
| 06:30-08:00 | M4: Admin Interface | 1.5h     | ⏳ Pending |
| 08:00-08:45 | M5: Testing         | 0.75h    | ⏳ Pending |
| 08:45-09:00 | M6: Documentation   | 0.25h    | ⏳ Pending |

**Critical Path:** M2 (n8n workflow) - Core automation pipeline

---

## 🤖 The Automation Pipeline

**n8n Workflow (11 Nodes):**

1. Webhook Trigger - Receives form data
2. Input Validation - Validates required fields
3. Company Research - Web scraping/API calls
4. Prepare Prompt - Structures context for AI
5. Gemini API Call - Generates tailored content
6. Parse Response - Extracts JSON
7. Generate Slug - URL-friendly identifier
8. Map Projects - Links to portfolio pieces
9. Create Sanity Draft - Saves to CMS
10. Error Handling - Graceful fallback
11. Return Response - Sanity Studio URL

**SLA Target:** 90 seconds end-to-end

---

## 📝 Content Lifecycle

```
🤖 ai-generated  →  Fresh from AI
👀 in-review     →  Being reviewed/edited
✅ approved      →  Ready for publishing
🌐 published     →  Live on public site
📦 archived      →  No longer active
```

---

## 🎨 Portfolio Projects

AI selects 2-3 most relevant projects per application:

| ID | Project | Focus | Metric |
|----|---------|-------|--------|
| P-01 | Pivot Platform | Product Strategy | Near-zero → active re-engagement |
| P-02 | Future-Proof Foundation | Frontend Architecture | Saved 6+ months dev time |
| P-03 | Ops Autopilot | Workflow Automation | Eliminated manual job matching |
| P-04 | Knowledge Transfer Engine | Documentation | 20 min onboarding (was weeks) |
| P-05 | Career Stories Platform | AI Full-Stack | 0→1 using AI acceleration |

---

## 🧪 Available Scripts

```bash
# Development
npm run web:dev          # Start Next.js dev server (port 3000)
npm run studio:dev       # Start Sanity Studio (port 3333)

# Build
npm run web:build        # Build Next.js for production
npm run studio:build     # Build Sanity Studio for deployment

# Deployment (to be configured in M6)
npm run deploy:web       # Deploy Next.js to Hostinger
npm run deploy:studio    # Deploy Sanity Studio
```

---

## 🔧 Troubleshooting

### Port already in use

```bash
# Find process using port
lsof -iTCP:3333 -sTCP:LISTEN  # or 3000 for Next.js

# Kill process
kill <PID>

# Or use custom port
PORT=3334 npm run studio:dev
```

### Sanity not configured

If you see "Sanity not configured" message:

1. Create `web/.env.local`
2. Add `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
3. Restart dev server

### Missing dependencies

```bash
# Clean install
rm -rf node_modules web/node_modules sanity-studio/node_modules
npm install
```

---

## 📋 MVP Success Criteria

**Functionality:**
- [ ] Admin form accepts job descriptions
- [ ] n8n workflow generates content (90-sec SLA)
- [ ] Content saved as Sanity draft
- [ ] Manual review in Sanity Studio works
- [ ] Published applications show on public pages
- [ ] End-to-end automation proven

**Quality:**
- [ ] No crashes during testing
- [ ] Graceful error messages
- [ ] Clean Git history
- [ ] Documentation updated

---

## 🎓 Learning Resources

The project includes a **spaced repetition learning system**:

- `docs/learning-resources/questions/` - Recall questions (Day +1, +3, +7)
- `docs/learning-resources/posts/` - Technical deep dives
- `docs/CHANGES.md` - Session history & decisions

---

## 🌟 What Makes This Special

1. **Process Excellence** - Documentation-first approach with measurable ROI
2. **Professional Practices** - Git workflow, conventional commits (solo dev!)
3. **Real AI Integration** - Full automation workflow, not just a chatbot
4. **Full-Stack** - Next.js, CMS, Auth, n8n, AI
5. **Business Value** - Quantifiable 95-97% time savings
6. **Learning System** - Built-in knowledge retention

---

## 🤝 Contributing

This is currently a solo project, but contributions are welcome! Please:

1. Read the [Git Strategy](docs/GIT_STRATEGY.md)
2. Follow [conventional commits](https://www.conventionalcommits.org/)
3. Create feature branches from `develop`
4. Submit PRs with clear descriptions

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🔗 Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [n8n Documentation](https://docs.n8n.io)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## 📬 Contact

**Mel Jones**
- Portfolio: [Coming Soon]
- GitHub: [@MoodyBones](https://github.com/MoodyBones)

---

**Status:** Planning Complete ✅ | Ready to ship in 8 hours! 🚀
