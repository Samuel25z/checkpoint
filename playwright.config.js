import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5174', trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/serve.mjs 5174', url: 'http://localhost:5174', reuseExistingServer: true },
  projects: [
    { name: 'pc', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'celular', use: { ...devices['Pixel 5'], viewport: { width: 375, height: 812 } } }
  ]
});
