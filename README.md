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
