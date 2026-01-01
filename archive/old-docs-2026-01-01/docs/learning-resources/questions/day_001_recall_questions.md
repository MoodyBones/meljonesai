# Day 001 — Recall Questions

1. What is the React Compiler in Next.js and why enable it?

- Short answer: The React Compiler is a compile-time transform introduced to optimize JSX and enable future React features; enabling it (via `reactCompiler: true` in `next.config.*`) can improve compile-time performance and unlock compile-time optimizations.

2. What role does Turbopack play in modern Next.js development and how does it compare to Webpack?

- Short answer: Turbopack is Next.js's newer bundler focusing on vastly faster incremental builds and dev server start times compared to Webpack; tradeoffs include maturity and ecosystem coverage.

3. Why did we see a message about "lockfile missing swc dependencies" and what should you do?

- Short answer: Next patched the lockfile to include native `@next/swc` packages; you should run `npm install` to download the SWC binaries for stable, fast builds.

4. When moving Sanity into `sanity-studio/`, what are the main benefits and one important caveat?

- Short answer: Benefits: separation of concerns, simpler workspace management, clearer CI/deploy steps. Caveat: update relative paths and `.env` references and ensure compatible React/Next versions or keep them isolated.

5. What is the simplest way to resolve a dev port conflict (e.g., port 3333 in use)?

- Short answer: Either stop the occupying process (find with `lsof -iTCP:3333`) or override the port when starting the server (e.g., `env PORT=3334 npm run dev`).

6. How do npm workspaces help when you have `web/` and `sanity-studio/` in one repo?

- Short answer: Workspaces allow hoisted installs and shared top-level `node_modules`, simplify scripts from the root, and make CI installs easier; use `workspaces` in root `package.json`.

7. What quick sanity check should you run after starting dev servers?

- Short answer: Confirm listeners (`lsof -iTCP -sTCP:LISTEN`) and perform a simple HTTP request (`curl -I http://localhost:3000`, `curl -I http://localhost:3333`) to verify HTTP 200 responses.

---

Notes: These flashcards reflect the session where we created a Next app (React compiler enabled), moved Sanity into `sanity-studio/`, resolved port conflicts, and hoisted workspace installs.
