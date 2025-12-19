// GROQ queries for MelJonesAI

// Only return slugs for published applications (for SSG)
export const APPLICATION_SLUGS_QUERY = `
*[_type == "jobApplication" && status == "published" && defined(slug.current)].slug.current
`

// Fetch full application with expanded project references
export const APPLICATION_BY_SLUG_QUERY = `
*[_type == "jobApplication" && slug.current == $slug][0]{
  _id,
  slug,
  targetCompany,
  targetRoleTitle,
  jobUrl,
  customIntroduction,
  alignmentPoints[]{
    heading,
    body
  },
  linkedProjects[]->{
    _id,
    projectId,
    name,
    focus,
    keyMetric,
    description,
    technologies,
    organisation,
    year,
    url
  },
  closingStatement,
  status,
  publishedAt
}
`
