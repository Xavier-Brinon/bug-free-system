import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { DataManager } from "../../src/components/DataManager";

const defaultProps = {
  onExport: vi.fn(),
  onFileSelected: vi.fn(),
  onConfirmImport: vi.fn(),
  onCancelImport: vi.fn(),
  importError: null as string | null,
  importPreview: null as { bookCount: number } | null,
  currentBookCount: 5,
};

describe("DataManager", () => {
  // Export section
  it("renders Export Library button", async () => {
    render(<DataManager {...defaultProps} />);
    await expect.element(page.getByRole("button", { name: "Export Library" })).toBeVisible();
  });

  it("clicking Export Library button calls onExport", async () => {
    const onExport = vi.fn();
    render(<DataManager {...defaultProps} onExport={onExport} />);
    await page.getByRole("button", { name: "Export Library" }).click();
    expect(onExport).toHaveBeenCalledOnce();
  });

  it("shows current library book count", async () => {
    render(<DataManager {...defaultProps} currentBookCount={5} />);
    await expect.element(page.getByText("Your library has 5 books")).toBeVisible();
  });

  // Import file selection
  it("renders file input that accepts only .json files", async () => {
    render(<DataManager {...defaultProps} />);
    const fileInput = page.getByLabelText("Import file");
    await expect.element(fileInput).toBeInTheDocument();
    expect(await fileInput.element()).toHaveAttribute("accept", ".json");
  });

  // Validation error display
  it("shows error message when importError is set", async () => {
    render(
      <DataManager {...defaultProps} importError="Invalid JSON: the file is not valid JSON." />,
    );
    await expect.element(page.getByText("Invalid JSON: the file is not valid JSON.")).toBeVisible();
  });

  it("does not show error section when importError is null", async () => {
    render(<DataManager {...defaultProps} importError={null} />);
    await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
  });

  // Import preview and confirmation
  it("shows preview with book count comparison when importPreview is set", async () => {
    render(<DataManager {...defaultProps} currentBookCount={5} importPreview={{ bookCount: 3 }} />);
    await expect.element(page.getByText(/replace your 5 books with 3 books/i)).toBeVisible();
  });

  it("shows Confirm Import and Cancel buttons in preview", async () => {
    render(<DataManager {...defaultProps} importPreview={{ bookCount: 3 }} />);
    await expect.element(page.getByRole("button", { name: "Confirm Import" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  it("clicking Confirm Import calls onConfirmImport", async () => {
    const onConfirmImport = vi.fn();
    render(
      <DataManager
        {...defaultProps}
        importPreview={{ bookCount: 3 }}
        onConfirmImport={onConfirmImport}
      />,
    );
    await page.getByRole("button", { name: "Confirm Import" }).click();
    expect(onConfirmImport).toHaveBeenCalledOnce();
  });

  it("clicking Cancel calls onCancelImport", async () => {
    const onCancelImport = vi.fn();
    render(
      <DataManager
        {...defaultProps}
        importPreview={{ bookCount: 3 }}
        onCancelImport={onCancelImport}
      />,
    );
    await page.getByRole("button", { name: "Cancel" }).click();
    expect(onCancelImport).toHaveBeenCalledOnce();
  });

  it("does not show preview section when importPreview is null", async () => {
    render(<DataManager {...defaultProps} importPreview={null} />);
    await expect
      .element(page.getByRole("button", { name: "Confirm Import" }))
      .not.toBeInTheDocument();
  });

  it("preview mentions backup will be created", async () => {
    render(<DataManager {...defaultProps} importPreview={{ bookCount: 3 }} />);
    await expect
      .element(page.getByText(/backup of your current data will be downloaded/i))
      .toBeVisible();
  });
});
