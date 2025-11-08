// Sanity client wrapper
import {createClient as createSanityClient, type SanityClient, type QueryParams as SanityQueryParams} from '@sanity/client'

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

// Use a narrow params shape that matches Sanity's fetch params shape.
export type QueryParams = SanityQueryParams

export async function sanityFetch<T = unknown>(query: string, params?: QueryParams): Promise<T | null> {
  const client = getClient()
  if (!client) {
    // When Sanity is not configured (e.g. during CI or dev without env), return null so callers can guard.
    return null
  }

  if (params !== undefined) {
    return client.fetch<T>(query, params)
  }

  return client.fetch<T>(query)
}

export default getClient
