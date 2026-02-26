import { setup, assign, emit } from "xstate";
import type { BookRecord, BookStatus } from "../schema";

type LibraryContext = {
  books: Record<string, BookRecord>;
};

type LibraryInput = {
  books: Record<string, BookRecord>;
};

type LibraryEvent =
  | { type: "ADD_BOOK"; book: BookRecord }
  | { type: "UPDATE_BOOK"; id: string; updates: Partial<BookRecord> }
  | { type: "DELETE_BOOK"; id: string }
  | { type: "SET_STATUS"; id: string; status: BookStatus };

type LibraryEmittedEvent = { type: "SAVE_NEEDED" };

const emitSaveNeeded = emit({ type: "SAVE_NEEDED" } as LibraryEmittedEvent);

export const libraryMachine = setup({
  types: {
    context: {} as LibraryContext,
    input: {} as LibraryInput,
    events: {} as LibraryEvent,
    emitted: {} as LibraryEmittedEvent,
  },
}).createMachine({
  id: "library",
  initial: "idle",
  context: ({ input }) => ({
    books: input.books,
  }),
  states: {
    idle: {
      on: {
        ADD_BOOK: {
          actions: [
            assign({
              books: ({ context, event }) => ({
                ...context.books,
                [event.book.id]: event.book,
              }),
            }),
            emitSaveNeeded,
          ],
        },
        UPDATE_BOOK: {
          actions: [
            assign({
              books: ({ context, event }) => {
                const existing = context.books[event.id];
                if (!existing) return context.books;
                return {
                  ...context.books,
                  [event.id]: { ...existing, ...event.updates, id: event.id },
                };
              },
            }),
            emitSaveNeeded,
          ],
        },
        DELETE_BOOK: {
          actions: [
            assign({
              books: ({ context, event }) => {
                const { [event.id]: _, ...rest } = context.books;
                return rest;
              },
            }),
            emitSaveNeeded,
          ],
        },
        SET_STATUS: {
          actions: [
            assign({
              books: ({ context, event }) => {
                const existing = context.books[event.id];
                if (!existing) return context.books;
                const now = new Date().toISOString();
                return {
                  ...context.books,
                  [event.id]: {
                    ...existing,
                    status: event.status,
                    startedAt:
                      event.status === "reading" && !existing.startedAt ? now : existing.startedAt,
                    finishedAt: event.status === "read" ? now : existing.finishedAt,
                  },
                };
              },
            }),
            emitSaveNeeded,
          ],
        },
      },
    },
  },
});
