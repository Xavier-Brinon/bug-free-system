import type { BookRecord, BookStatus } from "../schema";

type CurrentlyReadingProps = {
  book: BookRecord;
  onStatusChange: (id: string, status: BookStatus) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function CurrentlyReading({
  book,
  onStatusChange,
  onEdit,
  onDelete,
}: CurrentlyReadingProps) {
  return (
    <section className="currently-reading">
      {book.coverUrl && <img src={book.coverUrl} alt={book.title} />}
      <h2>{book.title}</h2>
      <p>{book.authors.join(", ")}</p>
      <div className="currently-reading-actions">
        <button type="button" onClick={() => onStatusChange(book.id, "read")}>
          Mark as Read
        </button>
        <button type="button" onClick={() => onEdit(book.id)}>
          Edit
        </button>
        <button type="button" onClick={() => onDelete(book.id)}>
          Delete
        </button>
      </div>
    </section>
  );
}
