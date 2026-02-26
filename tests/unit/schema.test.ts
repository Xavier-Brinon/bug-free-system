import { describe, it, expect } from "vitest";
import { getDefaultData, STORAGE_KEY, bookTabDataSchema } from "../../src/schema";
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
