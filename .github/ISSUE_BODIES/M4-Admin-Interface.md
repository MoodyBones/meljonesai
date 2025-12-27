Title: M4 — Admin Interface (Phase 2)

## Description

**Phase:** 2 (Scale)
**Status:** Planned
**Dependencies:** M1 (Firebase Auth), M2 (n8n Workflow), M3 (Sanity Schemas)

This milestone builds the admin UI for submitting job applications and triggering the n8n automation pipeline. This is Phase 2 work—the MVP ships first with manually curated content in Sanity Studio.

---

## Why Phase 2?

Phase 1 focuses on shipping one polished page with manually curated content. The admin interface adds convenience for generating multiple applications via automation, which is a scaling concern.

For Phase 1, content is entered directly in Sanity Studio. The admin interface becomes valuable when you need to generate many applications quickly.

---

## Routes

### `/admin` — Dashboard

- List all job applications (table view)
- Show: company, role, status, date
- Filter by status (draft, in-review, ready, published, archived, ai-generated)
- Quick actions: edit in Sanity, archive
- Link to create new application

### `/admin/new` — New Application Form

**Form Fields:**
- Job Description (textarea, required) — Paste the full JD
- Company Name (text, required)
- Role Title (text, required)
- Job URL (url, optional)
- Notes (textarea, optional)
- Priority (select: high/medium/low)

**Submit Button:** "Generate Application"
- Shows loading state during generation
- On success: displays link to Sanity draft
- On error: shows error message, allows retry

### `/api/trigger-workflow` — API Route

**Request:**
```typescript
POST /api/trigger-workflow
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "jobDescription": "...",
  "companyName": "Atlassian",
  "roleTitle": "Senior Product Designer",
  "jobUrl": "https://...",
  "notes": "...",
  "priority": "high"
}
```

**Response (success):**
```json
{
  "status": "success",
  "sanityUrl": "https://meljonesai.sanity.studio/desk/jobApplication;drafts.abc123"
}
```

**Response (error):**
```json
{
  "status": "error",
  "message": "Failed to generate application"
}
```

**Implementation:**
1. Verify Firebase auth token
2. Validate request body
3. POST to n8n webhook with `N8N_WEBHOOK_SECRET`
4. Return n8n response

---

## UI Components

### ApplicationForm.tsx

```typescript
// web/src/components/admin/ApplicationForm.tsx
- Form with controlled inputs
- Client-side validation
- Loading state during submission
- Success/error display
- Tailwind styling
```

### ApplicationList.tsx

```typescript
// web/src/components/admin/ApplicationList.tsx
- Fetch applications from Sanity
- Table with sortable columns
- Status badge with emoji
- Action buttons (edit, archive)
```

### LoadingSpinner.tsx

```typescript
// web/src/components/admin/LoadingSpinner.tsx
- Accessible loading indicator
- Used during form submission
```

---

## Key Deliverables

- `web/src/app/admin/new/page.tsx` — Form page
- `web/src/app/api/trigger-workflow/route.ts` — API route
- `web/src/components/admin/ApplicationForm.tsx`
- `web/src/components/admin/ApplicationList.tsx`
- Update `web/src/app/admin/page.tsx` — Add list and create link

---

## Security

- All admin routes protected by Firebase auth (via M1 middleware)
- API route verifies Firebase ID token before processing
- n8n webhook secured with shared secret
- No sensitive data exposed to client

---

## Testing Checklist

- [ ] Form validates required fields
- [ ] Loading state displays during submission
- [ ] Success shows Sanity Studio link
- [ ] Error displays message and retry option
- [ ] API route rejects unauthenticated requests
- [ ] API route validates request body
- [ ] n8n webhook receives correct payload
- [ ] Application list fetches and displays data
- [ ] Status filter works

---

## Definition of Done

- [ ] Admin form page implemented
- [ ] API route implemented and tested
- [ ] Application list with status filter
- [ ] All routes protected by auth
- [ ] Loading and error states
- [ ] End-to-end: form → n8n → Sanity draft
- [ ] Responsive on mobile
