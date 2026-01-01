# Day 6 Recall Questions — n8n, Rate Limits, Admin UI

## n8n Workflow Fundamentals

1. **What are the 6 nodes in the job application workflow?**
   <details>
   <summary>Answer</summary>
   Webhook → Wait → Gemini API → Parse Response (Code) → Sanity Mutation → Response
   </details>

2. **Why do we use a Wait node before the Gemini API call?**
   <details>
   <summary>Answer</summary>
   Rate limiting buffer. Gemini free tier allows 15 requests/minute. The 1-second wait prevents hitting the limit during sequential processing.
   </details>

3. **What's the difference between a Wait node and Batch processing in n8n?**
   <details>
   <summary>Answer</summary>
   - **Wait node:** Pauses between each item (1 request → wait → next request)
   - **Batch:** Groups items together, processes group, waits, processes next group

   Wait is simpler for single-request workflows. Batching is for bulk processing (50+ items).
   </details>

## Rate Limits

4. **What are the three Gemini 2.5 Flash free tier limits?**
   <details>
   <summary>Answer</summary>
   - RPD: 1,500 requests/day
   - RPM: 15 requests/minute
   - TPM: 1 million tokens/minute
   </details>

5. **If you need to process 100 job applications, what batch settings would you use?**
   <details>
   <summary>Answer</summary>
   Items per batch: 15 (matches RPM limit)
   Batch interval: 60 seconds (1 minute)
   Total time: ~7 minutes
   </details>

## Sanity Integration

6. **Why did alignment points show "missing keys" error in Sanity Studio?**
   <details>
   <summary>Answer</summary>
   Sanity requires `_key` property on array items. The original workflow didn't generate keys. Fixed by adding `_key: 'ap' + i + timestamp` in the Parse Response node.
   </details>

7. **How do we ensure unique slugs when creating multiple applications for the same company/role?**
   <details>
   <summary>Answer</summary>
   Append a timestamp to the slug: `company-role-mjv0ulev` where the suffix is `Date.now().toString(36)`.
   </details>

8. **What's the difference between `create` and `createOrReplace` in Sanity mutations?**
   <details>
   <summary>Answer</summary>
   - `create`: Fails if document with that `_id` already exists
   - `createOrReplace`: Creates new or overwrites existing document with same `_id`
   </details>

## Next.js App Router

9. **How does the home page (`/`) decide where to redirect?**
   <details>
   <summary>Answer</summary>
   ```tsx
   const cookieStore = await cookies();
   const session = cookieStore.get("mj_session");
   if (session) redirect("/admin");
   else redirect("/login");
   ```
   Server component checks for session cookie.
   </details>

10. **Why is the admin dashboard a client component (`'use client'`) but the home page is a server component?**
    <details>
    <summary>Answer</summary>
    - Home page: Only needs to read cookies and redirect (server-side)
    - Admin dashboard: Needs `useState`, `useEffect`, event handlers for sign out (client-side interactivity)
    </details>

## API Routes

11. **How does the `/api/projects` route verify the user is authenticated?**
    <details>
    <summary>Answer</summary>
    Checks for the `mj_session` cookie:
    ```tsx
    const cookieStore = await cookies();
    const session = cookieStore.get('mj_session');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    ```
    </details>

12. **Why do we POST to `/api/projects` for projects but directly to n8n for jobs?**
    <details>
    <summary>Answer</summary>
    - Jobs need AI generation (Gemini) → n8n workflow handles the orchestration
    - Projects are simple CRUD → direct Sanity mutation is sufficient
    </details>

## Documentation Strategy

13. **Why did we archive the ISSUE_BODIES and docs folders?**
    <details>
    <summary>Answer</summary>
    The detailed specs (11-node workflow, complex admin interface) were over-engineered compared to what we actually built (6-node workflow, simple forms). Keeping outdated docs causes confusion.
    </details>

14. **What's the purpose of `.gemini/CONTEXT_CONTENT_GEN.md`?**
    <details>
    <summary>Answer</summary>
    Provides voice/tone guidelines, skill matrix, and project evidence table that gets embedded in the Gemini prompt. Ensures consistent, personalised content generation.
    </details>

## Debugging

15. **When you see `429 Too Many Requests` from Gemini, what should you check?**
    <details>
    <summary>Answer</summary>
    1. Are you hitting RPM (15/min) or RPD (1500/day) limits?
    2. Is the Wait node configured correctly?
    3. Consider switching to a different model (gemini-2.5-flash works, gemini-2.0-flash may have different limits)
    </details>

---

## Quick Reference

| Concept | Key Point |
|---------|-----------|
| n8n Wait vs Batch | Wait = sequential pause, Batch = grouped processing |
| Sanity `_key` | Required on all array items |
| Gemini RPM | 15 requests/minute (free tier) |
| Session cookie | `mj_session` (7-day expiry, httpOnly) |
| Slug uniqueness | Append `Date.now().toString(36)` |
