import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

// Protect only /admin routes by checking for a token cookie.
// We don't verify the token in Edge middleware (admin SDK is not edge-safe).
export function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('mj_token')?.value
    if (!token) {
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
