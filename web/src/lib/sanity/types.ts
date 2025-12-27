// Types for Sanity documents used by the web app

export type ProofPoint = {
  claim: string
  evidence: string
  relevance: string
}

export type ResearchContext = {
  companyPainPoints?: string[]
  roleKeywords?: string[]
  proofPoints?: ProofPoint[]
  companyResearch?: string
  toneAdjustments?: 'formal' | 'warm' | 'bold' | 'technical'
}

export type Project = {
  _id: string
  projectId: string
  name: string
  focus?: string
  keyMetric?: string
  description?: string
  technologies?: string[]
  organisation?: string
  year?: string
  url?: string
}

export type AlignmentPoint = {
  heading: string
  body: string
}

export type JobApplication = {
  _id: string
  slug: {current: string}
  targetCompany: string
  targetRoleTitle: string
  jobUrl?: string
  researchContext?: ResearchContext
  customIntroduction: string
  alignmentPoints?: AlignmentPoint[]
  linkedProjects?: Project[]
  closingStatement: string
  status: 'draft' | 'in-review' | 'ready' | 'published' | 'archived'
  publishedAt?: string
}

export type SlugString = string
