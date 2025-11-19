# MelJonesAI Documentation

**An AI-powered job application generator** that automates the entire process from admin form submission to published, SEO-optimized application pages.

**Status:** M1 Complete ✅ | CI/CD Fixed ✅ | Ready for M2
**Last Updated:** 2025-11-19

---

## 🎯 What is MelJonesAI?

MelJonesAI streamlines the job application process by:
1. Admin fills out application form (`/admin/new`)
2. n8n workflow automatically generates tailored content via Gemini AI
3. Content published to Sanity CMS
4. Next.js pages render SEO-optimized application pages
5. No manual content writing required

**Tech Stack:** Next.js 15 (App Router) | Firebase Auth | Sanity CMS | n8n | Gemini AI

---

## 📚 Documentation Quick Start

### For New Contributors

**Read in this order (20 min total):**

1. **[QUICKSTART.md](./QUICKSTART.md)** (10 min)
   - Environment setup
   - Dev server commands
   - Daily workflow

2. **[REFERENCE.md](./REFERENCE.md)** (10 min, skim)
   - Project architecture
   - Milestone overview
   - Tech stack details

3. **[CHANGES.md](./CHANGES.md)** (ongoing)
   - What's been done
   - Session history
   - Current progress

### For Active Development

**Primary Reference:**
- **[.github/copilot-instructions.md](../.github/copilot-instructions.md)** - Comprehensive development guidelines
  - CI/CD configuration
  - Firebase patterns
  - Git workflow
  - Testing strategies
  - Common troubleshooting

**Task-Specific Prompts:**
- **[.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/)** - Copy-paste Copilot prompts for each milestone
  - M1: Firebase Setup
  - M2: n8n Workflow
  - M3: Sanity Schemas
  - M4: Admin Interface
  - M5: Content Generation
  - M6: Testing & Deployment

---

## 🗂️ Documentation Structure

```
docs/
├── README.md              # This file - start here
├── QUICKSTART.md          # Environment setup & daily workflow
├── CHANGES.md             # Session history & progress log
├── REFERENCE.md           # Architecture & milestone details
└── learning-resources/
    ├── questions/         # Spaced repetition recall questions
    └── posts/             # Technical deep dives & product rationale

.github/
├── copilot-instructions.md   # Development guidelines (comprehensive)
├── ISSUE_BODIES/             # M1-M6 task prompts for Copilot
└── README_SECRETS.md         # GitHub Secrets setup guide
```

---

## 🚀 Quick Navigation

### Common Questions

**"How do I set up the project?"**
→ [QUICKSTART.md](./QUICKSTART.md)

**"What's the architecture?"**
→ [REFERENCE.md](./REFERENCE.md) - Part 1: Architecture

**"What are the milestones?"**
→ [REFERENCE.md](./REFERENCE.md) - Part 2: Milestones

**"What was done yesterday?"**
→ [CHANGES.md](./CHANGES.md)

