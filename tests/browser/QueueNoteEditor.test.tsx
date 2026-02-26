import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { QueueNoteEditor } from "../../src/components/QueueNoteEditor";

describe("QueueNoteEditor", () => {
  it("renders a textarea with the initial note text", async () => {
    render(
      <QueueNoteEditor
        bookId="book-1"
        initialNote="Recommended by a friend"
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const textarea = page.getByRole("textbox");
    await expect.element(textarea).toBeVisible();
    await expect.element(textarea).toHaveValue("Recommended by a friend");
  });

  it("renders an empty textarea when initialNote is empty", async () => {
    render(<QueueNoteEditor bookId="book-1" initialNote="" onSave={vi.fn()} onCancel={vi.fn()} />);

    const textarea = page.getByRole("textbox");
    await expect.element(textarea).toBeVisible();
    await expect.element(textarea).toHaveValue("");
  });

  it("Save button calls onSave with bookId and current textarea value", async () => {
    const onSave = vi.fn();
    render(
      <QueueNoteEditor
        bookId="book-1"
        initialNote="Initial note"
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    const saveButton = page.getByRole("button", { name: "Save" });
    await saveButton.click();
    expect(onSave).toHaveBeenCalledWith("book-1", "Initial note");
  });

  it("Cancel button calls onCancel", async () => {
    const onCancel = vi.fn();
    render(<QueueNoteEditor bookId="book-1" initialNote="" onSave={vi.fn()} onCancel={onCancel} />);

    const cancelButton = page.getByRole("button", { name: "Cancel" });
    await cancelButton.click();
    expect(onCancel).toHaveBeenCalled();
  });

  it("user can type in the textarea and save the modified note", async () => {
    const onSave = vi.fn();
    render(<QueueNoteEditor bookId="book-1" initialNote="" onSave={onSave} onCancel={vi.fn()} />);

    const textarea = page.getByRole("textbox");
    await textarea.fill("A new reason to read this");

    const saveButton = page.getByRole("button", { name: "Save" });
    await saveButton.click();
    expect(onSave).toHaveBeenCalledWith("book-1", "A new reason to read this");
  });

  it("textarea has a placeholder for intention notes", async () => {
    render(<QueueNoteEditor bookId="book-1" initialNote="" onSave={vi.fn()} onCancel={vi.fn()} />);

    const textarea = page.getByPlaceholder("Why do you want to read this?");
    await expect.element(textarea).toBeVisible();
  });
});
