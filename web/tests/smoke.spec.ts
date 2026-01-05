import {test, expect} from '@playwright/test'

test('home page redirects to login or admin', async ({page}) => {
  const response = await page.goto('/')
  // Home should redirect to /login (unauthenticated) or /admin (authenticated)
  expect(page.url()).toMatch(/\/(login|admin)/)
  expect(response?.status()).toBeLessThan(500)
})

test('login page renders sign in button', async ({page}) => {
  await page.goto('/login')
  await expect(page.locator('text=Sign in with Google')).toBeVisible()
})

test('404 page renders for non-existent slug', async ({page}) => {
  const response = await page.goto('/non-existent-slug-12345')
  // Should render not found page, not crash
  expect(response?.status()).toBe(200) // Next.js returns 200 for soft 404
  await expect(page.locator('text=Not found')).toBeVisible()
})
