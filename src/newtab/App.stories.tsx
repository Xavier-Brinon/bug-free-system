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
 */
export const Loading: Story = {
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
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
 * Empty library state — the user has no books yet.
 * Shows "Add Book" button and empty state message.
 */
export const Empty: Story = {
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
 * Library with books in different reading statuses.
 */
export const WithBooks: Story = {
  decorators: [
    (Story) => {
      const dataWithBooks: BookTabData = {
        ...getDefaultData(),
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
          "book-3": {
            id: "book-3",
            title: "The Left Hand of Darkness",
            authors: ["Ursula K. Le Guin"],
            coverUrl: "https://covers.openlibrary.org/b/id/6424015-M.jpg",
            status: "read",
            addedAt: "2025-12-01T09:00:00Z",
            startedAt: "2025-12-05T08:00:00Z",
            finishedAt: "2026-01-10T22:00:00Z",
            tags: [],
            priority: 0,
          },
        },
      };
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            queryFn: () => Promise.resolve(dataWithBooks),
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
 * Error state when storage read fails.
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
