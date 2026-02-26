import { useState } from "react";
import type { BookRecord } from "../schema";

export type BookFormData = {
  title: string;
  authors: string[];
  coverUrl?: string;
};

type BookFormProps = {
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
  initialBook?: BookRecord;
};

export function BookForm({ onSubmit, onCancel, initialBook }: BookFormProps) {
  const [title, setTitle] = useState(initialBook?.title ?? "");
  const [authorText, setAuthorText] = useState(initialBook?.authors.join(", ") ?? "");
  const [coverUrl, setCoverUrl] = useState(initialBook?.coverUrl ?? "");

  const isValid = title.trim() !== "" && authorText.trim() !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const authors = authorText
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    onSubmit({
      title: title.trim(),
      authors,
      coverUrl: coverUrl.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="book-title">Title</label>
        <input
          id="book-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="book-authors">Author(s)</label>
        <input
          id="book-authors"
          type="text"
          value={authorText}
          onChange={(e) => setAuthorText(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="book-cover-url">Cover URL</label>
        <input
          id="book-cover-url"
          type="text"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
        />
      </div>
      <div>
        <button type="submit" disabled={!isValid}>
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
