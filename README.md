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
