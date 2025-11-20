# MelJonesAI Documentation

**An AI-powered job application generator** that automates content creation from form to published page.

**Status:** M1 Complete! 🎉 | CI/CD Enhanced ✅ | Ready for M2 ⛵
**Last Updated:** 2025-11-20

*Celebrating progress! M1 shipped to production. Small wins matter.* ❤️

---

## ⛵ Development Philosophy

**Energy management over speed.** We use boats, not rockets. Learning to surf the waves.

**Core principles:**
- **Sustainable building practices** - Pace yourself, build to last
- **Flow with constraints** - Work with the environment, don't fight it
- **Quality over quantity** - Less code, better code
- **Graceful degradation** - Systems adapt, not break
- **Knowledge preservation** - Document to remember, not to impress

*Inspired by sustainable software craftsmanship. Built for the long haul.*

---

## 🎯 What is MelJonesAI?

Streamlines job application content creation:

1. Fill out application form (`/admin/new`)
2. n8n workflow researches company + generates tailored content (Gemini AI)
3. Content saved to Sanity CMS for review
4. Next.js renders SEO-optimized application pages
5. Focus on relationships, not repetitive writing

**Tech Stack:** Next.js 15 | Firebase Auth | Sanity CMS | n8n | Gemini AI

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

## ⛵ Quick Navigation

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

## 📊 Current Status

### Completed ✅

- **M0:** Planning & Documentation - Foundation laid
- **M1:** Firebase Authentication - Session-based auth, httpOnly cookies
- **CI/CD:** Enhanced pipeline - JIT tokens, smart caching, graceful degradation

### What We've Built

**Authentication (M1)**
- Secure session cookies (not localStorage)
- Google OAuth integration
- Protected admin routes

