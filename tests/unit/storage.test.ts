import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";

// Mock browser.storage.local before importing storage module
const mockStorage: Record<string, unknown> = {};
vi.mock("webextension-polyfill", () => ({
  default: {
    storage: {
      local: {
        get: vi.fn(async (key: string) => {
          return key in mockStorage ? { [key]: mockStorage[key] } : {};
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          Object.assign(mockStorage, items);
        }),
      },
    },
  },
}));

import { createQueryClient, loadBookTabData, saveBookTabData } from "../../src/storage";
import { getDefaultData, STORAGE_KEY } from "../../src/schema";
import type { BookTabData } from "../../src/schema";

beforeEach(() => {
  // Clear mock storage between tests
  for (const key of Object.keys(mockStorage)) {
    delete mockStorage[key];
  }
  vi.clearAllMocks();
});

describe("createQueryClient", () => {
  it("returns a QueryClient instance", () => {
    const client = createQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
  });
});

describe("loadBookTabData", () => {
  it("returns default data when storage is empty", async () => {
    const data = await loadBookTabData();
    const expected = getDefaultData();
    expect(data).toEqual(expected);
    expect(data.schemaVersion).toBe(1);
  });

  it("returns stored data when it exists and is valid", async () => {
    const stored: BookTabData = {
      schemaVersion: 1,
      books: {
        "book-1": {
          id: "book-1",
          title: "Test Book",
          authors: ["Author"],
          status: "reading",
          addedAt: "2026-02-26T12:00:00Z",
          tags: [],
          priority: 1,
        },
      },
      settings: { defaultView: "queue" },
    };
    mockStorage[STORAGE_KEY] = stored;

    const data = await loadBookTabData();
    expect(data.books["book-1"].title).toBe("Test Book");
    expect(data.settings.defaultView).toBe("queue");
  });

  it("returns default data when stored data fails validation", async () => {
    mockStorage[STORAGE_KEY] = { invalid: "data" };

    const data = await loadBookTabData();
    expect(data).toEqual(getDefaultData());
  });
});

describe("saveBookTabData", () => {
  it("writes data to browser.storage.local", async () => {
    const data = getDefaultData();
    await saveBookTabData(data);
    expect(mockStorage[STORAGE_KEY]).toEqual(data);
  });

  it("persists data that can be loaded back", async () => {
    const data: BookTabData = {
      schemaVersion: 1,
      books: {
        "book-1": {
          id: "book-1",
          title: "Round Trip",
          authors: ["Test"],
          status: "read",
          addedAt: "2026-02-26T12:00:00Z",
          tags: ["test"],
          priority: 0,
        },
      },
      settings: { defaultView: "history" },
    };

    await saveBookTabData(data);
    const loaded = await loadBookTabData();
    expect(loaded).toEqual(data);
  });
});
