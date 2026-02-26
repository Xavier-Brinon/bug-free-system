import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
  viteFinal(config) {
    // Replace webextension-polyfill with a mock in Storybook context.
    // The real polyfill throws when loaded outside an extension environment.
    config.resolve ??= {};
    config.resolve.alias ??= {};
    (config.resolve.alias as Record<string, string>)["webextension-polyfill"] = path.resolve(
      dirname,
      "webextension-polyfill-mock.ts",
    );
    return config;
  },
};

export default config;
