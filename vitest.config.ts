import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    // Allow empty test suite to pass (needed before first test is written)
    passWithNoTests: true,
    // Clear mocks between tests
    clearMocks: true,
    projects: [
      {
        test: {
          // Unit tests: XState machines, storage module, schema validation, utilities
          // Run in Node -- no browser needed for pure logic
          name: 'unit',
          include: [
            'tests/unit/**/*.test.ts',
            'src/**/*.test.ts',
          ],
          environment: 'node',
        },
      },
      {
        test: {
          // Component tests: React components rendered in a real browser
          // Uses Playwright + Chromium via vitest-browser-react
          name: 'browser',
          include: [
            'tests/browser/**/*.test.tsx',
            'src/**/*.test.tsx',
          ],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: 'chromium' },
            ],
          },
        },
      },
    ],
  },
});
