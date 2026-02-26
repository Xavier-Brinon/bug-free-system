import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { getDefaultData } from "../schema";
import type { BookTabData } from "../schema";

const meta = {
  title: "App",
  component: App,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The app starts in loading state while waiting for browser.storage.local
 * to resolve. This is the first thing the user sees on a new tab.
 *
 * Note: In Storybook, the loading state appears briefly before the mock
 * resolves. The query function intentionally never resolves to keep the
 * loading state visible.
 */
export const Loading: Story = {
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            // Never resolve — keeps loading state visible
            queryFn: () => new Promise<BookTabData>(() => {}),
          },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

/**
 * Ready state after data has loaded successfully. Shows the main app
 * interface with an empty library.
 */
export const Ready: Story = {
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            queryFn: () => Promise.resolve(getDefaultData()),
          },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

/**
 * Error state when storage read fails. Shows an error message with a
 * retry button.
 */
export const ErrorState: Story = {
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            queryFn: () => Promise.reject(new window.Error("Storage failed")),
          },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};
