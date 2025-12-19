import type {Metadata} from 'next'
import {sanityFetch} from '@/lib/sanity/client'
import {APPLICATION_BY_SLUG_QUERY, APPLICATION_SLUGS_QUERY} from '@/lib/sanity/queries'
import type {JobApplication, Project, ResearchContext} from '@/lib/sanity/types'

type PageProps = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return []
  const slugs = await sanityFetch<string[]>(APPLICATION_SLUGS_QUERY)
  return (slugs || []).map((s: string) => ({slug: s}))
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {slug} = await params

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return {title: 'Application'}
  }

  const data = await sanityFetch<JobApplication | null>(APPLICATION_BY_SLUG_QUERY, {slug})

  if (!data) {
    return {title: 'Not Found'}
  }

  const title = `${data.targetRoleTitle} at ${data.targetCompany} | Mel Jones`
  const description = data.customIntroduction?.slice(0, 160) || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

const TONE_LABELS: Record<string, string> = {
  formal: 'Formal & Corporate',
  warm: 'Warm & Conversational',
  bold: 'Bold & Direct',
  technical: 'Technical & Precise',
}

function ResearchContextAccordion({context, company}: {context: ResearchContext; company: string}) {
  const hasContent =
    context.companyPainPoints?.length ||
    context.roleKeywords?.length ||
    context.proofPoints?.length ||
    context.companyResearch ||
    context.toneAdjustments

  if (!hasContent) return null

  return (
    <details className="group rounded-lg border border-amber-200 bg-amber-50/50">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-amber-900 hover:bg-amber-100/50">
        <svg
          className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        How I researched this application
      </summary>
      <div className="border-t border-amber-200 px-4 py-4 text-sm text-amber-900">
        <div className="space-y-4">
          {context.companyPainPoints && context.companyPainPoints.length > 0 && (
            <div>
              <h4 className="font-medium">{company}&apos;s Pain Points I Can Address</h4>
              <ul className="mt-1 list-disc pl-5 space-y-0.5 text-amber-800">
                {context.companyPainPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {context.roleKeywords && context.roleKeywords.length > 0 && (
            <div>
              <h4 className="font-medium">Key Terms from Job Description</h4>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {context.roleKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-amber-200/60 px-2 py-0.5 text-xs text-amber-900"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {context.proofPoints && context.proofPoints.length > 0 && (
            <div>
              <h4 className="font-medium">My Proof Points</h4>
              <ul className="mt-1 space-y-2">
                {context.proofPoints.map((point) => (
                  <li key={point.claim} className="rounded bg-amber-100/50 p-2">
                    <p className="font-medium text-amber-900">{point.claim}</p>
                    <p className="mt-0.5 text-amber-800">{point.evidence}</p>
                    {point.relevance && (
                      <p className="mt-0.5 text-xs italic text-amber-700">
                        Relevance: {point.relevance}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {context.companyResearch && (
            <div>
              <h4 className="font-medium">Company Research Notes</h4>
              <p className="mt-1 text-amber-800 whitespace-pre-line">{context.companyResearch}</p>
            </div>
          )}

          {context.toneAdjustments && (
            <div>
              <h4 className="font-medium">Tone</h4>
              <p className="mt-1 text-amber-800">
                {TONE_LABELS[context.toneAdjustments] || context.toneAdjustments}
              </p>
            </div>
          )}
        </div>
      </div>
    </details>
  )
}

function ProjectCard({project}: {project: Project}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900">{project.name}</h4>
          {project.focus && (
            <p className="mt-1 text-sm text-gray-600">{project.focus}</p>
          )}
        </div>
        {project.organisation && (
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {project.organisation}
          </span>
        )}
      </div>

      {project.keyMetric && (
        <p className="mt-3 text-sm font-medium text-emerald-700">
          {project.keyMetric}
        </p>
      )}

      {project.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
          {project.description}
        </p>
      )}

      {project.technologies && project.technologies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        {project.year && <span>{project.year}</span>}
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View project
          </a>
        )}
      </div>
    </div>
  )
}

export default async function ApplicationPage({params}: PageProps) {
  const {slug} = await params

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Sanity not configured</h1>
          <p className="mt-4 text-gray-600">
            Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET to fetch data.
          </p>
        </div>
      </div>
    )
  }

  const data = await sanityFetch<JobApplication | null>(APPLICATION_BY_SLUG_QUERY, {slug})

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Not found</h1>
          <p className="mt-4 text-gray-600">
            No application found for &quot;{slug}&quot;
          </p>
        </div>
      </div>
    )
  }

  const {
    targetCompany,
    targetRoleTitle,
    researchContext,
    customIntroduction,
    alignmentPoints,
    linkedProjects,
    closingStatement,
  } = data

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
            Application for
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {targetRoleTitle}
          </h1>
          <p className="mt-2 text-xl text-gray-600">
            at {targetCompany}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8 sm:py-12">
        {/* Research Context Accordion */}
        {researchContext && (
          <section className="mb-8">
            <ResearchContextAccordion context={researchContext} company={targetCompany} />
          </section>
        )}

        {/* Introduction */}
        <section>
          <div className="prose prose-gray max-w-none">
            {customIntroduction.split('\n\n').map((paragraph) => (
              <p key={paragraph} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Alignment Points */}
        {alignmentPoints && alignmentPoints.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Why I&apos;m a great fit
            </h2>
            <div className="mt-6 space-y-6">
              {alignmentPoints.map((point) => (
                <div key={point.heading} className="rounded-lg bg-white border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900">{point.heading}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">{point.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Linked Projects */}
        {linkedProjects && linkedProjects.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Relevant Projects
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {linkedProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* Closing Statement */}
        <section className="mt-12 rounded-lg bg-gray-900 p-6 sm:p-8">
          <p className="text-gray-100 leading-relaxed">
            {closingStatement}
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-500">
            Mel Jones
          </p>
        </footer>
      </div>
    </main>
  )
}
