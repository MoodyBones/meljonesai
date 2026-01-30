import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionCookie } from '@/lib/firebase/admin'
import { incrementRegeneration, canRegenerate } from '@/lib/firebase/invites'

export async function POST(req: NextRequest) {
  try {
    // Get session cookie to identify user
    const sessionCookie = req.cookies.get('mj_session')?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify session and get user info
    let decodedClaims
    try {
      decodedClaims = await verifySessionCookie(sessionCookie)
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const userId = decodedClaims.uid

    // Check if user can regenerate (throws on database errors)
    let allowed: boolean
    try {
      allowed = await canRegenerate(userId)
    } catch (error) {
      console.error('Database error checking regeneration limit:', error)
      return NextResponse.json(
        { error: 'Failed to check rate limit. Please try again.' },
        { status: 500 }
      )
    }

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Daily regeneration limit reached. Try again tomorrow.',
          rateLimited: true,
        },
        { status: 429 }
      )
    }

    // Increment the regeneration counter
    const result = await incrementRegeneration(userId)

    if (!result.success) {
      // Check if this is a rate limit error or a server error
      if (result.error?.includes('limit reached')) {
        return NextResponse.json(
          {
            error: result.error,
            rateLimited: true,
          },
          { status: 429 }
        )
      }
      // Database/server error
      return NextResponse.json(
        { error: result.error || 'Failed to track regeneration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      count: result.count,
    })
  } catch (error) {
    console.error('Error in regenerate:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
