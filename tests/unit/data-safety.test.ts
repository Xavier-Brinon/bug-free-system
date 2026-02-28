import { describe, it, expect } from "vitest";
import {
  exportToJson,
  parseImportFile,
  generateExportFilename,
  generateBackupFilename,
} from "../../src/data-safety";
import { bookTabDataSchema } from "../../src/schema";
import type { BookTabData } from "../../src/schema";

const sampleData: BookTabData = {
  schemaVersion: 1,
  books: {
    "book-1": {
      id: "book-1",
      title: "Dune",
      authors: ["Frank Herbert"],
      status: "reading",
      addedAt: "2026-02-25T10:00:00.000Z",
      tags: [],
      priority: 0,
    },
    "book-2": {
      id: "book-2",
      title: "Neuromancer",
      authors: ["William Gibson"],
      status: "want_to_read",
      addedAt: "2026-02-26T10:00:00.000Z",
      tags: [],
      priority: 0,
      queueNote: "Recommended by a friend",
    },
  },
  settings: {
    defaultView: "current",
  },
};

describe("exportToJson", () => {
  it("returns pretty-printed JSON string preserving all data", () => {
    const json = exportToJson(sampleData);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(sampleData);
  });

  it("output includes schemaVersion field", () => {
    const json = exportToJson(sampleData);
    const parsed = JSON.parse(json);
    expect(parsed.schemaVersion).toBe(1);
  });

  it("output is parseable back to valid BookTabData via Zod", () => {
    const json = exportToJson(sampleData);
    const parsed = JSON.parse(json);
    const result = bookTabDataSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });
});

describe("parseImportFile", () => {
  it("returns success with data for valid exported JSON", () => {
    const json = exportToJson(sampleData);
    const result = parseImportFile(json);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(sampleData);
    }
  });

  it("returns failure for invalid JSON string", () => {
    const result = parseImportFile("not json at all");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid JSON");
    }
  });

  it("returns failure for valid JSON with wrong shape", () => {
    const result = parseImportFile(JSON.stringify({ foo: "bar" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it("returns failure for missing schemaVersion", () => {
    const result = parseImportFile(
      JSON.stringify({ books: {}, settings: { defaultView: "current" } }),
    );
    expect(result.success).toBe(false);
  });

  it("returns failure for empty string", () => {
    const result = parseImportFile("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});

describe("generateExportFilename", () => {
  it("returns string matching pattern booktab-export-YYYY-MM-DD.json", () => {
    const filename = generateExportFilename();
    expect(filename).toMatch(/^booktab-export-\d{4}-\d{2}-\d{2}\.json$/);
  });
});

describe("generateBackupFilename", () => {
  it("returns string matching pattern booktab-backup-YYYY-MM-DD.json", () => {
    const filename = generateBackupFilename();
    expect(filename).toMatch(/^booktab-backup-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
