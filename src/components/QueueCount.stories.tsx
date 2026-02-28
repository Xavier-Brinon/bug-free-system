import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueueCount } from "./QueueCount";

const meta = {
  title: "Components/QueueCount",
  component: QueueCount,
} satisfies Meta<typeof QueueCount>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No books queued. */
export const ZeroBooks: Story = {
  args: { count: 0 },
};

/** One book queued (singular label). */
export const OneBook: Story = {
  args: { count: 1 },
};

/** Many books queued (plural label). */
export const ManyBooks: Story = {
  args: { count: 12 },
};
