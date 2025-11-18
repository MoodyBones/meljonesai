import {test, expect} from '@playwright/test'

test.describe('Auth smoke tests', () => {
  test('unauthenticated /admin redirects to /login and login page shows button', async ({page}) => {
    await page.goto('/admin')
    // Expect to be redirected to /login (or see login content)
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('text=Sign in with Google')).toBeVisible()
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
      // allow redirects so we can inspect headers if needed
    })

    expect(res.ok()).toBeTruthy()

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
        secure: process.env.NODE_ENV !== 'development',
      },
    ])

    // Now visit /admin and expect protected content
    await page.goto('/admin')
    await expect(page.locator('text=Admin Dashboard')).toBeVisible()
  })
})
