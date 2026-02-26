import { useState } from "react";

type QueueNoteEditorProps = {
  bookId: string;
  initialNote: string;
  onSave: (bookId: string, note: string) => void;
  onCancel: () => void;
};

export function QueueNoteEditor({ bookId, initialNote, onSave, onCancel }: QueueNoteEditorProps) {
  const [note, setNote] = useState(initialNote);

  return (
    <div className="queue-note-editor">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Why do you want to read this?"
      />
      <div>
        <button type="button" onClick={() => onSave(bookId, note)}>
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
