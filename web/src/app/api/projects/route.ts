import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/admin'

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  // Verify session
  const cookieStore = await cookies()
  const session = cookieStore.get('mj_session')

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get current user from session
  const currentUser = await getCurrentUser(session.value)
  if (!currentUser?.uid) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Check Sanity config
  if (!SANITY_PROJECT_ID || !SANITY_TOKEN) {
    return NextResponse.json({ error: 'Sanity not configured' }, { status: 500 })
  }

  try {
    // Query projects for current user
    const query = `*[_type == "project" && userId == $userId] | order(_createdAt desc)`
    const sanityUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`

    const response = await fetch(sanityUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SANITY_TOKEN}`,
      },
      body: JSON.stringify({
        params: { userId: currentUser.uid },
      }),
    })

    if (!response.ok) {
      let errorMessage = 'Failed to fetch projects from Sanity'
      try {
        const errorData = await response.json()
        console.error('Sanity query error:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // Response is not JSON, use default message
        console.error('Sanity query error: non-JSON response', response.status)
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      projects: result.result || [],
      count: result.result?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  // Verify session
  const cookieStore = await cookies()
  const session = cookieStore.get('mj_session')

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get current user from session
  const currentUser = await getCurrentUser(session.value)
  if (!currentUser?.uid) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
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
      userId: currentUser.uid,
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
      let errorMessage = 'Failed to create project in Sanity'
      try {
        const errorData = await response.json()
        console.error('Sanity error:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // Response is not JSON, use default message
        console.error('Sanity error: non-JSON response', response.status)
      }
      return NextResponse.json(
        { error: errorMessage },
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
