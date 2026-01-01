import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const SANITY_TOKEN = process.env.SANITY_API_TOKEN

type ProjectInput = {
  projectId: string
  name: string
  focus?: string
  keyMetric?: string
  description?: string
  technologies?: string[]
  skillsApplied?: string[]
  organisation?: string
  year?: string
  status?: string
  url?: string
}

export async function POST(request: Request) {
  // Verify session
  const cookieStore = await cookies()
  const session = cookieStore.get('mj_session')

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check Sanity config
  if (!SANITY_PROJECT_ID || !SANITY_TOKEN) {
    return NextResponse.json({ error: 'Sanity not configured' }, { status: 500 })
  }

  try {
    const body: ProjectInput = await request.json()

    // Validate required fields
    if (!body.projectId || !body.name) {
      return NextResponse.json(
        { error: 'projectId and name are required' },
        { status: 400 }
      )
    }

    // Build Sanity document
    const document: Record<string, unknown> = {
      _type: 'project',
      projectId: body.projectId,
      name: body.name,
    }

    // Add optional fields if provided
    if (body.focus) document.focus = body.focus
    if (body.keyMetric) document.keyMetric = body.keyMetric
    if (body.description) document.description = body.description
    if (body.technologies?.length) document.technologies = body.technologies
    if (body.skillsApplied?.length) document.skillsApplied = body.skillsApplied
    if (body.organisation) document.organisation = body.organisation
    if (body.year) document.year = body.year
    if (body.status) document.status = body.status
    if (body.url) document.url = body.url

    // Create in Sanity
    const sanityUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}`

    const response = await fetch(sanityUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SANITY_TOKEN}`,
      },
      body: JSON.stringify({
        mutations: [{ create: document }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Sanity error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create project in Sanity' },
        { status: 500 }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      projectId: body.projectId,
      documentId: result.results?.[0]?.id,
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
