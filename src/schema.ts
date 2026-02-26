import { z } from "zod";

// --- Constants ---

export const STORAGE_KEY = "booktab_data";

// --- Zod Schemas ---

const bookStatusSchema = z.enum(["want_to_read", "reading", "read"]);

const defaultViewSchema = z.enum(["current", "queue", "history"]);

const bookRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  coverUrl: z.string().optional(),
  isbn: z.string().optional(),
  externalId: z.string().optional(),
  status: bookStatusSchema,
  addedAt: z.string(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  tags: z.array(z.string()),
  priority: z.number(),
  queueNote: z.string().optional(),
  readingNotes: z.string().optional(),
  review: z.string().optional(),
});

const userSettingsSchema = z.object({
  defaultView: defaultViewSchema,
});

export const bookTabDataSchema = z.object({
  schemaVersion: z.number(),
  books: z.record(z.string(), bookRecordSchema),
  settings: userSettingsSchema,
});

// --- TypeScript Types (derived from Zod schemas) ---

export type BookStatus = z.infer<typeof bookStatusSchema>;
export type BookRecord = z.infer<typeof bookRecordSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type BookTabData = z.infer<typeof bookTabDataSchema>;

// --- Factories ---

export function createBookRecord(input: {
  title: string;
  authors: string[];
  coverUrl?: string;
  status?: BookStatus;
}): BookRecord {
  return {
    id: crypto.randomUUID(),
    title: input.title,
    authors: input.authors,
    coverUrl: input.coverUrl,
    status: input.status ?? "want_to_read",
    addedAt: new Date().toISOString(),
    tags: [],
    priority: 0,
  };
}

export function getDefaultData(): BookTabData {
  return {
    schemaVersion: 1,
    books: {},
    settings: {
      defaultView: "current",
    },
  };
}
