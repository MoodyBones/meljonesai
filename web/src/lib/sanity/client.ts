// Sanity client wrapper
import {createClient as createSanityClient, type SanityClient} from '@sanity/client'

const apiVersion = 'v2025-01-01'

function getClient(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  if (!projectId || !dataset) return null
  return createSanityClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: process.env.NODE_ENV === 'production',
  })
}

export async function sanityFetch<T = unknown>(query: string, params?: Record<string, unknown>) {
  const client = getClient()
  if (!client) {
    // When Sanity is not configured (e.g. during CI or dev without env), return null so callers can guard.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return null as any as T
  }

  if (params) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return client.fetch<T>(query, params as any)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return client.fetch<T>(query as any)
}

export default getClient
