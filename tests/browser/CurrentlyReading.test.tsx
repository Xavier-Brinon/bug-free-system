import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { CurrentlyReading } from "../../src/components/CurrentlyReading";
import type { BookRecord, BookStatus } from "../../src/schema";

function makeBook(overrides: Partial<BookRecord> = {}): BookRecord {
  return {
    id: "book-1",
    title: "Dune",
    authors: ["Frank Herbert"],
    status: "reading" as BookStatus,
    addedAt: "2026-01-01T00:00:00Z",
    tags: [],
    priority: 0,
    ...overrides,
  };
}

describe("CurrentlyReading", () => {
  it("renders the book title as a prominent heading", async () => {
    const book = makeBook({ title: "Dune" });
    render(
      <CurrentlyReading
        book={book}
        onStatusChange={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    const heading = page.getByRole("heading", { name: "Dune" });
    await expect.element(heading).toBeVisible();
  });

  it("renders the author(s) below the title", async () => {
    const book = makeBook({ authors: ["Frank Herbert", "Brian Herbert"] });
    render(
      <CurrentlyReading
        book={book}
        onStatusChange={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    await expect.element(page.getByText("Frank Herbert, Brian Herbert")).toBeVisible();
  });

  it("renders the cover image when coverUrl is provided", async () => {
    const book = makeBook({ coverUrl: "https://example.com/cover.jpg" });
    render(
      <CurrentlyReading
        book={book}
        onStatusChange={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    const img = page.getByRole("img", { name: "Dune" });
    await expect.element(img).toBeVisible();
    await expect.element(img).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("does not render an img element when coverUrl is absent", async () => {
    const book = makeBook({ coverUrl: undefined });
    render(
      <CurrentlyReading
        book={book}
        onStatusChange={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    await expect.element(page.getByRole("img")).not.toBeInTheDocument();
  });

  it("shows a 'Mark as Read' button that calls onStatusChange with 'read'", async () => {
    const onStatusChange = vi.fn();
    const book = makeBook({ id: "abc-123" });
    render(
      <CurrentlyReading
        book={book}
        onStatusChange={onStatusChange}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    await page.getByRole("button", { name: "Mark as Read" }).click();
    expect(onStatusChange).toHaveBeenCalledWith("abc-123", "read");
  });

  it("shows an 'Edit' button that calls onEdit with the book id", async () => {
    const onEdit = vi.fn();
    const book = makeBook({ id: "abc-123" });
    render(
      <CurrentlyReading
        book={book}
        onStatusChange={() => {}}
        onEdit={onEdit}
        onDelete={() => {}}
      />,
    );

    await page.getByRole("button", { name: "Edit" }).click();
    expect(onEdit).toHaveBeenCalledWith("abc-123");
  });

  it("shows a 'Delete' button that calls onDelete with the book id", async () => {
    const onDelete = vi.fn();
    const book = makeBook({ id: "abc-123" });
    render(
      <CurrentlyReading
        book={book}
        onStatusChange={() => {}}
        onEdit={() => {}}
        onDelete={onDelete}
      />,
    );

    await page.getByRole("button", { name: "Delete" }).click();
    expect(onDelete).toHaveBeenCalledWith("abc-123");
  });
});
