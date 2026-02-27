import { describe, it, expect } from "vitest";
import { createActor } from "xstate";
import { appMachine } from "../../src/machines/appMachine";
import { getDefaultData } from "../../src/schema";

describe("appMachine", () => {
  it("starts in the loading state", () => {
    const actor = createActor(appMachine);
    actor.start();
    expect(actor.getSnapshot().value).toBe("loading");
    actor.stop();
  });

  it("transitions from loading to ready on DATA_LOADED", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    expect(actor.getSnapshot().matches("ready")).toBe(true);
    actor.stop();
  });

  it("transitions from loading to error on DATA_FAILED", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_FAILED", error: "Storage read failed" });
    expect(actor.getSnapshot().value).toBe("error");
    actor.stop();
  });

  it("transitions from error to loading on RETRY", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_FAILED", error: "Storage read failed" });
    expect(actor.getSnapshot().value).toBe("error");
    actor.send({ type: "RETRY" });
    expect(actor.getSnapshot().value).toBe("loading");
    actor.stop();
  });

  it("does NOT transition from ready on DATA_FAILED", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    expect(actor.getSnapshot().matches("ready")).toBe(true);
    actor.send({ type: "DATA_FAILED", error: "Should not transition" });
    expect(actor.getSnapshot().matches("ready")).toBe(true);
    actor.stop();
  });

  it("stores BookTabData in context when entering ready", () => {
    const data = getDefaultData();
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data });
    expect(actor.getSnapshot().context.data).toEqual(data);
    actor.stop();
  });

  it("handles DATA_LOADED in ready state (refreshes context)", () => {
    const initialData = getDefaultData();
    const updatedData = {
      ...getDefaultData(),
      books: {
        "book-1": {
          id: "book-1",
          title: "New Book",
          authors: ["Author"],
          status: "reading" as const,
          addedAt: "2026-02-26T12:00:00Z",
          tags: [],
          priority: 1,
        },
      },
    };

    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: initialData });
    expect(actor.getSnapshot().context.data).toEqual(initialData);

    actor.send({ type: "DATA_LOADED", data: updatedData });
    expect(actor.getSnapshot().matches("ready")).toBe(true);
    expect(actor.getSnapshot().context.data).toEqual(updatedData);
    actor.stop();
  });

  it("ready state has initial sub-state viewing", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    expect(actor.getSnapshot().matches({ ready: "viewing" })).toBe(true);
    actor.stop();
  });

  it("START_ADD transitions from ready.viewing to ready.adding", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "START_ADD" });
    expect(actor.getSnapshot().matches({ ready: "adding" })).toBe(true);
    actor.stop();
  });

  it("START_EDIT transitions to ready.editing and stores editingBookId", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "START_EDIT", bookId: "book-42" });
    expect(actor.getSnapshot().matches({ ready: "editing" })).toBe(true);
    expect(actor.getSnapshot().context.editingBookId).toBe("book-42");
    actor.stop();
  });

  it("CANCEL_FORM transitions from ready.adding to ready.viewing", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "START_ADD" });
    actor.send({ type: "CANCEL_FORM" });
    expect(actor.getSnapshot().matches({ ready: "viewing" })).toBe(true);
    actor.stop();
  });

  it("CANCEL_FORM transitions from ready.editing to ready.viewing and clears editingBookId", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "START_EDIT", bookId: "book-42" });
    actor.send({ type: "CANCEL_FORM" });
    expect(actor.getSnapshot().matches({ ready: "viewing" })).toBe(true);
    expect(actor.getSnapshot().context.editingBookId).toBeNull();
    actor.stop();
  });

  it("BOOK_SAVED transitions from ready.adding to ready.viewing", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "START_ADD" });
    actor.send({ type: "BOOK_SAVED" });
    expect(actor.getSnapshot().matches({ ready: "viewing" })).toBe(true);
    actor.stop();
  });

  it("VIEW_QUEUE transitions from ready.viewing to ready.viewingQueue", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_QUEUE" });
    expect(actor.getSnapshot().matches({ ready: "viewingQueue" })).toBe(true);
    actor.stop();
  });

  it("BACK_TO_DASHBOARD transitions from ready.viewingQueue to ready.viewing", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_QUEUE" });
    actor.send({ type: "BACK_TO_DASHBOARD" });
    expect(actor.getSnapshot().matches({ ready: "viewing" })).toBe(true);
    actor.stop();
  });

  it("EDIT_NOTE transitions to ready.editingNote with book id in context", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_QUEUE" });
    actor.send({ type: "EDIT_NOTE", bookId: "book-99" });
    expect(actor.getSnapshot().matches({ ready: "editingNote" })).toBe(true);
    expect(actor.getSnapshot().context.editingNoteBookId).toBe("book-99");
    actor.stop();
  });

  it("NOTE_SAVED transitions back to ready.viewingQueue and clears editingNoteBookId", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_QUEUE" });
    actor.send({ type: "EDIT_NOTE", bookId: "book-99" });
    actor.send({ type: "NOTE_SAVED" });
    expect(actor.getSnapshot().matches({ ready: "viewingQueue" })).toBe(true);
    expect(actor.getSnapshot().context.editingNoteBookId).toBeNull();
    actor.stop();
  });

  it("CANCEL_NOTE transitions back to ready.viewingQueue and clears editingNoteBookId", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_QUEUE" });
    actor.send({ type: "EDIT_NOTE", bookId: "book-99" });
    actor.send({ type: "CANCEL_NOTE" });
    expect(actor.getSnapshot().matches({ ready: "viewingQueue" })).toBe(true);
    expect(actor.getSnapshot().context.editingNoteBookId).toBeNull();
    actor.stop();
  });

  // Data management states
  it("VIEW_DATA transitions from ready.viewing to ready.viewingData", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_DATA" });
    expect(actor.getSnapshot().matches({ ready: "viewingData" })).toBe(true);
    actor.stop();
  });

  it("BACK_TO_DASHBOARD transitions from ready.viewingData to ready.viewing", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_DATA" });
    actor.send({ type: "BACK_TO_DASHBOARD" });
    expect(actor.getSnapshot().matches({ ready: "viewing" })).toBe(true);
    actor.stop();
  });

  it("IMPORT_VALIDATED stores importPreview in context", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_DATA" });
    actor.send({ type: "IMPORT_VALIDATED", importPreview: { bookCount: 3 } });
    expect(actor.getSnapshot().context.importPreview).toEqual({ bookCount: 3 });
    expect(actor.getSnapshot().matches({ ready: "viewingData" })).toBe(true);
    actor.stop();
  });

  it("IMPORT_FAILED stores importError in context", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_DATA" });
    actor.send({ type: "IMPORT_FAILED", error: "Invalid file" });
    expect(actor.getSnapshot().context.importError).toBe("Invalid file");
    expect(actor.getSnapshot().matches({ ready: "viewingData" })).toBe(true);
    actor.stop();
  });

  it("IMPORT_COMPLETE clears importPreview", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_DATA" });
    actor.send({ type: "IMPORT_VALIDATED", importPreview: { bookCount: 3 } });
    actor.send({ type: "IMPORT_COMPLETE" });
    expect(actor.getSnapshot().context.importPreview).toBeNull();
    expect(actor.getSnapshot().matches({ ready: "viewingData" })).toBe(true);
    actor.stop();
  });

  it("CLEAR_IMPORT_ERROR clears importError", () => {
    const actor = createActor(appMachine);
    actor.start();
    actor.send({ type: "DATA_LOADED", data: getDefaultData() });
    actor.send({ type: "VIEW_DATA" });
    actor.send({ type: "IMPORT_FAILED", error: "Invalid file" });
    actor.send({ type: "CLEAR_IMPORT_ERROR" });
    expect(actor.getSnapshot().context.importError).toBeNull();
    expect(actor.getSnapshot().matches({ ready: "viewingData" })).toBe(true);
    actor.stop();
  });
});
