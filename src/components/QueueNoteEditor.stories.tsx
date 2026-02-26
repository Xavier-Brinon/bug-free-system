import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { QueueNoteEditor } from "./QueueNoteEditor";

const meta = {
  title: "Components/QueueNoteEditor",
  component: QueueNoteEditor,
} satisfies Meta<typeof QueueNoteEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty note — user starts writing a new intention note. */
export const EmptyNote: Story = {
  args: {
    bookId: "book-1",
    initialNote: "",
    onSave: fn(),
    onCancel: fn(),
  },
};

/** Existing note — pre-filled textarea for editing. */
export const ExistingNote: Story = {
  args: {
    bookId: "book-1",
    initialNote: "Recommended by a colleague — explores themes of identity and consciousness.",
    onSave: fn(),
    onCancel: fn(),
  },
};
