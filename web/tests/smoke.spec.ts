import { test, expect } from '@playwright/test'

test('home and slug pages return 200', async ({ request }) => {
  const home = await request.get('/')
  expect(home.status()).toBe(200)

  const slug = await request.get('/atlassian-role')
  expect(slug.status()).toBe(200)
})
