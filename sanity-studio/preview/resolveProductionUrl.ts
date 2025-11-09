import type {SanityDocument} from 'sanity'

/**
 * Resolve a preview URL for a Sanity document.
 * Returns the Next preview endpoint which will enable Draft Mode and redirect to the page.
 *
 * Example usage in a custom desk structure or preview pane:
 *   const url = resolveProductionUrl(document)
 *   // open `${url}` in iframe or new tab
 */
export function resolveProductionUrl(doc: SanityDocument): string {
  const slug = (doc?.slug?.current || doc._id || '').toString()
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const secret = process.env.SANITY_PREVIEW_SECRET || 'replace-me'
  const path = slug.startsWith('/') ? slug : `/${slug}`
  return `${base}/api/preview?secret=${encodeURIComponent(secret)}&slug=${encodeURIComponent(path)}`
}

export default resolveProductionUrl
