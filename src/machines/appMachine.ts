import { setup, assign } from "xstate";
import type { BookTabData } from "../schema";

type AppContext = {
  data: BookTabData | null;
  error: string | null;
};

type AppEvent =
  | { type: "DATA_LOADED"; data: BookTabData }
  | { type: "DATA_FAILED"; error: string }
  | { type: "RETRY" };

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
      on: {
        DATA_LOADED: {
          actions: assign({
            data: ({ event }) => event.data,
          }),
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
