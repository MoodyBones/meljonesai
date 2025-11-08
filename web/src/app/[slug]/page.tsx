import React from 'react'
import {sanityFetch} from '@/lib/sanity/client'
import {APPLICATION_BY_SLUG_QUERY, APPLICATION_SLUGS_QUERY} from '@/lib/sanity/queries'

type Params = {params: {slug: string}}

type LinkedProject = {
  name?: string
  focus?: string
  keyMetric?: string
}

type Application = {
  targetCompany?: string
  targetRoleTitle?: string
  customIntroduction?: string
  linkedProject?: LinkedProject
}

export async function generateStaticParams() {
  // If Sanity env is not configured, return no slugs so build won't fail.
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return []
  const slugs = await sanityFetch<string[]>(APPLICATION_SLUGS_QUERY)
  return (slugs || []).map((s: string) => ({slug: s}))
}

export default async function Page(props: Params) {
  // In Next 16 params may be a Promise; await it before accessing properties.
  // See: https://nextjs.org/docs/messages/sync-dynamic-apis
  const {slug} = (await props.params) as {slug: string}

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Sanity not configured</h1>
        <p className="mt-4 text-muted-foreground">
          Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET to fetch data.
        </p>
      </div>
    )
  }

  const data = await sanityFetch<Record<string, unknown> | null>(APPLICATION_BY_SLUG_QUERY, {slug})

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Not found</h1>
        <p className="mt-4 text-muted-foreground">No application found for &quot;{slug}&quot;</p>
      </div>
    )
  }

  const {targetCompany, targetRoleTitle, customIntroduction, linkedProject} =
    (data as unknown as Application) || {}

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl bg-white rounded-lg shadow p-8">
        <h2 className="text-sm text-gray-500">Application</h2>
        <h1 className="text-3xl font-bold mt-2">
          {targetCompany} — {targetRoleTitle}
        </h1>

        <section className="mt-6">
          <h3 className="text-xl font-semibold">Introduction</h3>
          <p className="mt-2 text-gray-700">{customIntroduction}</p>
        </section>

        {linkedProject && (
          <section className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold">Linked project</h3>
            <p className="mt-2">
              <strong>{linkedProject.name}</strong> — {linkedProject.focus}
            </p>
            <p className="mt-1 text-sm text-gray-600">Key metric: {linkedProject.keyMetric}</p>
          </section>
        )}
      </div>
    </main>
  )
}
