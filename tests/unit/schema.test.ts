import { describe, it, expect } from "vitest";
import { getDefaultData, STORAGE_KEY, bookTabDataSchema, createBookRecord } from "../../src/schema";
import type { BookTabData, BookRecord } from "../../src/schema";

describe("STORAGE_KEY", () => {
  it("equals 'booktab_data'", () => {
    expect(STORAGE_KEY).toBe("booktab_data");
  });
});

describe("getDefaultData", () => {
  it("returns an object with schemaVersion 1", () => {
    const data = getDefaultData();
    expect(data.schemaVersion).toBe(1);
  });

  it("returns an empty books record", () => {
    const data = getDefaultData();
    expect(data.books).toEqual({});
  });

  it("returns settings with defaultView 'current'", () => {
    const data = getDefaultData();
    expect(data.settings.defaultView).toBe("current");
  });
});

describe("bookTabDataSchema", () => {
  it("validates a correct BookTabData object", () => {
    const valid: BookTabData = {
      schemaVersion: 1,
      books: {},
      settings: { defaultView: "current" },
    };
    const result = bookTabDataSchema.parse(valid);
    expect(result.schemaVersion).toBe(1);
  });

  it("validates BookTabData with a book record", () => {
    const book: BookRecord = {
      id: "abc-123",
      title: "The Great Gatsby",
      authors: ["F. Scott Fitzgerald"],
      status: "reading",
      addedAt: "2026-02-26T12:00:00Z",
      tags: ["fiction", "classic"],
      priority: 1,
    };

    const valid: BookTabData = {
      schemaVersion: 1,
      books: { "abc-123": book },
      settings: { defaultView: "current" },
    };

    const result = bookTabDataSchema.parse(valid);
    expect(result.books["abc-123"].title).toBe("The Great Gatsby");
    expect(result.books["abc-123"].authors).toEqual(["F. Scott Fitzgerald"]);
  });

  it("rejects an object with missing schemaVersion", () => {
    const invalid = {
      books: {},
      settings: { defaultView: "current" },
    };
    expect(() => bookTabDataSchema.parse(invalid)).toThrow();
  });

  it("rejects a book with an invalid status value", () => {
    const invalid = {
      schemaVersion: 1,
      books: {
        "abc-123": {
          id: "abc-123",
          title: "Test",
          authors: [],
          status: "invalid_status",
          addedAt: "2026-02-26T12:00:00Z",
          tags: [],
          priority: 0,
        },
      },
      settings: { defaultView: "current" },
    };
    expect(() => bookTabDataSchema.parse(invalid)).toThrow();
  });

  it("accepts all valid status values", () => {
    for (const status of ["want_to_read", "reading", "read"] as const) {
      const data: BookTabData = {
        schemaVersion: 1,
        books: {
          "test-id": {
            id: "test-id",
            title: "Test",
            authors: [],
            status,
            addedAt: "2026-02-26T12:00:00Z",
            tags: [],
            priority: 0,
          },
        },
        settings: { defaultView: "current" },
      };
      expect(() => bookTabDataSchema.parse(data)).not.toThrow();
    }
  });

  it("accepts all valid defaultView values", () => {
    for (const defaultView of ["current", "queue", "history"] as const) {
      const data: BookTabData = {
        schemaVersion: 1,
        books: {},
        settings: { defaultView },
      };
      expect(() => bookTabDataSchema.parse(data)).not.toThrow();
    }
  });
});

describe("createBookRecord", () => {
  it("returns a BookRecord with the given title and authors", () => {
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    expect(book.title).toBe("Dune");
    expect(book.authors).toEqual(["Frank Herbert"]);
  });

  it("generates a unique id", () => {
    const book1 = createBookRecord({ title: "A", authors: ["X"] });
    const book2 = createBookRecord({ title: "B", authors: ["Y"] });
    expect(book1.id).toBeTruthy();
    expect(book2.id).toBeTruthy();
    expect(book1.id).not.toBe(book2.id);
  });

  it("sets status to 'want_to_read' by default", () => {
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    expect(book.status).toBe("want_to_read");
  });

  it("sets addedAt to a valid ISO timestamp", () => {
    const before = new Date().toISOString();
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    const after = new Date().toISOString();
    expect(book.addedAt >= before).toBe(true);
    expect(book.addedAt <= after).toBe(true);
  });

  it("sets empty defaults for tags and priority 0", () => {
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    expect(book.tags).toEqual([]);
    expect(book.priority).toBe(0);
  });

  it("allows overriding status and coverUrl", () => {
    const book = createBookRecord({
      title: "Dune",
      authors: ["Frank Herbert"],
      coverUrl: "https://example.com/cover.jpg",
      status: "reading",
    });
    expect(book.status).toBe("reading");
    expect(book.coverUrl).toBe("https://example.com/cover.jpg");
  });
});
