import {test, expect} from '@playwright/test'

test('home page shows landing page', async ({page}) => {
  const response = await page.goto('/')
  // Home should show landing page (no longer redirects)
  expect(response?.status()).toBeLessThan(500)
  // Landing page should have the app name
  await expect(page.locator('h1')).toContainText('Steep')
})

test('login page loads without server error', async ({page}) => {
  const response = await page.goto('/login')
  // Page should load without 500 error
  expect(response?.status()).toBeLessThan(500)
  // Wait for any content to render (page should have a body with content)
  await expect(page.locator('body')).not.toBeEmpty()
})

test('non-existent slug returns without server error', async ({page}) => {
  const response = await page.goto('/non-existent-slug-12345')
  // Page should not crash with 500 error
  expect(response?.status()).toBeLessThan(500)
})
