import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EmptyHero } from "./EmptyHero";

const meta = {
  title: "Components/EmptyHero",
  component: EmptyHero,
  args: {
    onStartAdding: fn(),
  },
} satisfies Meta<typeof EmptyHero>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default empty state — no book is currently being read. */
export const Default: Story = {};
