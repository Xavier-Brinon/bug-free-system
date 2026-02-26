import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { QUERY_KEY } from "../storage";
import { getDefaultData } from "../schema";
import type { BookTabData } from "../schema";

/**
 * Helper: create a QueryClient pre-seeded with data so the App component
 * skips the loading state and renders immediately in the desired state.
 *
 * We use setQueryData() rather than defaultOptions.queries.queryFn because
 * the App component specifies its own queryFn (loadBookTabData), which takes
 * precedence over defaultOptions.
 */
function createSeededClient(data: BookTabData): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(QUERY_KEY, data);
  return client;
}

const meta = {
  title: "App",
  component: App,
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The app starts in loading state while waiting for browser.storage.local
 * to resolve. We use a fresh QueryClient with no seeded data and staleTime
 * Infinity so the query stays pending.
 */
export const Loading: Story = {
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: Infinity, enabled: false },
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
 * Dashboard with no books — shows EmptyHero prompt and QueueCount at 0.
 */
export const DashboardEmpty: Story = {
  decorators: [
    (Story) => {
      const queryClient = createSeededClient(getDefaultData());
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

/**
 * Dashboard with a currently-reading book in the hero section,
 * plus books in other statuses. QueueCount shows want_to_read count.
 */
export const DashboardReading: Story = {
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
      const queryClient = createSeededClient(dataWithBooks);
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

/**
 * Dashboard with queued books but nothing currently being read.
 * Shows EmptyHero + QueueCount with a non-zero count.
 */
export const DashboardWithQueue: Story = {
  decorators: [
    (Story) => {
      const dataWithQueue: BookTabData = {
        ...getDefaultData(),
        books: {
          "book-1": {
            id: "book-1",
            title: "Neuromancer",
            authors: ["William Gibson"],
            status: "want_to_read",
            addedAt: "2026-02-01T12:00:00Z",
            tags: [],
            priority: 0,
          },
          "book-2": {
            id: "book-2",
            title: "Snow Crash",
            authors: ["Neal Stephenson"],
            status: "want_to_read",
            addedAt: "2026-02-10T14:00:00Z",
            tags: [],
            priority: 0,
          },
          "book-3": {
            id: "book-3",
            title: "The Left Hand of Darkness",
            authors: ["Ursula K. Le Guin"],
            status: "read",
            addedAt: "2025-12-01T09:00:00Z",
            startedAt: "2025-12-05T08:00:00Z",
            finishedAt: "2026-01-10T22:00:00Z",
            tags: [],
            priority: 0,
          },
        },
      };
      const queryClient = createSeededClient(dataWithQueue);
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

/**
 * Error state when storage read fails. We pre-set an error on the query
 * so the App component sees isError immediately.
 */
export const ErrorState: Story = {
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, enabled: false } },
      });
      queryClient.setQueryData(QUERY_KEY, undefined);
      queryClient.setQueryDefaults(QUERY_KEY, {
        queryFn: () => {
          throw new Error("Storage failed");
        },
      });
      // Force the query into error state
      queryClient.prefetchQuery({ queryKey: QUERY_KEY });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};
