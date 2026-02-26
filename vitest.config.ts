import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Mock for webextension-polyfill in Storybook tests (not a real extension context)
const webExtPolyfillMock = path.resolve(dirname, ".storybook/webextension-polyfill-mock.ts");

export default defineConfig({
  test: {
    passWithNoTests: true,
    clearMocks: true,
    projects: [
      {
        test: {
          // Unit tests: XState machines, storage module, schema validation, utilities
          // Run in Node -- no browser needed for pure logic
          name: "unit",
          include: ["tests/unit/**/*.test.ts", "src/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          // Component tests: React components rendered in a real browser
          // Uses Playwright + Chromium via vitest-browser-react
          name: "browser",
          include: ["tests/browser/**/*.test.tsx", "src/**/*.test.tsx"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          // Storybook stories as tests via @storybook/addon-vitest
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
        resolve: {
          alias: {
            "webextension-polyfill": webExtPolyfillMock,
          },
        },
      },
    ],
  },
});
