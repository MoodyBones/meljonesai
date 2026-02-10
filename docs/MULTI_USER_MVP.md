# Multi-User MVP Implementation

## Overview
This document describes the changes made to enable multi-user support in the Steep platform.

## Changes Implemented

### 1. Firebase Authentication ✅
**File:** `web/src/lib/firebase/config.ts`

Added account picker to Google Sign-In:
```typescript
googleProvider.setCustomParameters({ prompt: 'select_account' });
```

**Impact:** Users will now see the Google account picker every time they sign in, allowing multiple users to switch accounts.

### 2. Sanity Schema Updates ✅

#### Project Schema
**File:** `sanity-studio/schemaTypes/project.ts`

Added `userId` field:
```typescript
defineField({
  name: 'userId',
  title: 'User ID',
  type: 'string',
  description: 'Firebase UID of the project owner. Enables multi-user support.',
  validation: (Rule) => Rule.required(),
  hidden: true,
}),
```

#### Job Application Schema
**File:** `sanity-studio/schemaTypes/jobApplication.ts`

Added `userId` field:
```typescript
defineField({
  name: 'userId',
  title: 'User ID',
  type: 'string',
  group: 'meta',
  description: 'Firebase UID of the application owner. Enables multi-user support.',
  validation: (Rule) => Rule.required(),
  hidden: true,
}),
```

**Note:** The `profile` schema already had an `ownerId` field, so no changes were needed there.

### 3. Backend API Updates ✅

#### Firebase Admin Utility
**File:** `web/src/lib/firebase/admin.ts`

Added `getCurrentUser()` function to extract user info from session cookies:
```typescript
export async function getCurrentUser(sessionCookie: string) {
  try {
    const decodedClaims = await verifySessionCookie(sessionCookie)
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || null,
      name: decodedClaims.name || null,
    }
  } catch (error) {
    console.error('Failed to verify session cookie:', error)
    return null
  }
}
```

#### Projects API
**File:** `web/src/app/api/projects/route.ts`

**POST endpoint:** Now includes `userId` when creating projects
- Extracts current user from session cookie
- Automatically adds `userId: currentUser.uid` to all new projects

**GET endpoint (NEW):** Filters projects by current user
- Query: `*[_type == "project" && userId == $userId] | order(_createdAt desc)`
- Returns only projects belonging to the authenticated user

### 4. Dashboard Updates ✅
**File:** `web/src/app/admin/page.tsx`

- Added project count display
- Fetches project count on mount via GET `/api/projects`
- Shows message when user needs more projects (minimum 3 required)
- Disables "Rebuild Profile" button if less than 3 projects
- Updated profile rebuild to send user's ID token to n8n webhook

### 5. Job Application Updates ✅
**File:** `web/src/app/admin/job/page.tsx`

- Updated to send user's ID token to n8n webhook
- Added TODO comments for n8n webhook updates needed

## What Still Needs To Be Done

### n8n Webhook Updates (REQUIRED) 🔴
The n8n workflows need to be updated to handle multi-user scenarios:

#### Profile Builder Webhook
**Current:** Fetches all projects from Sanity (no filtering)
```
POST /webhook/build-profile
Body: (empty)
```

**Needs to be:**
```
POST /webhook/build-profile
Body: { idToken: "firebase-id-token" }
```

**Required Changes:**
1. Accept `idToken` in request body
2. Verify token using Firebase Admin SDK
3. Extract `userId` from token
4. Filter projects query: `*[_type == "project" && userId == $userId]`
5. Filter profile query: `*[_type == "profile" && ownerId == $userId][0]`

#### Job Matcher Webhook
**Current:** Uses hardcoded profile (single user)
```
POST /webhook/match-job
Body: { companyName, roleTitle, jobUrl, jobDescription }
```

**Needs to be:**
```
POST /webhook/match-job
Body: { companyName, roleTitle, jobUrl, jobDescription, idToken }
```

**Required Changes:**
1. Accept `idToken` in request body
2. Verify token using Firebase Admin SDK
3. Extract `userId` from token
4. Filter profile query: `*[_type == "profile" && ownerId == $userId][0]`
5. Filter projects query: `*[_type == "project" && userId == $userId]`
6. Add `userId` when creating job application documents

### Data Migration 🟡
Existing projects and applications in Sanity need userId added:

**Option 1: Manual in Sanity Studio**
- Open each project/application
- Add your Firebase UID to the `userId` field

**Option 2: Migration Script**
Create a script to:
1. Fetch all projects without `userId`
2. Set `userId` to your Firebase UID (or delete test data)
3. Patch documents in Sanity

### Testing Checklist ✅

#### Single User Testing
- [x] Can sign in with Google
- [x] Can create projects
- [x] Projects are stored with userId
- [x] Dashboard shows project count
- [x] Profile rebuild button disabled until 3 projects
- [x] Can sign out

#### Multi-User Testing (Requires env setup)
- [ ] User A can sign in
- [ ] User A creates 3 projects
- [ ] User A sees only their projects
- [ ] User B can sign in (sees account picker)
- [ ] User B sees 0 projects
- [ ] User B creates 3 projects
- [ ] User B sees only their projects
- [ ] User A logs back in, sees only their projects
- [ ] Profile generation for User A only uses User A's projects
- [ ] Profile generation for User B only uses User B's projects

## Security Considerations

### Session Cookies
- Uses httpOnly cookies for session storage
- Prevents XSS attacks
- SameSite=Strict prevents CSRF

### API Routes
- All project routes require valid session cookie
- Server-side verification of Firebase tokens
- userId automatically extracted from session (can't be spoofed)

### Sanity Data Access
- API routes use server-side Sanity token (not exposed to client)
- All queries filtered by authenticated user's ID
- Hidden userId fields in Sanity Studio

## Performance Notes

### Database Queries
- Added userId index would improve query performance (Sanity handles this automatically)
- All project queries now filter by userId

### Caching
- Dashboard fetches project count on mount
- Could be optimized with SWR or React Query for better UX

## Known Limitations

1. **n8n Webhooks:** Currently not multi-user aware (see "What Still Needs To Be Done")
2. **Existing Data:** Needs migration to add userId to existing documents
3. **Profile Creation:** No UI yet for initial profile creation (profile schema exists but no form)

## Next Steps

1. **Update n8n workflows** (Priority: HIGH)
   - Add Firebase Admin SDK to n8n
   - Update profile-builder workflow
   - Update job-matcher workflow

2. **Migrate existing data** (Priority: MEDIUM)
   - Add userId to existing projects
   - Add ownerId to existing profiles
   - Add userId to existing applications

3. **Testing** (Priority: HIGH)
   - Set up test environment
   - Test with 2+ users
   - Verify data isolation

4. **Documentation** (Priority: MEDIUM)
   - Update README with multi-user setup
   - Document n8n webhook changes
   - Create user guide

## References

- Firebase Auth: https://firebase.google.com/docs/auth/web/google-signin
- Sanity GROQ Queries: https://www.sanity.io/docs/groq
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
