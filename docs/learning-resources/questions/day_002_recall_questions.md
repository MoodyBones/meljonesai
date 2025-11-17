# Day 002 Recall Questions
## Git Workflow & Documentation Strategy

**Date:** 2025-11-09  
**Session Focus:** Git branching strategy integration and comprehensive documentation completion  
**Purpose:** Spaced repetition questions to reinforce understanding of Git workflow and documentation practices

---

## Instructions

Answer these questions without looking at the documentation. Check your answers after attempting all questions. Review incorrect answers and mark for re-study after 24 hours, 3 days, and 7 days.

---

## Questions

### Q1: Branch Naming Convention

**Question:** What is the correct branch name format for Milestone 2 (n8n Workflow), and why is it important to follow this convention?

**Answer:**

```
feature/m2-n8n-workflow

Importance:
- Clear milestone identification (m2 = Milestone 2)
- Descriptive purpose (n8n-workflow)
- Consistent with team conventions
- Easy to filter and search in git log
- Enables automated CI/CD workflows
```

**Why it matters:** Consistent naming enables quick identification of work scope, allows automated tooling, and maintains professional standards even in solo development.

---

### Q2: Commit Message Standards

**Question:** Write a complete commit message (with subject, body, and footer) for adding Firebase authentication middleware in Milestone 1. Follow the Conventional Commits standard.

**Answer:**

```
feat(m1): add Firebase authentication middleware

Implemented server-side auth protection for /admin routes.
Middleware verifies Firebase tokens using Admin SDK and
redirects unauthenticated users to /login page.

Features:
- Token verification with Firebase Admin SDK
- Automatic redirect for expired/invalid tokens
- Proper error handling and logging
- Works with Next.js 15 App Router middleware

Tested:
- ✅ Authenticated users access /admin
- ✅ Unauthenticated users redirected
- ✅ Expired tokens handled gracefully
- ✅ No console errors

Dependencies: firebase-admin@^12.0.0
```

---

### Q3: PR Review Checklist

**Question:** You're about to create a Pull Request for Milestone 3 (Sanity Schemas). What are the 5 most critical items in the self-review checklist before clicking "Merge"?

**Answer:**

```
1. ✅ Code Quality
   - No console.log statements
   - No commented-out code
   - Meaningful variable names
   - Proper TypeScript types (no 'any')

2. ✅ Testing
   - Tested locally (schemas work in Studio)
   - No TypeScript errors (npm run build)
   - All functionality works as expected

3. ✅ Documentation
   - Complex logic has comments
   - README updated if needed
   - CHANGES.md updated with session work

4. ✅ Git Hygiene
   - Commit messages follow convention
   - No merge conflicts
   - Branch up to date with base (develop)

5. ✅ Files
   - Only relevant files changed
   - No node_modules or .env files
   - .gitignore properly configured
```

---

### Q4: Branch Protection Benefits

**Question:** What are THREE specific benefits of enabling branch protection on the `main` branch for a solo developer, and what could go wrong without it?

**Answer:**

```
Benefits:
1. Prevents Accidental Force Pushes
   - Can't accidentally rewrite history with --force
   - Protects against losing work
   - Maintains clean git history

2. Enforces Quality Gates
   - Must create PR (forces review of diff)
   - Can't merge if build fails
   - Ensures tests pass before merge

3. Documents Changes
   - PR descriptions create change records
   - Easy to see what was done and why
   - Helps future you understand decisions

Without protection:
- Accidentally force push and lose work
- Merge broken code to production
- Skip testing and break live site
- No documentation of what changed
- Harder to debug issues later
```

---

### Q5: Git Workflow Phases

**Question:** Walk through the complete Git workflow for completing Milestone 1 (Firebase Setup), from starting the feature branch to cleaning up after merge. Include all key commands.

**Answer:**

```
Phase 1: Start Milestone
git checkout develop
git pull origin develop
git checkout -b feature/m1-firebase-setup
git push -u origin feature/m1-firebase-setup

Phase 2: During Development
[Make changes to files]
git add web/src/lib/firebase/config.ts
git commit -m "feat(m1): add Firebase client configuration

- Initialize Firebase app with env vars
- Singleton pattern to prevent multiple init
- Export auth instance

Tested locally with Google Sign-In."
git push origin feature/m1-firebase-setup

[Repeat for each task]

Phase 3: Complete Milestone
git add .
git commit -m "feat(m1): complete Firebase authentication setup

All M1 tasks completed and tested."
git push origin feature/m1-firebase-setup

gh pr create \
  --title "M1: Firebase Setup Complete ✅" \
  --body "All tasks complete, tested locally" \
  --base develop \
  --head feature/m1-firebase-setup

[Review PR, then merge via GitHub]

Phase 4: Cleanup
git checkout develop
git pull origin develop
git branch -d feature/m1-firebase-setup
git push origin --delete feature/m1-firebase-setup

Phase 5: Start Next Milestone
git checkout -b feature/m2-n8n-workflow
```

---

### Q6: Documentation Structure

**Question:** The MelJonesAI project has 7 main documentation files. Match each document to its primary purpose and when you would reference it.

**Answer:**

```
1. COPILOT_GUIDE_COMPLETE.md (43KB)
   Purpose: Complete reference with all prompts and workflows
   When: During development, copy task-specific prompts
   
2. QUICKSTART.md (14KB)
   Purpose: Fast onboarding, 5-minute setup guide
   When: First time setup, returning to project after break

3. GIT_STRATEGY.md (15KB)
   Purpose: Comprehensive Git workflow guide
   When: Git questions, branch naming, commit messages

4. MILESTONE_SUMMARY.md (21KB)
   Purpose: Progress tracking and task management
   When: Daily - check current tasks, update progress

5. CHANGES.md
   Purpose: Chronological session history
   When: End of day - document work completed

6. PROJECT_SPEC_REVISED.md
   Purpose: Technical architecture and requirements
   When: Architecture questions, understanding system design

7. ROADMAP_REVISED.md
   Purpose: Detailed milestone breakdown
   When: Planning sessions, estimating work remaining
```

---

### Q7: EOD Knowledge Routine

**Question:** According to the copilot-instructions.md, what are the THREE mandatory documents you must create at the end of each work session, and what is the purpose of each?

**Answer:**

```
1. day_XXX_recall_questions.md
   Path: docs/learning-resources/questions/
   Purpose: Spaced repetition study guide
   Content: 5-7 short-answer questions covering challenging concepts
   Format: Q&A with explanations
   Review: After 24 hours, 3 days, 7 days

2. day_XXX_linked_post_1.md
   Path: docs/learning-resources/posts/
   Purpose: Technical deep dive summary
   Content: 200-300 words on major technical decision
   Example: "Why we chose Turbopack over Webpack"
   Audience: Future you, other developers

3. day_XXX_linked_post_2.md
   Path: docs/learning-resources/posts/
   Purpose: CX/Product rationale
   Content: 200-300 words on product/design choice
   Example: "Why dynamic routing improves UX"
   Audience: Product managers, stakeholders
```

---

*Spaced repetition is proven to improve long-term retention. Stick with the review schedule!*

---

**Created:** 2025-11-09  
**Session:** Day 002 - Git Strategy & Documentation  
**Next Review:** 2025-11-10
