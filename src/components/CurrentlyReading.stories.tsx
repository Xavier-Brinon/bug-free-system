import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { CurrentlyReading } from "./CurrentlyReading";

const meta = {
  title: "Components/CurrentlyReading",
  component: CurrentlyReading,
  args: {
    onStatusChange: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof CurrentlyReading>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hero display with a cover image. */
export const WithCover: Story = {
  args: {
    book: {
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

/** Hero display without a cover image. */
export const WithoutCover: Story = {
  args: {
    book: {
      id: "book-2",
      title: "Neuromancer",
      authors: ["William Gibson"],
      status: "reading",
      addedAt: "2026-02-01T12:00:00Z",
      startedAt: "2026-02-05T09:00:00Z",
      tags: [],
      priority: 0,
    },
  },
};
