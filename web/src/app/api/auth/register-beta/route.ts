import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionCookie } from '@/lib/firebase/admin'
import { registerBetaUser, isUserBetaRegistered } from '@/lib/firebase/invites'

export async function POST(req: NextRequest) {
  try {
    // Get session cookie to identify user
    const sessionCookie = req.cookies.get('mj_session')?.value
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify session and get user info
    let decodedClaims
    try {
      decodedClaims = await verifySessionCookie(sessionCookie)
    } catch {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const userId = decodedClaims.uid
    const email = decodedClaims.email

    if (!email) {
      return NextResponse.json(
        { error: 'Email required for beta registration' },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const alreadyRegistered = await isUserBetaRegistered(userId)
    if (alreadyRegistered) {
      return NextResponse.json({
        ok: true,
        alreadyRegistered: true,
        message: 'Already registered as beta user',
      })
    }

    // Get invite code from cookie
    const inviteCode = req.cookies.get('validInvite')?.value
    if (!inviteCode) {
      return NextResponse.json(
        { error: 'No valid invite code. Please visit the homepage with an invite link.' },
        { status: 400 }
      )
    }

    // Register the beta user
    const result = await registerBetaUser(userId, email, inviteCode)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Registration failed' },
        { status: 400 }
      )
    }

    // Clear the invite cookie after successful registration
    const response = NextResponse.json({
      ok: true,
      alreadyRegistered: false,
      message: 'Successfully registered as beta user',
    })

    // Clear the validInvite cookie
    response.cookies.set('validInvite', '', {
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Error in register-beta:', error)
    return NextResponse.json(
      { error: 'Server error during registration' },
      { status: 500 }
    )
  }
}
