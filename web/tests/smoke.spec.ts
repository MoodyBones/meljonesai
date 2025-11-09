import { test, expect } from '@playwright/test'

test('home and slug pages render and contain Application heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=Application')).toBeVisible()

  await page.goto('/atlassian-role')
  await expect(page.locator('text=Introduction')).toBeVisible()
})

test('preview route redirects to slug when secret matches', async ({ request }) => {
  // Use the preview secret set in CI or local env
  const secret = process.env.SANITY_PREVIEW_SECRET || 'test-secret'
  const url = `/api/preview?secret=${encodeURIComponent(secret)}&slug=/atlassian-role`
  const res = await request.get(url, { maxRedirects: 0 }).catch((e) => e)
  // Expect a redirect (302 or 307)
  expect(res.status()).toBeGreaterThanOrEqual(300)
  expect(res.status()).toBeLessThan(400)
})
