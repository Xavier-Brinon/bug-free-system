import { describe, it, expect } from "vitest";
import { createActor } from "xstate";
import { libraryMachine } from "../../src/machines/libraryMachine";
import { createBookRecord } from "../../src/schema";

describe("libraryMachine", () => {
  it("starts in 'idle' state with books from input", () => {
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    const actor = createActor(libraryMachine, {
      input: { books: { [book.id]: book } },
    });
    actor.start();

    expect(actor.getSnapshot().value).toBe("idle");
    expect(actor.getSnapshot().context.books).toEqual({ [book.id]: book });

    actor.stop();
  });

  it("ADD_BOOK adds a BookRecord to context.books keyed by id", () => {
    const actor = createActor(libraryMachine, {
      input: { books: {} },
    });
    actor.start();

    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    actor.send({ type: "ADD_BOOK", book });

    const { books } = actor.getSnapshot().context;
    expect(books[book.id]).toEqual(book);

    actor.stop();
  });

  it("UPDATE_BOOK merges updates into an existing book", () => {
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    const actor = createActor(libraryMachine, {
      input: { books: { [book.id]: book } },
    });
    actor.start();

    actor.send({
      type: "UPDATE_BOOK",
      id: book.id,
      updates: { title: "Dune Messiah", authors: ["Frank Herbert"] },
    });

    const updated = actor.getSnapshot().context.books[book.id];
    expect(updated.title).toBe("Dune Messiah");
    expect(updated.id).toBe(book.id);
    expect(updated.status).toBe(book.status);

    actor.stop();
  });

  it("UPDATE_BOOK for non-existent id does nothing", () => {
    const actor = createActor(libraryMachine, {
      input: { books: {} },
    });
    actor.start();

    actor.send({
      type: "UPDATE_BOOK",
      id: "non-existent",
      updates: { title: "Ghost" },
    });

    expect(Object.keys(actor.getSnapshot().context.books)).toHaveLength(0);

    actor.stop();
  });

  it("DELETE_BOOK removes a book by id", () => {
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    const actor = createActor(libraryMachine, {
      input: { books: { [book.id]: book } },
    });
    actor.start();

    actor.send({ type: "DELETE_BOOK", id: book.id });

    expect(actor.getSnapshot().context.books[book.id]).toBeUndefined();
    expect(Object.keys(actor.getSnapshot().context.books)).toHaveLength(0);

    actor.stop();
  });

  it("DELETE_BOOK for non-existent id does nothing", () => {
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    const actor = createActor(libraryMachine, {
      input: { books: { [book.id]: book } },
    });
    actor.start();

    actor.send({ type: "DELETE_BOOK", id: "non-existent" });

    expect(Object.keys(actor.getSnapshot().context.books)).toHaveLength(1);

    actor.stop();
  });

  it("SET_STATUS changes a book's status field", () => {
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    const actor = createActor(libraryMachine, {
      input: { books: { [book.id]: book } },
    });
    actor.start();

    actor.send({ type: "SET_STATUS", id: book.id, status: "reading" });

    expect(actor.getSnapshot().context.books[book.id].status).toBe("reading");

    actor.stop();
  });

  it("SET_STATUS to 'reading' sets startedAt if not already set", () => {
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    expect(book.startedAt).toBeUndefined();

    const actor = createActor(libraryMachine, {
      input: { books: { [book.id]: book } },
    });
    actor.start();

    const before = new Date().toISOString();
    actor.send({ type: "SET_STATUS", id: book.id, status: "reading" });
    const after = new Date().toISOString();

    const updated = actor.getSnapshot().context.books[book.id];
    expect(updated.startedAt).toBeTruthy();
    expect(updated.startedAt! >= before).toBe(true);
    expect(updated.startedAt! <= after).toBe(true);

    actor.stop();
  });

  it("SET_STATUS to 'read' sets finishedAt", () => {
    const book = createBookRecord({
      title: "Dune",
      authors: ["Frank Herbert"],
      status: "reading",
    });
    const actor = createActor(libraryMachine, {
      input: { books: { [book.id]: book } },
    });
    actor.start();

    const before = new Date().toISOString();
    actor.send({ type: "SET_STATUS", id: book.id, status: "read" });
    const after = new Date().toISOString();

    const updated = actor.getSnapshot().context.books[book.id];
    expect(updated.finishedAt).toBeTruthy();
    expect(updated.finishedAt! >= before).toBe(true);
    expect(updated.finishedAt! <= after).toBe(true);

    actor.stop();
  });

  it("emits SAVE_NEEDED after ADD_BOOK", () => {
    const actor = createActor(libraryMachine, {
      input: { books: {} },
    });

    const emitted: unknown[] = [];
    actor.on("SAVE_NEEDED", (event) => emitted.push(event));
    actor.start();

    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    actor.send({ type: "ADD_BOOK", book });

    expect(emitted).toHaveLength(1);

    actor.stop();
  });

  it("emits SAVE_NEEDED after DELETE_BOOK", () => {
    const book = createBookRecord({ title: "Dune", authors: ["Frank Herbert"] });
    const actor = createActor(libraryMachine, {
      input: { books: { [book.id]: book } },
    });

    const emitted: unknown[] = [];
    actor.on("SAVE_NEEDED", (event) => emitted.push(event));
    actor.start();

    actor.send({ type: "DELETE_BOOK", id: book.id });

    expect(emitted).toHaveLength(1);

    actor.stop();
  });
});
