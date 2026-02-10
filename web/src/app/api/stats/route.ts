import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionCookie } from '@/lib/firebase/admin'
import { getRateLimitStatus, getBetaStats } from '@/lib/firebase/invites'

export async function GET(req: NextRequest) {
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

    // Get rate limit status and beta stats in parallel
    const [rateLimitStatus, betaStats] = await Promise.all([
      getRateLimitStatus(userId),
      getBetaStats(),
    ])

    return NextResponse.json({
      regenerations: rateLimitStatus,
      betaUsers: betaStats.betaUsers,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
