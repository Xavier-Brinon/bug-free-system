import path from "node:path";
import { test, expect, chromium } from "@playwright/test";

const DIST_PATH = path.resolve("dist");

test("extension loads and renders BookTab on new tab", async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [`--disable-extensions-except=${DIST_PATH}`, `--load-extension=${DIST_PATH}`],
  });

  const page = await context.newPage();
  await page.goto("chrome://newtab");
  await expect(page.locator("text=BookTab")).toBeVisible({ timeout: 10000 });

  await context.close();
});

test("CRUD flow: add a book, verify it appears, delete it", async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [`--disable-extensions-except=${DIST_PATH}`, `--load-extension=${DIST_PATH}`],
  });

  const page = await context.newPage();
  await page.goto("chrome://newtab");

  // Wait for the ready state — empty library
  await expect(page.locator("text=No books yet")).toBeVisible({ timeout: 10000 });

  // Click "Add Book"
  await page.getByRole("button", { name: "Add Book" }).click();

  // Fill in the form
  await page.getByLabel("Title").fill("Dune");
  await page.getByLabel("Author(s)").fill("Frank Herbert");

  // Submit the form
  await page.getByRole("button", { name: "Save" }).click();

  // Verify the book appears in the list
  await expect(page.locator("text=Dune")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=Frank Herbert")).toBeVisible();

  // Delete the book
  await page.getByRole("button", { name: "Delete" }).click();

  // Verify the book is removed and empty state returns
  await expect(page.locator("text=No books yet")).toBeVisible({ timeout: 5000 });

  await context.close();
});
