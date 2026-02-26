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

test("dashboard: empty state shows EmptyHero, queue count shows 0", async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [`--disable-extensions-except=${DIST_PATH}`, `--load-extension=${DIST_PATH}`],
  });

  const page = await context.newPage();
  await page.goto("chrome://newtab");

  // Empty state: EmptyHero should be visible
  await expect(page.locator("text=Nothing on the nightstand")).toBeVisible({ timeout: 10000 });

  // Queue count should show 0
  await expect(page.locator("text=0 books to read")).toBeVisible();

  await context.close();
});

test("dashboard: hero display updates when book status changes", async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [`--disable-extensions-except=${DIST_PATH}`, `--load-extension=${DIST_PATH}`],
  });

  const page = await context.newPage();
  await page.goto("chrome://newtab");

  // Start with empty state
  await expect(page.locator("text=Nothing on the nightstand")).toBeVisible({ timeout: 10000 });

  // Add a book — defaults to want_to_read
  await page.getByRole("button", { name: "Add Book" }).click();
  await page.getByLabel("Title").fill("Dune");
  await page.getByLabel("Author(s)").fill("Frank Herbert");
  await page.getByRole("button", { name: "Save" }).click();

  // Book added — queue count should show 1
  await expect(page.locator("text=1 book to read")).toBeVisible({ timeout: 5000 });

  // EmptyHero should still be visible (no book is "reading" yet)
  await expect(page.locator("text=Nothing on the nightstand")).toBeVisible();

  // Change status to "reading" via the BookCard select
  await page.getByRole("combobox", { name: "Status" }).selectOption("reading");

  // Hero should now show the book title prominently (h2 in the hero section)
  await expect(page.locator(".currently-reading h2", { hasText: "Dune" })).toBeVisible({
    timeout: 5000,
  });

  // Queue count should now be 0
  await expect(page.locator("text=0 books to read")).toBeVisible();

  // Mark as Read via the hero button
  await page.getByRole("button", { name: "Mark as Read" }).click();

  // Empty state should return
  await expect(page.locator("text=Nothing on the nightstand")).toBeVisible({ timeout: 5000 });

  // Clean up — delete the book
  await page.getByRole("button", { name: "Delete" }).click();

  await context.close();
});

test("queue: navigate to queue view and see queued books", async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [`--disable-extensions-except=${DIST_PATH}`, `--load-extension=${DIST_PATH}`],
  });

  const page = await context.newPage();
  await page.goto("chrome://newtab");

  // Add a book (defaults to want_to_read)
  await expect(page.locator("text=Nothing on the nightstand")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Add Book" }).click();
  await page.getByLabel("Title").fill("Neuromancer");
  await page.getByLabel("Author(s)").fill("William Gibson");
  await page.getByRole("button", { name: "Save" }).click();

  // Navigate to queue view
  await page.getByRole("button", { name: "View Queue" }).click();

  // Verify queue heading and book visible
  await expect(page.locator("text=Your Queue")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=Neuromancer")).toBeVisible();

  // Navigate back to dashboard
  await page.getByRole("button", { name: "Back to Dashboard" }).click();
  await expect(page.locator("text=Nothing on the nightstand")).toBeVisible({ timeout: 5000 });

  // Clean up
  await page.getByRole("button", { name: "Delete" }).click();

  await context.close();
});

test("queue: add an intention note to a queued book", async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [`--disable-extensions-except=${DIST_PATH}`, `--load-extension=${DIST_PATH}`],
  });

  const page = await context.newPage();
  await page.goto("chrome://newtab");

  // Add a book
  await expect(page.locator("text=Nothing on the nightstand")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Add Book" }).click();
  await page.getByLabel("Title").fill("Snow Crash");
  await page.getByLabel("Author(s)").fill("Neal Stephenson");
  await page.getByRole("button", { name: "Save" }).click();

  // Navigate to queue view
  await page.getByRole("button", { name: "View Queue" }).click();
  await expect(page.locator("text=Your Queue")).toBeVisible({ timeout: 5000 });

  // Click Edit Note
  await page.getByRole("button", { name: "Edit Note" }).click();

  // Type a note
  await expect(page.locator("text=Edit Note")).toBeVisible({ timeout: 5000 });
  await page.getByRole("textbox").fill("Recommended by a colleague");
  await page.getByRole("button", { name: "Save" }).click();

  // Verify note is visible in queue view
  await expect(page.locator("text=Recommended by a colleague")).toBeVisible({ timeout: 5000 });

  // Clean up — go back, delete
  await page.getByRole("button", { name: "Back to Dashboard" }).click();
  await page.getByRole("button", { name: "Delete" }).click();

  await context.close();
});

test("queue: note persists across page reloads", async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [`--disable-extensions-except=${DIST_PATH}`, `--load-extension=${DIST_PATH}`],
  });

  const page = await context.newPage();
  await page.goto("chrome://newtab");

  // Add a book
  await expect(page.locator("text=Nothing on the nightstand")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Add Book" }).click();
  await page.getByLabel("Title").fill("The Dispossessed");
  await page.getByLabel("Author(s)").fill("Ursula K. Le Guin");
  await page.getByRole("button", { name: "Save" }).click();

  // Navigate to queue, add a note
  await page.getByRole("button", { name: "View Queue" }).click();
  await expect(page.locator("text=Your Queue")).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: "Edit Note" }).click();
  await page.getByRole("textbox").fill("Explores anarchist society");
  await page.getByRole("button", { name: "Save" }).click();

  // Verify note is there
  await expect(page.locator("text=Explores anarchist society")).toBeVisible({ timeout: 5000 });

  // Reload the page
  await page.reload();

  // Navigate to queue again after reload
  await expect(page.locator("text=BookTab")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "View Queue" }).click();

  // Note should persist
  await expect(page.locator("text=Explores anarchist society")).toBeVisible({ timeout: 5000 });

  // Clean up
  await page.getByRole("button", { name: "Back to Dashboard" }).click();
  await page.getByRole("button", { name: "Delete" }).click();

  await context.close();
});
