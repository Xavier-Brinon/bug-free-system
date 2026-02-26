import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { QueueCount } from "../../src/components/QueueCount";

describe("QueueCount", () => {
  it("renders '0 books to read' when count is 0", async () => {
    render(<QueueCount count={0} />);

    await expect.element(page.getByText("0 books to read")).toBeVisible();
  });

  it("renders '1 book to read' when count is 1 (singular)", async () => {
    render(<QueueCount count={1} />);

    await expect.element(page.getByText("1 book to read")).toBeVisible();
  });

  it("renders '5 books to read' when count is 5 (plural)", async () => {
    render(<QueueCount count={5} />);

    await expect.element(page.getByText("5 books to read")).toBeVisible();
  });

  it("renders the count number with a distinguishable class", async () => {
    render(<QueueCount count={12} />);

    const countSpan = page.getByText("12");
    await expect.element(countSpan).toBeVisible();
  });
});
