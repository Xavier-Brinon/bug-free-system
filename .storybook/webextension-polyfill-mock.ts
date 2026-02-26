/**
 * Mock for webextension-polyfill used in Storybook context.
 *
 * Storybook renders stories in a regular Chromium page (not an extension),
 * so the real polyfill throws "This script should only be loaded in a
 * browser extension." This mock provides no-op implementations of the
 * browser.storage.local API so stories can import App without crashing.
 *
 * Stories override queryFn in their decorators, so these mocks are never
 * actually called — they just prevent the import-time crash.
 */

const storageMock = {
  local: {
    get: async () => ({}),
    set: async () => {},
    remove: async () => {},
    clear: async () => {},
  },
};

const browser = {
  storage: storageMock,
  runtime: {
    id: "storybook-mock",
  },
};

export default browser;
