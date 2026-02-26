import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { QueueList } from "../../src/components/QueueList";
import type { BookRecord } from "../../src/schema";

function makeBook(overrides: Partial<BookRecord> = {}): BookRecord {
  return {
    id: "book-1",
    title: "Test Book",
    authors: ["Author One"],
    status: "want_to_read",
    addedAt: "2026-01-01T00:00:00.000Z",
    tags: [],
    priority: 0,
    ...overrides,
  };
}

describe("QueueList", () => {
  it("renders only want_to_read books, not reading or read books", async () => {
    const books: Record<string, BookRecord> = {
      "book-1": makeBook({ id: "book-1", title: "Queued Book", status: "want_to_read" }),
      "book-2": makeBook({ id: "book-2", title: "Reading Book", status: "reading" }),
      "book-3": makeBook({ id: "book-3", title: "Finished Book", status: "read" }),
    };

    render(
      <QueueList
        books={books}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        onEditNote={vi.fn()}
      />,
    );

    await expect.element(page.getByText("Queued Book")).toBeVisible();
    await expect.element(page.getByText("Reading Book")).not.toBeInTheDocument();
    await expect.element(page.getByText("Finished Book")).not.toBeInTheDocument();
  });

  it("shows empty state message when no books have want_to_read status", async () => {
    const books: Record<string, BookRecord> = {
      "book-1": makeBook({ id: "book-1", title: "Reading Book", status: "reading" }),
      "book-2": makeBook({ id: "book-2", title: "Finished Book", status: "read" }),
    };

    render(
      <QueueList
        books={books}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        onEditNote={vi.fn()}
      />,
    );

    await expect.element(page.getByText("No books in your queue")).toBeVisible();
  });

  it("shows empty state when books record is entirely empty", async () => {
    render(
      <QueueList
        books={{}}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        onEditNote={vi.fn()}
      />,
    );

    await expect.element(page.getByText("No books in your queue")).toBeVisible();
  });

  it("renders an Edit Note button for each queued book that calls onEditNote", async () => {
    const onEditNote = vi.fn();
    const books: Record<string, BookRecord> = {
      "book-1": makeBook({ id: "book-1", title: "Queued Book" }),
    };

    render(
      <QueueList
        books={books}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        onEditNote={onEditNote}
      />,
    );

    const editNoteButton = page.getByRole("button", { name: "Edit Note" });
    await expect.element(editNoteButton).toBeVisible();
    await editNoteButton.click();
    expect(onEditNote).toHaveBeenCalledWith("book-1");
  });

  it("displays the queue note text when a book has a queueNote", async () => {
    const books: Record<string, BookRecord> = {
      "book-1": makeBook({
        id: "book-1",
        title: "Queued Book",
        queueNote: "Recommended by a friend",
      }),
    };

    render(
      <QueueList
        books={books}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        onEditNote={vi.fn()}
      />,
    );

    await expect.element(page.getByText("Recommended by a friend")).toBeVisible();
  });
});
