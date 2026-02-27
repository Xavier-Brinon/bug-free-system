import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { EmptyHero } from "../../src/components/EmptyHero";
import { BookCard } from "../../src/components/BookCard";
import { BookForm } from "../../src/components/BookForm";
import "../../src/newtab/App.css";

describe("Focus states", () => {
  it("all buttons have transition properties for smooth visual feedback", async () => {
    // BookCard buttons previously had NO transition — only empty-hero and .app > button had one
    render(
      <BookCard
        book={{
          id: "1",
          title: "Test",
          authors: ["Author"],
          status: "reading",
          addedAt: "2026-01-01T00:00:00.000Z",
          coverUrl: null,
          queueNote: null,
        }}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusChange={() => {}}
      />,
    );

    const editButton = page.getByRole("button", { name: /edit/i });
    await expect.element(editButton).toBeVisible();

    const el = await editButton.element();
    const styles = getComputedStyle(el);

    // Should have a non-zero transition duration
    expect(styles.transitionDuration).not.toBe("0s");
  });

  it("focused buttons show an outline with offset for clear visibility", async () => {
    render(<EmptyHero onStartAdding={() => {}} />);

    const button = page.getByRole("button", { name: /add/i });
    await expect.element(button).toBeVisible();

    const el = await button.element();
    el.focus();

    const styles = getComputedStyle(el);
    // Custom focus ring should have an offset (not flush with the element)
    expect(styles.outlineOffset).not.toBe("0px");
  });

  it("focused form inputs show a visible border or outline change", async () => {
    render(<BookForm onSubmit={async () => {}} onCancel={() => {}} />);

    const input = page.getByRole("textbox", { name: /title/i });
    await expect.element(input).toBeVisible();

    const el = await input.element();
    el.focus();

    const styles = getComputedStyle(el);
    // Input should have a visible focus indicator
    const hasOutline = styles.outlineStyle !== "none" && styles.outlineWidth !== "0px";
    const hasBoxShadow = styles.boxShadow !== "none";
    expect(hasOutline || hasBoxShadow).toBe(true);
  });
});
