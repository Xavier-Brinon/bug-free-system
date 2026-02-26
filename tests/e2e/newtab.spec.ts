import path from "node:path";
import { test, expect, chromium } from "@playwright/test";

const DIST_PATH = path.resolve("dist");

test("extension loads and renders BookTab on new tab", async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [`--disable-extensions-except=${DIST_PATH}`, `--load-extension=${DIST_PATH}`],
  });

  // Open a new tab — the extension should override it
  const page = await context.newPage();

  // Navigate to chrome://newtab to trigger the extension's new tab override
  await page.goto("chrome://newtab");

  // Wait for the BookTab content to appear
  // The app starts in loading state, then transitions to ready
  await expect(page.locator("text=BookTab")).toBeVisible({ timeout: 10000 });

  await context.close();
});
