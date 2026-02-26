import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { EmptyHero } from "../../src/components/EmptyHero";

describe("EmptyHero", () => {
  it("renders a heading with an encouraging message", async () => {
    render(<EmptyHero onStartAdding={() => {}} />);

    const heading = page.getByRole("heading");
    await expect.element(heading).toBeVisible();
  });

  it("renders a descriptive prompt suggesting the user pick a book", async () => {
    render(<EmptyHero onStartAdding={() => {}} />);

    await expect.element(page.getByText(/pick|start|read/i)).toBeVisible();
  });

  it("renders a call-to-action button", async () => {
    render(<EmptyHero onStartAdding={() => {}} />);

    await expect.element(page.getByRole("button", { name: /add/i })).toBeVisible();
  });

  it("clicking the CTA button calls onStartAdding", async () => {
    const onStartAdding = vi.fn();
    render(<EmptyHero onStartAdding={onStartAdding} />);

    await page.getByRole("button", { name: /add/i }).click();
    expect(onStartAdding).toHaveBeenCalledOnce();
  });
});
