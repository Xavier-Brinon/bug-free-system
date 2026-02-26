import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BookCard } from "./BookCard";

const meta = {
  title: "Components/BookCard",
  component: BookCard,
  args: {
    onEdit: fn(),
    onDelete: fn(),
    onStatusChange: fn(),
  },
} satisfies Meta<typeof BookCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A book the user wants to read. */
export const WantToRead: Story = {
  args: {
    book: {
      id: "book-1",
      title: "Neuromancer",
      authors: ["William Gibson"],
      status: "want_to_read",
      addedAt: "2026-02-01T12:00:00Z",
      tags: [],
      priority: 0,
    },
  },
};

/** A book the user is currently reading. */
export const Reading: Story = {
  args: {
    book: {
      id: "book-2",
      title: "Dune",
      authors: ["Frank Herbert"],
      coverUrl: "https://covers.openlibrary.org/b/id/6424015-M.jpg",
      status: "reading",
      addedAt: "2026-01-15T10:00:00Z",
      startedAt: "2026-01-20T08:00:00Z",
      tags: [],
      priority: 0,
    },
  },
};

/** A book the user has finished reading. */
export const Read: Story = {
  args: {
    book: {
      id: "book-3",
      title: "The Left Hand of Darkness",
      authors: ["Ursula K. Le Guin"],
      status: "read",
      addedAt: "2025-12-01T09:00:00Z",
      startedAt: "2025-12-05T08:00:00Z",
      finishedAt: "2026-01-10T22:00:00Z",
      tags: [],
      priority: 0,
    },
  },
};

/** A queued book with an intention note. */
export const WithQueueNote: Story = {
  args: {
    book: {
      id: "book-5",
      title: "Neuromancer",
      authors: ["William Gibson"],
      status: "want_to_read",
      addedAt: "2026-02-01T12:00:00Z",
      tags: [],
      priority: 0,
      queueNote: "Classic cyberpunk — recommended by a friend at the book club",
    },
  },
};

/** A book with multiple authors. */
export const MultipleAuthors: Story = {
  args: {
    book: {
      id: "book-4",
      title: "Good Omens",
      authors: ["Terry Pratchett", "Neil Gaiman"],
      status: "want_to_read",
      addedAt: "2026-02-15T14:00:00Z",
      tags: [],
      priority: 0,
    },
  },
};
