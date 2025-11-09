# MelJonesAI - Product Requirements Canvas (PRC)

**Project:** AI-Powered Career Narrative Platform  
**Owner:** Mel Jones  
**Date:** 2025-11-09  
**Status:** Pre-MVP → Launch by EOD

---

## 1. PROBLEM STATEMENT

### The Pain
Applying for jobs requires crafting unique, compelling narratives for each position. This process is:
- **Time-consuming:** 2-4 hours per application to research company + tailor content
- **Inconsistent:** Quality varies based on energy/time available
- **Not scalable:** Can't maintain quality when applying to multiple roles
- **Metric-light:** Hard to quantify impact without structured data

### Who Experiences This
Senior-level tech professionals (PM, UX, Frontend) with:
- Diverse project portfolios
- Multiple specializations
- Need to demonstrate measurable business impact
- Limited time for job search

### Current Workarounds
- Generic cover letters (low conversion)
- Manual copy-paste from portfolio (disjointed narrative)
- Over-reliance on LinkedIn profile (not customized)
- Skipping applications due to time constraints

---

## 2. SOLUTION VISION

### What We're Building
An automated system that transforms any job description into a hyper-personalized application page in under 5 minutes, combining:
- AI analysis of job requirements
- Intelligent matching to proven project metrics
- Professional, ready-to-deploy web pages
- Single-source-of-truth content management

### How It Works
1. **Input:** Paste job description into n8n workflow
2. **Process:** LLM analyzes requirements → matches to skill matrix → generates content
3. **Storage:** Auto-creates Sanity document with 5 custom fields
4. **Output:** Static page deployed at `/[company-role]` URL

### Success Metrics
- Time to create application: < 5 minutes (currently 2-4 hours)
- Application quality score: Consistent 8-9/10 (currently 5-8/10)
- Applications per week: 5-10 (currently 1-2)
- Interview conversion rate: Track after 10 applications

---

## 3. USER STORIES & ACCEPTANCE CRITERIA

### Epic 1: Content Creation Pipeline

**US-1.1: As a job seeker, I want to input a job description and get a custom application page**
- AC1: Can paste job description into n8n webhook
- AC2: System extracts company name, role title, key requirements
- AC3: Generates 5 custom content blocks
- AC4: Creates Sanity document with unique slug
- AC5: Page is accessible at `/[slug]` immediately

**US-1.2: As a job seeker, I want AI to match job requirements to my proven projects**
- AC1: System identifies technical requirements (Frontend, Product, AI)
- AC2: Automatically selects 2-3 relevant projects from P-01 to P-05
- AC3: Includes specific metrics in narrative
- AC4: Links requirements to skill matrix categories

**US-1.3: As a job seeker, I want professional, ready-to-share content**
- AC1: Content follows established voice guidelines
- AC2: Includes specific metrics and business impact
- AC3: No generic statements or jargon without backing data
- AC4: Professional typography and layout
- AC5: Mobile-responsive design

### Epic 2: Content Management

**US-2.1: As a content owner, I want to edit applications in Sanity Studio**
- AC1: All jobApplication fields are editable
- AC2: Can link/unlink projects
- AC3: Preview mode shows live changes
- AC4: Can publish/unpublish applications

**US-2.2: As a content owner, I want to manage my project portfolio**
- AC1: CRUD operations for project documents
- AC2: Can update metrics and descriptions
- AC3: Changes reflect across all linked applications

### Epic 3: Technical Infrastructure

**US-3.1: As a developer, I want type-safe development**
- AC1: TypeScript types generated from Sanity schemas
- AC2: Zero `any` types in production code
- AC3: Compile-time validation of GROQ queries

**US-3.2: As a developer, I want fast local development**
- AC1: Hot reload < 500ms
- AC2: Both dev servers start with single command
- AC3: Clear error messages for missing env vars

**US-3.3: As a developer, I want reliable deployments**
- AC1: Preview deployments for every commit
- AC2: Production deployment on merge to main
- AC3: Automatic Sanity schema migration

---

## 4. OUT OF SCOPE (V1)

**Not Building:**
- ❌ User authentication (single user only)
- ❌ Multi-tenant support
- ❌ Public job board
- ❌ Resume generation
- ❌ Interview prep tools
- ❌ Application tracking system
- ❌ Email integration
- ❌ Analytics dashboard
- ❌ A/B testing of content variations
- ❌ Social sharing features