**CI/CD (Sessions 4-5)**
- Time-boxed credentials (1hr vs 365 days)
- Two-layer caching (90% faster)
- Graceful degradation (missing secrets → skip, don't break)
- All checks passing ✅

### Next ⛵

M2: n8n Workflow → M3: Sanity Schemas → M4: Admin UI → M5: Content Gen → M6: Deploy

*See [CHANGES.md](./CHANGES.md) for session history*

---

## 💡 Learning Resources

### End-of-Day Knowledge Routine

**Purpose:** Remember what you learned. Knowledge preserved, not lost.

Each session creates three documents:

1. **Recall Questions** - Test yourself (review: 24h, 3d, 7d)
2. **Technical Deep Dive** - How we built it, why it works
3. **Product Rationale** - User impact, business value

**Topics covered:**
- Monorepo workspace architecture
- Session-based auth (httpOnly cookies)
- Firebase lazy initialization (SSR-compatible)
- Just-in-time token minting (security)
- Two-layer caching (performance)
- Graceful degradation (resilience)

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

## ⛵ Development Workflow

### Daily Flow

1. Pull latest → Check progress ([CHANGES.md](./CHANGES.md))
2. Create feature branch → Reference task prompts ([ISSUE_BODIES](../.github/ISSUE_BODIES/))
3. Build → Commit → PR
4. End of session: Update docs, create learning resources

**Sustainable pace.** Work in focused blocks. Document to remember. Rest to recharge.

### Commit Convention

```bash
feat(m2): add webhook endpoint
fix(m1): correct session expiration
docs: update architecture
ci: enhance caching
```

*See [copilot-instructions.md](../.github/copilot-instructions.md) for full workflow*

---

## 📝 End-of-Session (EOS) Process

**Purpose:** Preserve knowledge and maintain project documentation after each work session.

### EOS Checklist (15-20 min)

Follow these steps at the end of every development session:

#### 1. Check for Uncommitted Changes
```bash
git status
```
- Ensure all work is committed or stashed
- No loose files should remain uncommitted

#### 2. Update CHANGES.md
Add a new session entry documenting:
- **Duration** - Time spent on session
- **Status** - Complete/In Progress/Blocked
- **Focus** - Main objectives
- **Summary** - Brief overview (2-3 sentences)
- **Work Completed** - Detailed breakdown by category
- **Files Created/Updated** - List with file paths
- **Technical Decisions** - Key choices made and why
- **Testing Completed** - What was validated
- **Next Steps** - Clear actions for next session
- **Notes** - Important context

See [CHANGES.md](./CHANGES.md) Session 4 for template example.

#### 3. Create Learning Resources (3-Document Pattern)

Create three documents in `docs/learning-resources/`:

**A. Recall Questions** (`questions/day_XXX_recall_questions.md`)
- 5-7 spaced repetition questions covering key concepts
- Include detailed answers
- Add review schedule (24hr, 3-day, 7-day)
- Focus on concepts that should become second nature

**B. Technical Deep Dive** (`posts/day_XXX_linked_post_1.md`)
- Explain major technical decisions in depth
- Why we chose specific approaches
- Trade-offs considered
- Implementation details
- Debugging patterns discovered
- Further reading references

**C. Product Rationale** (`posts/day_XXX_linked_post_2.md`)
- UX and product implications of technical decisions
- User-facing impact
- Business value delivered
- ROI analysis (time saved, quality improved)
- Metrics and measurements

#### 4. Verify Documentation Updates

Check that these are current:
- ✅ **README.md** - Status section reflects current milestone
- ✅ **QUICKSTART.md** - Setup steps still accurate
- ✅ **REFERENCE.md** - Architecture changes documented
- ✅ **.github/copilot-instructions.md** - New patterns added

#### 5. Final Commit

Commit all EOS documentation:
```bash
git add docs/CHANGES.md docs/learning-resources/
git commit -m "docs: add Day XXX EOS documentation and learning resources

- Update CHANGES.md with session work
- Create recall questions for spaced repetition
- Document technical decisions (linked post 1)
- Document product rationale (linked post 2)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 6. Push to Remote (if applicable)
```bash
git push origin develop
```

### Why EOS Matters

**Knowledge Retention:**
- Spaced repetition prevents forgetting
- Technical decisions documented while fresh
- Context preserved for future sessions

**Onboarding:**
- New contributors learn from past decisions
- Historical context prevents repeated mistakes
- Learning resources accelerate understanding

**ROI:**
- 15-20 min investment per session
- Saves hours in context recovery
- Compounds over time

### EOS Time Budget

| Task | Duration |
|------|----------|
| Check uncommitted changes | 1 min |
| Update CHANGES.md | 5-8 min |
| Create recall questions | 3-4 min |
| Write technical deep dive | 4-5 min |
| Write product rationale | 4-5 min |
| Verify docs current | 2 min |
| Final commit & push | 1 min |
| **Total** | **15-20 min** |

### When to Skip EOS

Only skip EOS if:
- Session was < 30 minutes
- No meaningful work completed
- Pure documentation reading session

**Default: Always do EOS** - It's almost always worth it.

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

### Getting Started (20 min)

1. Clone & install → [QUICKSTART.md](./QUICKSTART.md)
2. Skim architecture → [REFERENCE.md](./REFERENCE.md)
3. Review recent work → [CHANGES.md](./CHANGES.md) (last 3 sessions)
4. Pick a task → [ISSUE_BODIES](../.github/ISSUE_BODIES/)

### Sustainable Practices

- ✅ Feature branches (`feature/mX-description`)
- ✅ Conventional commits (`feat(m2): add feature`)
- ✅ Run checks before pushing (typecheck, lint, build)
- ✅ Update CHANGES.md end-of-session
- ✅ Create learning resources (preserve knowledge)

**Remember:** Sustainable pace. Quality over speed. Document to remember.

---

## 📈 Progress

**Time invested:** 12+ hours (planning, M1, CI/CD)
**Value delivered:** Secure auth, fast CI, maintainable docs
**Test coverage:** Smoke tests (Playwright)
**CI status:** All green ✅

**Philosophy in action:**
- Documentation: 11 files → 4 files (63% reduction, clearer)
- CI time: 2-3 min → 10-20 sec (90% faster, sustainable)
- Security: 365-day credentials → 1-hour tokens (99.998% safer)

---

**Project start:** 2025-11-09
**Current phase:** M1 Complete 🎉 | M2 Ready ⛵

*For detailed session history: [CHANGES.md](./CHANGES.md)*
