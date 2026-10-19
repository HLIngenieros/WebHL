import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4322' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // La tira de negativos es JS propio y debe funcionar igual en Firefox (guía §12.3).
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: /nosotros\.spec\.ts/, grep: /tira de negativos/ },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4322',
    url: 'http://localhost:4322',
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