**"How do I fix CI errors?"**
→ [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Troubleshooting section

**"How do I build [specific feature]?"**
→ [.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/) - Copy task-specific prompts

**"What's the Git workflow?"**
→ [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Git Workflow section

---

## 📊 Current Project Status

### Completed Milestones

- ✅ **M0:** Planning & Documentation (6 hours)
- ✅ **M1:** Firebase Authentication (3 hours)
  - httpOnly session cookies
  - Google OAuth integration
  - Protected admin routes
  - Playwright smoke tests

### CI/CD Status

- ✅ All checks passing
- ✅ Native modules configured (lightningcss, tailwind oxide)
- ✅ Firebase lazy initialization patterns
- ✅ TypeScript type safety

### Next Steps

- 🎯 **M2:** n8n Workflow Setup
- 🎯 **M3:** Sanity CMS Schemas
- 🎯 **M4:** Admin Interface
- 🎯 **M5:** Content Generation
- 🎯 **M6:** Testing & Deployment

See [CHANGES.md](./CHANGES.md) for detailed session history.

---

## 💡 Learning Resources

### End-of-Day Knowledge Routine

Each work session includes three learning documents:

1. **Recall Questions** (`learning-resources/questions/day_XXX_recall_questions.md`)
   - Spaced repetition study guide
   - Review at: 24hrs, 3 days, 7 days

2. **Technical Deep Dive** (`learning-resources/posts/day_XXX_linked_post_1.md`)
   - Major technical decisions explained
   - Why we chose specific approaches

3. **Product Rationale** (`learning-resources/posts/day_XXX_linked_post_2.md`)
   - UX and product implications
   - User-facing impact of decisions

**Topics covered:**
- Turbopack vs Webpack
- Monorepo workspace architecture
- Feature-branch workflow for solo devs
- httpOnly session cookies vs client tokens
- Firebase lazy initialization patterns
- CI token minting for Playwright tests

---

## 🔐 Security Notes

### Environment Variables

**NEVER commit:**
- `.env.local` files
- `FIREBASE_PRIVATE_KEY` (catastrophic if exposed)
- Service account credentials

**Use GitHub Secrets for CI:**
- See [.github/README_SECRETS.md](../.github/README_SECRETS.md) for setup guide
- All Firebase Admin credentials
- Gemini API keys
- n8n webhook URLs

---

## 🛠️ Development Workflow

### Daily Routine

1. **Pull latest** → `git pull origin develop`
2. **Check progress** → Review [CHANGES.md](./CHANGES.md)
3. **Create feature branch** → `git checkout -b feature/m2-n8n-workflow`
4. **Reference task prompts** → Copy from [.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/)
5. **Build feature** → Follow Copilot prompts
6. **Commit with convention** → `feat(m2): add webhook endpoint`
7. **Create PR** → Review diff, merge to develop
8. **Update CHANGES.md** → Document session work
9. **Create EOD docs** → Recall questions + posts

### Git Commit Convention

**Format:** `<type>(mX): <subject>`

```bash
feat(m2): add n8n webhook endpoint
fix(m1): correct session cookie expiration
docs(m3): update Sanity schema documentation
ci: add native module installation step
```

See [.github/copilot-instructions.md](../.github/copilot-instructions.md) for complete Git workflow.

---

## 📞 Getting Help

### Documentation Issues

1. Check [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Troubleshooting section
2. Review recent commits: `git log --oneline -10`
3. Search learning resources: `grep -r "keyword" docs/learning-resources/`
4. Check GitHub Actions logs: `gh run view --log-failed`

### Development Questions

1. **Architecture:** See [REFERENCE.md](./REFERENCE.md)
2. **Setup:** See [QUICKSTART.md](./QUICKSTART.md)
3. **Git workflow:** See [.github/copilot-instructions.md](../.github/copilot-instructions.md)
4. **Specific tasks:** See [.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/)

---

## 🎓 For Collaborators

### First-Time Setup (30 min)

1. **Clone & install** → Follow [QUICKSTART.md](./QUICKSTART.md)
2. **Understand architecture** → Skim [REFERENCE.md](./REFERENCE.md)
3. **Learn Git workflow** → Read [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Git section
4. **Review recent work** → Check last 3 entries in [CHANGES.md](./CHANGES.md)
5. **Pick a task** → Choose from [.github/ISSUE_BODIES/](../.github/ISSUE_BODIES/)

### Development Best Practices

- ✅ Use feature branches (`feature/mX-description`)
- ✅ Follow conventional commit format
- ✅ Create PR for all merges to develop
- ✅ Run CI locally before pushing (`npm run typecheck && npm run lint && npm run build`)
- ✅ Update CHANGES.md at end of session
- ✅ Create EOD learning docs (recall questions + posts)

---

## 📈 Project Metrics

**Planning Investment:** 6 hours
**Implementation Time:** 3 hours (M1)
**Documentation Size:** ~200KB (comprehensive)
**Test Coverage:** Smoke tests (Playwright)
**CI/CD Status:** Green ✅

---

**Last Updated:** 2025-11-19
**Project Start:** 2025-11-09
**Current Phase:** M1 Complete, M2 Ready

For detailed session history, see [CHANGES.md](./CHANGES.md).
