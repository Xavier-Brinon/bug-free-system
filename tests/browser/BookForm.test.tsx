import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { BookForm } from "../../src/components/BookForm";

describe("BookForm", () => {
  it("renders title, author, and cover URL inputs", async () => {
    render(<BookForm onSubmit={() => {}} onCancel={() => {}} />);

    await expect.element(page.getByLabelText("Title")).toBeVisible();
    await expect.element(page.getByLabelText("Author(s)")).toBeVisible();
    await expect.element(page.getByLabelText("Cover URL")).toBeVisible();
  });

  it("submit button is disabled when title is empty", async () => {
    render(<BookForm onSubmit={() => {}} onCancel={() => {}} />);

    await page.getByLabelText("Author(s)").fill("Frank Herbert");

    await expect.element(page.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("submit button is disabled when author is empty", async () => {
    render(<BookForm onSubmit={() => {}} onCancel={() => {}} />);

    await page.getByLabelText("Title").fill("Dune");

    await expect.element(page.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("submitting calls onSubmit with title, authors array, and coverUrl", async () => {
    const onSubmit = vi.fn();
    render(<BookForm onSubmit={onSubmit} onCancel={() => {}} />);

    await page.getByLabelText("Title").fill("Dune");
    await page.getByLabelText("Author(s)").fill("Frank Herbert");
    await page.getByLabelText("Cover URL").fill("https://example.com/cover.jpg");
    await page.getByRole("button", { name: "Save" }).click();

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Dune",
      authors: ["Frank Herbert"],
      coverUrl: "https://example.com/cover.jpg",
    });
  });

  it("splits comma-separated authors into an array", async () => {
    const onSubmit = vi.fn();
    render(<BookForm onSubmit={onSubmit} onCancel={() => {}} />);

    await page.getByLabelText("Title").fill("Dune");
    await page.getByLabelText("Author(s)").fill("Frank Herbert, Brian Herbert");
    await page.getByRole("button", { name: "Save" }).click();

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Dune",
      authors: ["Frank Herbert", "Brian Herbert"],
      coverUrl: undefined,
    });
  });

  it("pre-fills inputs when initialBook is provided", async () => {
    const book = {
      id: "test-id",
      title: "Dune",
      authors: ["Frank Herbert"],
      coverUrl: "https://example.com/cover.jpg",
      status: "reading" as const,
      addedAt: "2026-01-01T00:00:00Z",
      tags: [],
      priority: 0,
    };
    render(<BookForm onSubmit={() => {}} onCancel={() => {}} initialBook={book} />);

    await expect.element(page.getByLabelText("Title")).toHaveValue("Dune");
    await expect.element(page.getByLabelText("Author(s)")).toHaveValue("Frank Herbert");
    await expect
      .element(page.getByLabelText("Cover URL"))
      .toHaveValue("https://example.com/cover.jpg");
  });

  it("cancel button calls onCancel", async () => {
    const onCancel = vi.fn();
    render(<BookForm onSubmit={() => {}} onCancel={onCancel} />);

    await page.getByRole("button", { name: "Cancel" }).click();

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("submits without coverUrl when it is empty", async () => {
    const onSubmit = vi.fn();
    render(<BookForm onSubmit={onSubmit} onCancel={() => {}} />);

    await page.getByLabelText("Title").fill("Dune");
    await page.getByLabelText("Author(s)").fill("Frank Herbert");
    await page.getByRole("button", { name: "Save" }).click();

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Dune",
      authors: ["Frank Herbert"],
      coverUrl: undefined,
    });
  });
});
