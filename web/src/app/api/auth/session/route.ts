import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {createSessionCookie} from '@/lib/firebase/admin'

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

function makeCookieHeader(value: string | null, maxAgeSeconds: number) {
  const secureFlag = process.env.NODE_ENV === 'development' ? '' : '; Secure'
  if (!value) {
    // Clear cookie
    return `mj_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${secureFlag}`
  }
  return `mj_session=${value}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Strict${secureFlag}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const idToken: string | undefined = body?.idToken

    if (!idToken) {
      return NextResponse.json({error: 'Missing idToken'}, {status: 400})
    }

    // Create a Firebase session cookie (server-side) from the ID token
    const sessionCookie = await createSessionCookie(idToken, ONE_WEEK_MS)

    const maxAgeSeconds = Math.floor(ONE_WEEK_MS / 1000)

    const headers = {
      'Set-Cookie': makeCookieHeader(sessionCookie, maxAgeSeconds),
    }

    return NextResponse.json({ok: true}, {status: 200, headers})
  } catch (err: unknown) {
    console.error('Error creating session cookie', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({error: message || 'Server error'}, {status: 500})
  }
}

export async function DELETE() {
  // Clear the session cookie
  const headers = {'Set-Cookie': makeCookieHeader(null, 0)}
  return NextResponse.json({ok: true}, {status: 200, headers})
}
