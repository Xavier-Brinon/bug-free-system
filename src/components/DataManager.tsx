type DataManagerProps = {
  onExport: () => void;
  onFileSelected: (content: string) => void;
  onConfirmImport: () => void;
  onCancelImport: () => void;
  importError: string | null;
  importPreview: { bookCount: number } | null;
  currentBookCount: number;
};

export function DataManager({
  onExport,
  onFileSelected,
  onConfirmImport,
  onCancelImport,
  importError,
  importPreview,
  currentBookCount,
}: DataManagerProps) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onFileSelected(reader.result);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="data-manager">
      <section className="data-export">
        <h3>Export</h3>
        <p>Your library has {currentBookCount} books</p>
        <button type="button" onClick={onExport}>
          Export Library
        </button>
      </section>

      <section className="data-import">
        <h3>Import</h3>
        <label htmlFor="import-file">Import file</label>
        <input id="import-file" type="file" accept=".json" onChange={handleFileChange} />

        {importError && (
          <div role="alert" className="import-error">
            <p>{importError}</p>
          </div>
        )}

        {importPreview && (
          <div className="import-preview">
            <p>
              This will replace your {currentBookCount} books with {importPreview.bookCount} books
              from the import file.
            </p>
            <p>A backup of your current data will be downloaded first.</p>
            <div className="import-actions">
              <button type="button" onClick={onConfirmImport}>
                Confirm Import
              </button>
              <button type="button" onClick={onCancelImport}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
