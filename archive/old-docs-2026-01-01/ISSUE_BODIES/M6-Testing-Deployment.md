Title: M6 — Testing & Deployment

## Description

M6 is split into two sub-milestones:

- **M6a (Phase 1):** Deploy MVP — one polished page with manually curated content
- **M6b (Phase 2):** Full deployment — complete system with automation

---

## M6a: MVP Deployment (Phase 1)

**Phase:** 1 (MVP)
**Status:** Pending
**Dependencies:** M3 (Sanity Schemas with content)

### Objective

Deploy one polished, publicly-accessible application page.

### Key Tasks

1. **Build public page component**
   - Create `web/src/app/[slug]/page.tsx`
   - Fetch jobApplication from Sanity by slug
   - Render content with styling
   - Include linked projects

2. **Static generation**
   - Implement `generateStaticParams()` for published applications
   - Configure revalidation for content updates

3. **Polish**
   - Responsive design (mobile-first)
   - Accessible (Lighthouse >= 90)
   - Typography hierarchy
   - One "signature moment" (memorable interaction/detail)

4. **Meta tags & OG image**
   - Dynamic title and description
   - OG image for social sharing
   - Favicon

5. **Meta layer (optional)**
   - Subtle banner: "This page is dynamically generated from a structured content system I built"
   - Link to architecture explanation

6. **Deploy**
   - Build production bundle
   - Deploy to Hostinger VPS
   - Configure domain/SSL
   - Verify on real devices

### Success Criteria

- [ ] Page renders at `/[slug]`
- [ ] Content displays correctly
- [ ] Lighthouse accessibility >= 90
- [ ] Works on mobile Safari
- [ ] OG image renders when shared on LinkedIn/Twitter
- [ ] Page loads in < 2 seconds
- [ ] Deployed to production URL

### Definition of Done (M6a)

- [ ] Public page component implemented
- [ ] One application with curated content published
- [ ] SSG working with `generateStaticParams()`
- [ ] OG image and meta tags
- [ ] Responsive and accessible
- [ ] Deployed and verified on real devices

---

## M6b: Full Production Deployment (Phase 2)

**Phase:** 2 (Scale)
**Status:** Planned
**Dependencies:** M5 (Content Generation Testing)

### Objective

Deploy complete system with automation pipeline.

### Key Tasks

1. **n8n deployment**
   - Install n8n on Hostinger VPS
   - Configure environment variables
   - Set up SSL for webhook endpoint
   - Import workflow JSON

2. **Admin UI deployment**
   - Build and deploy admin pages
   - Configure Firebase for production domain
   - Test auth flow

3. **End-to-end testing**
   - Admin form → n8n → Gemini → Sanity → public page
   - Error scenarios
   - Performance under load

4. **Monitoring**
   - n8n execution logs
   - Error alerting
   - Sanity webhook notifications

5. **Documentation**
   - Update README with production URLs
   - Document deployment process
   - Create runbook for common issues

### Success Criteria

- [ ] n8n accessible and running
- [ ] Admin form triggers workflow
- [ ] AI-generated drafts appear in Sanity
- [ ] Published pages render correctly
- [ ] All E2E tests pass
- [ ] Error handling works

### Definition of Done (M6b)

- [ ] n8n deployed and configured
- [ ] Admin UI deployed
- [ ] E2E tests passing
- [ ] Monitoring in place
- [ ] Documentation updated
- [ ] Production checklist complete

---

## Production Checklist

### Environment Variables

**GitHub Secrets (CI):**
- [ ] FIREBASE_PRIVATE_KEY
- [ ] FIREBASE_CLIENT_EMAIL
- [ ] FIREBASE_PROJECT_ID
- [ ] NEXT_PUBLIC_FIREBASE_API_KEY
- [ ] SANITY_WRITE_TOKEN (Phase 2)
- [ ] N8N_WEBHOOK_SECRET (Phase 2)
- [ ] ANTHROPIC_API_KEY (if using)

**Hostinger VPS:**
- [ ] All NEXT_PUBLIC_* variables
- [ ] Firebase private credentials
- [ ] Sanity tokens
- [ ] n8n environment (Phase 2)

### Security

- [ ] HTTPS configured
- [ ] Firebase auth domain whitelisted
- [ ] Secrets not in code
- [ ] httpOnly cookies working
- [ ] CORS configured if needed

### Performance

- [ ] Images optimized
- [ ] Fonts preloaded
- [ ] Bundle size reasonable
- [ ] Caching headers set

### SEO

- [ ] Title tags
- [ ] Meta descriptions
- [ ] OG images
- [ ] Canonical URLs
- [ ] robots.txt

---

## Deployment Commands

```bash
# Build Next.js
cd web && npm run build

# Build Sanity Studio
cd sanity-studio && npm run build

# Start production server
npm run start

# Or with PM2
pm2 start npm --name "meljonesai" -- start
```

---

## Post-Deployment Smoke Tests

### Phase 1 (M6a)

- [ ] Homepage loads
- [ ] `/login` works
- [ ] `/admin` redirects if not authed
- [ ] Public application page loads at `/[slug]`
- [ ] Content displays correctly
- [ ] Mobile responsive

### Phase 2 (M6b)

- [ ] Admin form submits
- [ ] n8n webhook receives request
- [ ] Gemini generates content
- [ ] Sanity draft created
- [ ] Draft visible in Studio
- [ ] Published page updates
