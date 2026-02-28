import { bookTabDataSchema } from "./schema";
import type { BookTabData } from "./schema";

export function exportToJson(data: BookTabData): string {
  return JSON.stringify(data, null, 2);
}

export function parseImportFile(
  content: string,
): { success: true; data: BookTabData } | { success: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    return { success: false, error: "Invalid JSON: the file is not valid JSON." };
  }

  const result = bookTabDataSchema.safeParse(raw);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const issues = result.error.issues.map((i) => i.message).join("; ");
  return {
    success: false,
    error: `Invalid BookTab data: ${issues}`,
  };
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function generateExportFilename(): string {
  return `booktab-export-${todayDateString()}.json`;
}

export function generateBackupFilename(): string {
  return `booktab-backup-${todayDateString()}.json`;
}

export function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
