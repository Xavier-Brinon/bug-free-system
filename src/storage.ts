import { QueryClient } from "@tanstack/react-query";
import browser from "webextension-polyfill";
import { STORAGE_KEY, bookTabDataSchema, getDefaultData } from "./schema";
import type { BookTabData } from "./schema";

// --- Query Client Factory ---

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
      },
    },
  });
}

// --- Storage Access (sole entry point for browser.storage.local) ---

export async function loadBookTabData(): Promise<BookTabData> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const raw = result[STORAGE_KEY];

  if (!raw) {
    return getDefaultData();
  }

  const parsed = bookTabDataSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }

  // Invalid data in storage — return defaults rather than crash
  return getDefaultData();
}

export async function saveBookTabData(data: BookTabData): Promise<void> {
  try {
    await browser.storage.local.set({ [STORAGE_KEY]: data });
  } catch (error) {
    // Re-throw with context for quota errors or other storage failures
    throw new Error(
      `Failed to save BookTab data: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// --- TanStack Query Hooks (tested in component tests, not unit tests) ---

export const QUERY_KEY = ["booktab-data"] as const;
