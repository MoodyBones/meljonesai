Title: M4 — Admin Interface

Description

This issue implements Milestone 4: build the admin UI used to submit job application requests and trigger the automation pipeline. Contains detailed tasks, deliverables, and assumptions.

Robust instructions (from Copilot guide)

- Tasks to implement:

  1. Create admin form page at `web/src/app/admin/new/page.tsx` (protected, accessible only when authenticated)
  2. Build reusable form components under `web/src/components/admin/` (e.g. `ApplicationForm.tsx`, `LoadingSpinner.tsx`)
  3. Add client-side validation and UX (loading states, friendly error messages)
  4. Add API route `web/src/app/api/trigger-workflow/route.ts` that accepts form POSTs and calls the n8n webhook
  5. Add links from admin dashboard to create new applications

- Expectations:
  - Form must be protected by Firebase auth (M1)
  - Use Tailwind CSS for styling to match the rest of the app
  - Use existing conventions and TypeScript patterns

Key deliverables

- `web/src/app/admin/new/page.tsx` (admin form page)
- `web/src/app/api/trigger-workflow/route.ts` (server-side API route)
- `web/src/components/admin/ApplicationForm.tsx`
- Tests or manual test plan for creating a job application and verifying it reaches n8n

Important pragmatic decisions

- Admin UI depends on M1 (Firebase) and M2 (n8n webhook). Implement these only after those are in place or mock them during development.
- Keep API route simple: validate input, forward to n8n webhook, return success or error.

Checklist

- [ ] Implement admin form UI
- [ ] Implement API route
- [ ] Wire up form submission to API route
- [ ] Protect route with Firebase auth
- [ ] End-to-end test form → n8n
