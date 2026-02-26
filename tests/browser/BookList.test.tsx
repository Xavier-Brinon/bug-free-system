import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { BookList } from "../../src/components/BookList";
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

describe("BookList", () => {
  it("renders empty state message when books is empty", async () => {
    render(
      <BookList
        books={{}}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusChange={() => {}}
      />,
    );

    await expect.element(page.getByText("No books yet")).toBeVisible();
  });

  it("renders one BookCard per book in the record", async () => {
    const books: Record<string, BookRecord> = {
      "b1": makeBook({ id: "b1", title: "Dune" }),
      "b2": makeBook({ id: "b2", title: "Neuromancer", authors: ["William Gibson"] }),
    };
    render(
      <BookList
        books={books}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusChange={() => {}}
      />,
    );

    await expect.element(page.getByText("Dune")).toBeVisible();
    await expect.element(page.getByText("Neuromancer")).toBeVisible();
  });

  it("passes onEdit callback through to BookCard", async () => {
    const onEdit = vi.fn();
    const books: Record<string, BookRecord> = {
      "b1": makeBook({ id: "b1", title: "Dune" }),
    };
    render(
      <BookList
        books={books}
        onEdit={onEdit}
        onDelete={() => {}}
        onStatusChange={() => {}}
      />,
    );

    await page.getByRole("button", { name: "Edit" }).click();
    expect(onEdit).toHaveBeenCalledWith("b1");
  });

  it("passes onDelete callback through to BookCard", async () => {
    const onDelete = vi.fn();
    const books: Record<string, BookRecord> = {
      "b1": makeBook({ id: "b1", title: "Dune" }),
    };
    render(
      <BookList
        books={books}
        onEdit={() => {}}
        onDelete={onDelete}
        onStatusChange={() => {}}
      />,
    );

    await page.getByRole("button", { name: "Delete" }).click();
    expect(onDelete).toHaveBeenCalledWith("b1");
  });
});
