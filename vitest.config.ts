import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Match test files in tests/ directory and any .test.ts/.test.tsx files
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    // jsdom environment required for React component tests (@testing-library/react)
    environment: 'jsdom',
    // Setup file to import @testing-library/jest-dom matchers globally
    setupFiles: ['./tests/setup.ts'],
    // Clear mocks between tests
    clearMocks: true,
    // Allow empty test suite to pass (needed before first test is written)
    passWithNoTests: true,
  },
});
