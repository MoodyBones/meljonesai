import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {createSessionCookie} from '@/lib/firebase/admin'
import type {CreateSessionRequest, CreateSessionResponse} from '@/lib/types/auth'

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
const MAX_AGE_SECONDS = Math.floor(ONE_WEEK_MS / 1000)

function makeCookieHeader(value: string | null, maxAgeSeconds: number) {
  const isProduction = process.env.NODE_ENV !== 'development';
  const cookieOptions = [
    `mj_session=${value || ''}`,
    'Path=/',
    `Max-Age=${value ? maxAgeSeconds : 0}`,
    'HttpOnly',
    'SameSite=Strict',
    ...(isProduction ? ['Secure'] : []),
  ];
  return cookieOptions.join('; ');
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateSessionRequest
    const idToken = body?.idToken

    if (!idToken) {
      return NextResponse.json({error: 'Missing idToken'}, {status: 400})
    }

    // Create a Firebase session cookie (server-side) from the ID token
    const sessionCookie = await createSessionCookie(idToken, ONE_WEEK_MS)

    const headers = {
      'Set-Cookie': makeCookieHeader(sessionCookie, MAX_AGE_SECONDS),
    }

    const payload: CreateSessionResponse = {ok: true}
    return NextResponse.json(payload, {status: 200, headers})
  } catch (err: unknown) {
    console.error('Error creating session cookie', err)
    const message = err instanceof Error ? err.message : String(err)
    const payload: CreateSessionResponse = {error: message || 'Server error'}
    return NextResponse.json(payload, {status: 500})
  }
}

export async function DELETE() {
  // Clear the session cookie
  const headers = {'Set-Cookie': makeCookieHeader(null, 0)}
  return NextResponse.json({ok: true}, {status: 200, headers})
}
