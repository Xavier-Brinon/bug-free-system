import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BookForm } from "./BookForm";

const meta = {
  title: "Components/BookForm",
  component: BookForm,
  args: {
    onSubmit: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof BookForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty form for adding a new book. */
export const AddMode: Story = {};

/** Pre-filled form for editing an existing book. */
export const EditMode: Story = {
  args: {
    initialBook: {
      id: "book-1",
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
