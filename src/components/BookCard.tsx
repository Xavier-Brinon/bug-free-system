import type { BookRecord, BookStatus } from "../schema";

const STATUS_LABELS: Record<BookStatus, string> = {
  want_to_read: "Want to Read",
  reading: "Reading",
  read: "Read",
};

type BookCardProps = {
  book: BookRecord;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: BookStatus) => void;
};

export function BookCard({ book, onEdit, onDelete, onStatusChange }: BookCardProps) {
  return (
    <article>
      {book.coverUrl && <img src={book.coverUrl} alt={book.title} />}
      <h3>{book.title}</h3>
      <p>{book.authors.join(", ")}</p>
      <div>
        <label htmlFor={`status-${book.id}`}>Status</label>
        <select
          id={`status-${book.id}`}
          value={book.status}
          onChange={(e) => onStatusChange(book.id, e.target.value as BookStatus)}
        >
          <option value="want_to_read">{STATUS_LABELS.want_to_read}</option>
          <option value="reading">{STATUS_LABELS.reading}</option>
          <option value="read">{STATUS_LABELS.read}</option>
        </select>
      </div>
      <div>
        <button type="button" onClick={() => onEdit(book.id)}>
          Edit
        </button>
        <button type="button" onClick={() => onDelete(book.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
