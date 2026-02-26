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
    expect(actor.getSnapshot().value).toBe("ready");
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
    expect(actor.getSnapshot().value).toBe("ready");
    actor.send({ type: "DATA_FAILED", error: "Should not transition" });
    expect(actor.getSnapshot().value).toBe("ready");
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
    expect(actor.getSnapshot().value).toBe("ready");
    expect(actor.getSnapshot().context.data).toEqual(updatedData);
    actor.stop();
  });
});
