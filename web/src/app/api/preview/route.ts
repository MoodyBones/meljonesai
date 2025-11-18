import {draftMode} from 'next/headers'
import {NextResponse} from 'next/server'

// Enable Preview/Draft Mode for Studio previews.
// Usage: GET /api/preview?secret=...&slug=/path-to-preview

export async function GET(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  const slug = url.searchParams.get('slug') || '/'

  // Secret must match env var set on the Next site and in Studio preview settings
  if (!secret || secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid preview secret', {status: 401})
  }

  // Turn on Next's Draft Mode
  // draftMode's runtime typing can be a promise in some Next versions — await and call enable()
  const dm = await draftMode()
  if (typeof dm?.enable === 'function') {
    dm.enable()
  }

  // Redirect to the requested path (make sure it starts with a slash)
  const redirectTo = slug.startsWith('/') ? slug : `/${slug}`
  return NextResponse.redirect(redirectTo)
}
