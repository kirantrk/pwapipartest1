import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// export default defineConfig({
//   testDir: './tests',
//   /* Run tests in files in parallel */
//   fullyParallel: true,
//   /* Fail the build on CI if you accidentally left test.only in the source code. */
//   forbidOnly: !!process.env.CI,
//   /* Retry on CI only */
//   retries: process.env.CI ? 2 : 0,
//   /* Opt out of parallel tests on CI. */
//   workers: process.env.CI ? 1 : undefined,
//   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
//   reporter: 'html',
//   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
//   use: {
//     /* Base URL to use in actions like `await page.goto('')`. */
//     // baseURL: 'http://localhost:3000',

//     /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
//     trace: 'on-first-retry',
//   },

export default defineConfig({
  testDir: "./tests",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "https://jsonplaceholder.typicode.com",
    extraHTTPHeaders: { Accept: "application/json" },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "jsonplaceholder",
      testDir: "./tests/jsonplaceholder",
      use: {
        baseURL: "https://jsonplaceholder.typicode.com",
        extraHTTPHeaders: { Accept: "application/json" },
      },
    },
    {
      name: "booker",
      testDir: "./tests/booker",
      use: {
        baseURL: "https://restful-booker.herokuapp.com",
        extraHTTPHeaders: { Accept: "application/json" },
      },
    },
    {
      name: "auth",
      testDir: "./tests/auth",
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
