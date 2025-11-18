import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

// Protect only /admin routes by checking for a session cookie presence.
// We don't verify the session in Edge middleware (admin SDK is not edge-safe).
// Full session verification (e.g., checking validity, expiration, etc.) happens in the server layout.
// This is intentional due to Edge Runtime limitations—do not add verification logic here.
export function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl

  if (pathname.startsWith('/admin')) {
    const session = req.cookies.get('mj_session')?.value
    // Edge middleware: fast redirect for missing cookies (Firebase Admin SDK not edge-compatible).
    // Only cookie presence is checked here; full verification happens in the server layout for layered security.
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
