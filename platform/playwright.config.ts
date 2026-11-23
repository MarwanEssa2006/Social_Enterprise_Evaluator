import { defineConfig, devices } from "@playwright/test";

// E2E against a production build on port 3100 with an isolated database (no effect on dev data).
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: "http://localhost:3100",
    timeout: 120_000,
    reuseExistingServer: false,
  },
});
