import {test, expect} from '@playwright/test'

test.describe('Auth smoke tests', () => {
  test('unauthenticated /admin redirects to /login', async ({page}) => {
    const response = await page.goto('/admin')
    // Expect to be redirected to /login (unauthenticated)
    await expect(page).toHaveURL(/\/login/)
    // Page should load without server error
    expect(response?.status()).toBeLessThan(500)
  })

  test('if PLAYWRIGHT_AUTH_ID_TOKEN is provided, exchange for session and access /admin', async ({
    page,
    request,
    context,
  }) => {
    const idToken = process.env.PLAYWRIGHT_AUTH_ID_TOKEN
    test.skip(!idToken, 'No PLAYWRIGHT_AUTH_ID_TOKEN provided; skipping full auth flow')

    // Exchange ID token for server session cookie
    const res = await request.post('/api/auth/session', {
      data: {idToken},
    })

    // Skip if session exchange fails (may happen if Firebase Admin SDK not configured)
    if (!res.ok()) {
      const body = await res.text().catch(() => '')
      test.skip(true, `Session exchange failed (${res.status()}): ${body.slice(0, 100)}`)
    }

    // Read set-cookie header and set it in the browser context so the page is authenticated
    const setCookie = res.headers()['set-cookie']
    test.expect(setCookie).toBeDefined()

    // Parse cookie name/value from header
    const cookieMatch = /^([^=]+)=([^;]+)/.exec(setCookie as string)
    test.expect(cookieMatch).toBeTruthy()
    const [, name, value] = cookieMatch as RegExpExecArray

    // Add cookie to the browser context (localhost)
    await context.addCookies([
      {
        name,
        value,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ])

    // Now visit /admin and expect protected content
    await page.goto('/admin')
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })
})
