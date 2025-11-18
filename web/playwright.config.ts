import {defineConfig, devices} from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {timeout: 5000},
  retries: 1,
  use: {
    headless: true,
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    viewport: {width: 1280, height: 720},
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['junit', {outputFile: 'test-results/results.xml'}],
    ['html', {open: 'never', outputFolder: 'test-results/html-report'}],
  ],
})
