import { setup, assign } from "xstate";
import type { BookTabData } from "../schema";

type AppContext = {
  data: BookTabData | null;
  error: string | null;
  editingBookId: string | null;
  editingNoteBookId: string | null;
  importError: string | null;
  importPreview: { bookCount: number } | null;
};

type AppEvent =
  | { type: "DATA_LOADED"; data: BookTabData }
  | { type: "DATA_FAILED"; error: string }
  | { type: "RETRY" }
  | { type: "START_ADD" }
  | { type: "START_EDIT"; bookId: string }
  | { type: "CANCEL_FORM" }
  | { type: "BOOK_SAVED" }
  | { type: "VIEW_QUEUE" }
  | { type: "BACK_TO_DASHBOARD" }
  | { type: "EDIT_NOTE"; bookId: string }
  | { type: "NOTE_SAVED" }
  | { type: "CANCEL_NOTE" }
  | { type: "VIEW_DATA" }
  | { type: "IMPORT_VALIDATED"; importPreview: { bookCount: number } }
  | { type: "IMPORT_FAILED"; error: string }
  | { type: "IMPORT_COMPLETE" }
  | { type: "CLEAR_IMPORT_ERROR" };

export const appMachine = setup({
  types: {
    context: {} as AppContext,
    events: {} as AppEvent,
  },
}).createMachine({
  id: "app",
  initial: "loading",
  context: {
    data: null,
    error: null,
    editingBookId: null,
    editingNoteBookId: null,
    importError: null,
    importPreview: null,
  },
  states: {
    loading: {
      on: {
        DATA_LOADED: {
          target: "ready",
          actions: assign({
            data: ({ event }) => event.data,
            error: () => null,
          }),
        },
        DATA_FAILED: {
          target: "error",
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },
    ready: {
      initial: "viewing",
      on: {
        DATA_LOADED: {
          actions: assign({
            data: ({ event }) => event.data,
          }),
        },
      },
      states: {
        viewing: {
          on: {
            START_ADD: { target: "adding" },
            START_EDIT: {
              target: "editing",
              actions: assign({
                editingBookId: ({ event }) => event.bookId,
              }),
            },
            VIEW_QUEUE: { target: "viewingQueue" },
            VIEW_DATA: { target: "viewingData" },
          },
        },
        adding: {
          on: {
            CANCEL_FORM: { target: "viewing" },
            BOOK_SAVED: { target: "viewing" },
          },
        },
        editing: {
          on: {
            CANCEL_FORM: {
              target: "viewing",
              actions: assign({
                editingBookId: () => null,
              }),
            },
            BOOK_SAVED: {
              target: "viewing",
              actions: assign({
                editingBookId: () => null,
              }),
            },
          },
        },
        viewingQueue: {
          on: {
            BACK_TO_DASHBOARD: { target: "viewing" },
            EDIT_NOTE: {
              target: "editingNote",
              actions: assign({
                editingNoteBookId: ({ event }) => event.bookId,
              }),
            },
            START_ADD: { target: "adding" },
          },
        },
        editingNote: {
          on: {
            NOTE_SAVED: {
              target: "viewingQueue",
              actions: assign({
                editingNoteBookId: () => null,
              }),
            },
            CANCEL_NOTE: {
              target: "viewingQueue",
              actions: assign({
                editingNoteBookId: () => null,
              }),
            },
          },
        },
        viewingData: {
          on: {
            BACK_TO_DASHBOARD: {
              target: "viewing",
              actions: assign({
                importError: () => null,
                importPreview: () => null,
              }),
            },
            IMPORT_VALIDATED: {
              actions: assign({
                importPreview: ({ event }) => event.importPreview,
                importError: () => null,
              }),
            },
            IMPORT_FAILED: {
              actions: assign({
                importError: ({ event }) => event.error,
                importPreview: () => null,
              }),
            },
            IMPORT_COMPLETE: {
              actions: assign({
                importPreview: () => null,
              }),
            },
            CLEAR_IMPORT_ERROR: {
              actions: assign({
                importError: () => null,
              }),
            },
          },
        },
      },
    },
    error: {
      on: {
        RETRY: {
          target: "loading",
          actions: assign({
            error: () => null,
          }),
        },
      },
    },
  },
});
