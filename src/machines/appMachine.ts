import { setup, assign } from "xstate";
import type { BookTabData } from "../schema";

type AppContext = {
  data: BookTabData | null;
  error: string | null;
  editingBookId: string | null;
};

type AppEvent =
  | { type: "DATA_LOADED"; data: BookTabData }
  | { type: "DATA_FAILED"; error: string }
  | { type: "RETRY" }
  | { type: "START_ADD" }
  | { type: "START_EDIT"; bookId: string }
  | { type: "CANCEL_FORM" }
  | { type: "BOOK_SAVED" };

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
