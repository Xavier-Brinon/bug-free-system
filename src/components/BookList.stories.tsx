import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BookList } from "./BookList";

const meta = {
  title: "Components/BookList",
  component: BookList,
  args: {
    onEdit: fn(),
    onDelete: fn(),
    onStatusChange: fn(),
  },
} satisfies Meta<typeof BookList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty library — no books yet. */
export const Empty: Story = {
  args: {
    books: {},
  },
};

/** Library with books in different statuses. */
export const WithBooks: Story = {
  args: {
    books: {
      "book-1": {
        id: "book-1",
        title: "Dune",
        authors: ["Frank Herbert"],
        status: "reading",
        addedAt: "2026-01-15T10:00:00Z",
        startedAt: "2026-01-20T08:00:00Z",
        tags: [],
        priority: 0,
      },
      "book-2": {
        id: "book-2",
        title: "Neuromancer",
        authors: ["William Gibson"],
        status: "want_to_read",
        addedAt: "2026-02-01T12:00:00Z",
        tags: [],
        priority: 0,
      },
    },
  },
};
