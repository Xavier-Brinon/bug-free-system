import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { QueueList } from "./QueueList";
import type { BookRecord } from "../schema";

const noopCallbacks = {
  onEdit: fn(),
  onDelete: fn(),
  onStatusChange: fn(),
  onEditNote: fn(),
};

function makeBook(overrides: Partial<BookRecord> = {}): BookRecord {
  return {
    id: "book-1",
    title: "Test Book",
    authors: ["Author"],
    status: "want_to_read",
    addedAt: "2026-01-01T00:00:00.000Z",
    tags: [],
    priority: 0,
    ...overrides,
  };
}

const meta = {
  title: "Components/QueueList",
  component: QueueList,
} satisfies Meta<typeof QueueList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Queue with several books, some with notes. */
export const WithQueuedBooks: Story = {
  args: {
    books: {
      "book-1": makeBook({
        id: "book-1",
        title: "Neuromancer",
        authors: ["William Gibson"],
        queueNote: "Classic cyberpunk — recommended by a friend",
      }),
      "book-2": makeBook({
        id: "book-2",
        title: "Snow Crash",
        authors: ["Neal Stephenson"],
      }),
      "book-3": makeBook({
        id: "book-3",
        title: "The Dispossessed",
        authors: ["Ursula K. Le Guin"],
        queueNote: "Explores anarchist society on another planet",
      }),
    },
    ...noopCallbacks,
  },
};

/** Empty queue — no books with want_to_read status. */
export const EmptyQueue: Story = {
  args: {
    books: {},
    ...noopCallbacks,
  },
};

/** Mixed statuses — only want_to_read books shown. */
export const MixedStatuses: Story = {
  args: {
    books: {
      "book-1": makeBook({
        id: "book-1",
        title: "Queued Book",
        status: "want_to_read",
      }),
      "book-2": makeBook({
        id: "book-2",
        title: "Currently Reading",
        status: "reading",
      }),
      "book-3": makeBook({
        id: "book-3",
        title: "Finished Book",
        status: "read",
      }),
    },
    ...noopCallbacks,
  },
};
