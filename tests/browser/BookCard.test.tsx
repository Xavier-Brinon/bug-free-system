import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { BookCard } from "../../src/components/BookCard";
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

describe("BookCard", () => {
  it("renders the book title", async () => {
    const book = makeBook({ title: "Dune" });
    render(
      <BookCard
        book={book}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusChange={() => {}}
      />,
    );

    await expect.element(page.getByText("Dune")).toBeVisible();
  });

  it("renders the author(s) joined by comma", async () => {
    const book = makeBook({ authors: ["Frank Herbert", "Brian Herbert"] });
    render(
      <BookCard
        book={book}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusChange={() => {}}
      />,
    );

    await expect.element(page.getByText("Frank Herbert, Brian Herbert")).toBeVisible();
  });

  it("renders a status select showing the current status", async () => {
    const book = makeBook({ status: "want_to_read" });
    render(
      <BookCard
        book={book}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusChange={() => {}}
      />,
    );

    await expect.element(page.getByRole("combobox", { name: "Status" })).toHaveValue(
      "want_to_read",
    );
  });

  it("renders cover image when coverUrl is provided", async () => {
    const book = makeBook({ coverUrl: "https://example.com/cover.jpg" });
    render(
      <BookCard
        book={book}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusChange={() => {}}
      />,
    );

    const img = page.getByRole("img", { name: "Dune" });
    await expect.element(img).toBeVisible();
    await expect.element(img).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("does not render cover image when coverUrl is absent", async () => {
    const book = makeBook({ coverUrl: undefined });
    render(
      <BookCard
        book={book}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusChange={() => {}}
      />,
    );

    await expect.element(page.getByRole("img")).not.toBeInTheDocument();
  });

  it("clicking Edit button calls onEdit with the book's id", async () => {
    const onEdit = vi.fn();
    const book = makeBook({ id: "abc-123" });
    render(
      <BookCard
        book={book}
        onEdit={onEdit}
        onDelete={() => {}}
        onStatusChange={() => {}}
      />,
    );

    await page.getByRole("button", { name: "Edit" }).click();
    expect(onEdit).toHaveBeenCalledWith("abc-123");
  });

  it("clicking Delete button calls onDelete with the book's id", async () => {
    const onDelete = vi.fn();
    const book = makeBook({ id: "abc-123" });
    render(
      <BookCard
        book={book}
        onEdit={() => {}}
        onDelete={onDelete}
        onStatusChange={() => {}}
      />,
    );

    await page.getByRole("button", { name: "Delete" }).click();
    expect(onDelete).toHaveBeenCalledWith("abc-123");
  });

  it("changing status via select calls onStatusChange with new status", async () => {
    const onStatusChange = vi.fn();
    const book = makeBook({ id: "abc-123", status: "want_to_read" });
    render(
      <BookCard
        book={book}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusChange={onStatusChange}
      />,
    );

    await page.getByRole("combobox", { name: "Status" }).selectOptions("reading");
    expect(onStatusChange).toHaveBeenCalledWith("abc-123", "reading");
  });
});
