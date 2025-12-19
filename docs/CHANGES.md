# CHANGES — Project History

Work log for MelJonesAI. Entries ordered by date (newest first).

## How to Update

1. Add new entries at the top, below this section
2. Use descriptive titles (focus area, not session numbers)
3. Include: Date, Duration, Status, Summary, Work Completed, Next Steps
4. Keep entries concise — link to PRs/issues for details

---

## Strategic Realignment & Content Creation (2025-12-19)

**Duration:** ~3 hours
**Status:** Complete

Major pivot from automation-first to craft-first approach. Phase 1 (MVP) ships one polished page with manual content. Phase 2 (Scale) adds automation later.

### Work Completed

- Updated all docs to reflect Phase 1/Phase 2 strategy
- Merged 7 Dependabot security PRs (Next.js 16.0.9, Firebase 12.6.0, Playwright 1.56.1)
- Merged PR #73 with Sanity schemas (`researchContext` nested object, `alignmentPoints` array)
- Added `organisation` and `status` fields to project schema
- Created 15 projects and 2 job applications in Sanity via API
- Updated GitHub issues #46-50 with new phase labels

### Files Changed

- README.md, docs/README.md, docs/REFERENCE.md (rewritten)
- .github/ISSUE_BODIES/M2-M6 (updated for phases)
- sanity-studio/schemaTypes/project.ts (added fields)
- .gitignore (added personal career docs)

### Next Steps

- Build public page component (`web/src/app/[slug]/page.tsx`)
- Style with one "signature moment"
- Deploy MVP to production

---

## CI/CD Pipeline Enhancements (2025-11-20)

**Duration:** 3 hours
**Status:** Complete

Sustainable CI patterns: time-boxed credentials, smart caching, graceful failures.

### Work Completed

- Created JIT token minting (`web/scripts/ci-create-id-token.mjs`) — 1hr tokens vs permanent credentials
- Added two-layer caching (npm tarballs + node_modules) — 90% faster CI
- Implemented graceful degradation when secrets missing
- Added native module validation (file exists + loads)

### Impact

- CI time: 2-3 min → 10-20 sec (warm cache)
- Security: 99.998% smaller attack window (1hr vs 365 days)
- External contributors can run basic CI without secrets

### Commits

- PR #55: Token minting + caching + secret validation
- PR #59: Error handling refinements

---

## CI/CD Debugging & Documentation Consolidation (2025-11-19)

**Duration:** 2.5 hours
**Status:** Complete

Fixed CI failures, consolidated documentation from 11 files to 4.

### Work Completed

**CI/CD Fixes:**
- Fixed native module failures (lightningcss, @tailwindcss/oxide) with explicit installation
- Corrected GitHub Actions triggers to avoid duplicate runs
- Implemented Firebase lazy initialization for build-time compatibility

**Documentation:**
- Consolidated 11 files → 4 files (63% reduction, 260KB → 70KB)
- Deleted: START_HERE.md, INDEX.md, QUICK_REFERENCE.md, GIT_STRATEGY.md, MILESTONE_SUMMARY.md, etc.
- Created: docs/README.md (entry point), docs/REFERENCE.md (architecture)
- Updated: .github/copilot-instructions.md (v2.0)

### Key Decisions

- Explicit native module installation over npm rebuild (faster, simpler)
- Firebase lazy initialization (function-level vs module-level)
- Single responsibility per documentation file

---

## Firebase Auth Implementation (2025-11-17)

**Duration:** 1.5 hours
**Status:** Complete

Implemented secure session cookie authentication for admin routes.

### Work Completed

- Created `/api/auth/session` route (POST creates cookie, DELETE clears it)
- Added `createSessionCookie` and `verifySessionCookie` helpers to admin SDK
- Updated login page to exchange ID token for server session cookie
- Protected `/admin` routes with server-side verification

### Security Improvements

- httpOnly cookies prevent XSS token theft
- Server-side verification prevents client-side bypasses
- Session cookies (1 week) vs raw ID tokens

### Files

- `web/src/app/api/auth/session/route.ts` (new)
- `web/src/lib/firebase/admin.ts` (updated)
- `web/src/app/login/page.tsx` (updated)
- `web/src/app/admin/layout.tsx` (updated)

---

## Documentation & Git Strategy (2025-11-09)

**Duration:** 2 hours
**Status:** Complete

Comprehensive documentation phase with Git workflow integration.

### Work Completed

- Created GIT_STRATEGY.md with branch naming, commit standards, PR templates
- Updated COPILOT_GUIDE_COMPLETE.md with Git workflow per milestone
- Created MILESTONE_SUMMARY.md for progress tracking
- Set up learning resources structure (spaced repetition questions, technical posts)

### Key Decisions

- Feature-branch workflow with PRs (even for solo dev)
- Branch protection for main and develop
- Conventional Commits format with milestone prefix

---

## Initial Setup & Data Layer (2025-11-06)

**Duration:** 4 hours
**Status:** Complete

Repository setup, monorepo structure, Sanity data layer.

### Work Completed

- Set up monorepo: `web/` (Next.js 15) + `sanity-studio/` (Sanity v4)
- Configured npm workspaces
- Enabled React Compiler and Turbopack
- Created Sanity client with lazy initialization
- Implemented dynamic routing (`[slug]/page.tsx`) with SSG
- Added graceful fallback when Sanity env vars missing

### Files Created

```
web/src/lib/sanity/client.ts
web/src/lib/sanity/queries.ts
web/src/app/[slug]/page.tsx
```

---

## Current Status

**Phase:** Phase 1 MVP in progress
**Current milestone:** M6a (MVP Deployment)
**Completed:** M0 (Planning), M1 (Firebase Auth), M3 (Sanity Schemas)
