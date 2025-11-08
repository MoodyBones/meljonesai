// GROQ queries for Strategy C

export const APPLICATION_SLUGS_QUERY = `*[_type == "jobApplication" && defined(slug.current)].slug.current`

export const APPLICATION_BY_SLUG_QUERY = `
*[_type == "jobApplication" && slug.current == $slug][0]{
  ..., 
  linkedProject-> {name, focus, keyMetric}
}
`
