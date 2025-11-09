# Sanity Clean Content Studio

Congratulations, you have now installed the Sanity Content Studio, an open-source real-time content editing environment connected to the Sanity backend.

Now you can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- [Join the Sanity community](https://www.sanity.io/community/join?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)

## Local development

This repository contains two projects:

- Sanity Content Studio (root) — the content editing studio. By default it serves on port 3333.
- Next.js web app (in `web/`) — the frontend site created with the React Compiler enabled. It serves on port 3000 by default.

Quick start (fish shell)

1. Run the Sanity studio (from repo root):

```fish
cd /Users/melmini/Work/meljonesai
# temporary port override:
env PORT=3334 npm run dev
# or set it for the session then run:
set -x PORT 3334
npm run dev
```

2. Run the Next web app (from its folder):

```fish
cd /Users/melmini/Work/meljonesai/web
npm install        # first time only
npm run dev
# or from repo root:
cd /Users/melmini/Work/meljonesai
npm run web:dev
```

Notes

- Sanity defaults to port 3333; if that port is in use you can override with `PORT` as shown above.
- The Next app in `web/` has the React Compiler enabled via `web/next.config.ts`.
- To use npm workspaces (hoisted install), run `npm install` at the repo root; this will install both the studio and `web/` workspace dependencies.
- Stop running servers with Ctrl+C, or find and kill the process (e.g., `lsof -iTCP:3333 -sTCP:LISTEN` then `kill <PID>`).

## Repository scripts

From the repo root you can use the following convenience scripts:

- `npm run web:dev` — start the Next.js web app (from `web/`).
- `npm run studio:dev` — start the Sanity studio (from `sanity-studio/`).
- `npm run web:build` — build the Next app for production.
- `npm run studio:build` — build the Sanity studio for deployment.

Example (run both dev servers in separate terminals):

```fish
npm run studio:dev
# open a new tab
npm run web:dev
```

Root-level install (optional)

If you want npm to hoist and install dependencies for both workspaces in one go, run from the repo root:

```fish
npm install
```

This will create a single `node_modules/` at the repository root that serves both projects.

If you'd rather keep separate installs, `cd` into each directory and run `npm install` there.

## Sanity configuration for the Next data layer

The Next app in `web/` is wired to fetch content from the Sanity studio using the public environment variables:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

If these are not set, pages that rely on Sanity will show a friendly fallback message: "Sanity not configured — Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET to fetch data." (this is expected during initial setup).

To configure locally, create a `.env.local` file in the `web/` folder (or at the repo root) with the following contents:

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=yourProjectIdHere
NEXT_PUBLIC_SANITY_DATASET=production
# optional: NEXT_PUBLIC_SANITY_API_VERSION=v2025-01-01
```

After adding the env file, restart the Next dev server so it picks up the values:

```fish
# from repo root
npm run web:dev
# or inside web/
# cd web && npm run dev
```

Then open a sample page in your browser (for example: `http://localhost:3000/atlassian-role`). If Sanity is running and contains `jobApplication` documents, the page should render the content instead of the fallback.


## 📚 Documentation

**Start here:** [docs/START_HERE.md](docs/START_HERE.md) ⭐

Complete project documentation is in the `docs/` folder:

- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Fast lookups and daily commands
- **[Setup Guide](docs/QUICKSTART.md)** - Environment configuration
- **[Progress Tracking](docs/MILESTONE_SUMMARY.md)** - Daily task checklists
- **[Copilot Guide](docs/COPILOT_GUIDE_COMPLETE.md)** - AI-assisted development
- **[Git Strategy](docs/GIT_STRATEGY.md)** - Branching and workflow
- **[Complete Index](docs/INDEX.md)** - All documentation catalog

### Quick Start

1. Read [docs/START_HERE.md](docs/START_HERE.md) for complete overview
2. Follow [docs/QUICKSTART.md](docs/QUICKSTART.md) for environment setup
3. Track progress in [docs/MILESTONE_SUMMARY.md](docs/MILESTONE_SUMMARY.md)
4. Use [docs/COPILOT_GUIDE_COMPLETE.md](docs/COPILOT_GUIDE_COMPLETE.md) for development

**Documentation Status:** Planning 100% ✅ | Implementation Ready 🎯