**Future Consideration (V2+):**
- Multi-user support
- Application tracking/CRM
- Interview question generator
- Salary negotiation templates

---

## 5. TECHNICAL CONSTRAINTS

### Must Have
- ✅ Static site generation (no server required for pages)
- ✅ Sub-3-second page loads
- ✅ Mobile-first responsive design
- ✅ Lighthouse score > 90
- ✅ Zero client-side JavaScript for content rendering

### Nice to Have
- 🎯 ISR (Incremental Static Regeneration) for updates
- 🎯 Preview mode with draft content
- 🎯 Image optimization
- 🎯 Structured data for SEO

### Cannot Have
- ❌ Client-side authentication
- ❌ Real-time collaboration
- ❌ Video content
- ❌ Heavy animations

---

## 6. DEPENDENCIES & RISKS

### External Dependencies
| Dependency | Risk Level | Mitigation |
|------------|-----------|------------|
| Sanity API | Low | Free tier sufficient, stable service |
| Claude API | Medium | Rate limits - add retry logic, use caching |
| n8n Self-hosted | Medium | Local instance, backup workflows to git |
| Vercel Deployment | Low | Well-documented, generous free tier |

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| Sanity schema changes break build | High | Low | Version control schemas, test before deploy |
| LLM API rate limits during peak | Medium | Medium | Implement request queuing, caching strategy |
| n8n workflow complexity | Medium | High | Start simple, iterate, document well |
| Type generation from Sanity | Low | Low | Use official Sanity CLI tools |

### Resource Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| EOD deadline too aggressive | High | Ruthless scope management, MVP-first mentality |
| Learning curve for n8n | Medium | Use existing templates, simple first workflow |
| Content quality inconsistency | Medium | Strict prompt engineering, test with 3+ examples |

---

## 7. MVP DEFINITION

**Minimum Viable Product (EOD Target):**

### Must Ship
1. ✅ 1 complete Sanity schema (jobApplication + project)
2. ✅ 1 working dynamic page template
3. ✅ 2-3 hand-crafted sample applications
4. ✅ Basic Tailwind styling (professional, readable)
5. ✅ Deployed to Vercel
6. ✅ Local dev environment fully functional

### Should Have (If Time Permits)
- 🎯 Basic n8n workflow (manual trigger)
- 🎯 1 test AI-generated application
- 🎯 Project portfolio in Sanity

### Can Defer
- Later: Full AI automation
- Later: Preview mode
- Later: Custom Sanity Studio UI
- Later: Analytics

---

## 8. SUCCESS CRITERIA

### Definition of Done (MVP)
- [ ] Can create new jobApplication in Sanity Studio
- [ ] Can view application at `/[slug]` URL locally
- [ ] Can build production site successfully
- [ ] Can deploy to Vercel without errors
- [ ] Application page passes Lighthouse performance audit (>90)
- [ ] Content follows copilot instructions guidelines
- [ ] README updated with setup instructions

### Launch Checklist
- [ ] Environment variables documented
- [ ] Sample content added (2-3 applications)
- [ ] TypeScript builds without errors
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] SEO meta tags configured
- [ ] Error states handled gracefully
- [ ] Git repository pushed to GitHub
- [ ] Vercel domain configured

---

## 9. FUTURE ROADMAP (POST-MVP)

### Phase 2: AI Automation (Week 2)
- Full n8n workflow with webhook trigger
- Claude API integration for content generation
- Automatic Sanity document creation
- Email notification on completion

### Phase 3: Portfolio Enhancement (Week 3-4)
- Rich project detail pages
- Case study format
- Image galleries
- Video embeds

### Phase 4: Application Tracking (Month 2)
- Application status field
- Response tracking
- Interview notes
- Follow-up reminders

---

## 10. STAKEHOLDER SIGNOFF

**Product Owner:** Mel Jones  
**Developer:** Mel Jones  
**Designer:** Mel Jones  

**Approved for Development:** 2025-11-09  
**Target Launch:** 2025-11-09 EOD  

---

*This PRC is a living document. Update as requirements evolve or scope changes.*
