import "dotenv/config"; // loads .env into process.env (locally; CI uses secrets)
import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI; // GitHub Actions sets CI=true automatically

export default defineConfig({
  // A stray test.only fails the build on CI instead of silently skipping tests
  forbidOnly: isCI,

  // One retry on CI only, since public APIs can have a slow or flaky moment
  retries: isCI ? 1 : 0,

  // Fixed worker count on CI for predictable runs; default locally
  workers: isCI ? 2 : undefined,

  // "github" adds inline failure annotations on pull requests
  reporter: isCI
    ? [["list"], ["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  // No top-level testDir or use: each project owns its folder and baseURL
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
      testDir: "./tests/auth", // full URLs in these tests, so no baseURL
    },
  ],
});