import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DataManager } from "./DataManager";

const noopCallbacks = {
  onExport: fn(),
  onFileSelected: fn(),
  onConfirmImport: fn(),
  onCancelImport: fn(),
};

const meta = {
  title: "Components/DataManager",
  component: DataManager,
} satisfies Meta<typeof DataManager>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default state — no error, no preview, library has 5 books. */
export const Default: Story = {
  args: {
    ...noopCallbacks,
    importError: null,
    importPreview: null,
    currentBookCount: 5,
  },
};

/** Import failed — validation error message shown. */
export const WithImportError: Story = {
  args: {
    ...noopCallbacks,
    importError: "Invalid BookTab data: Expected number, received string",
    importPreview: null,
    currentBookCount: 5,
  },
};

/** Import validated — confirmation step showing book count comparison. */
export const WithImportPreview: Story = {
  args: {
    ...noopCallbacks,
    importError: null,
    importPreview: { bookCount: 3 },
    currentBookCount: 5,
  },
};

/** Empty library — export still available, 0 books. */
export const EmptyLibrary: Story = {
  args: {
    ...noopCallbacks,
    importError: null,
    importPreview: null,
    currentBookCount: 0,
  },
};
