import type { BookRecord, BookStatus } from "../schema";
import { BookCard } from "./BookCard";

type QueueListProps = {
  books: Record<string, BookRecord>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: BookStatus) => void;
  onEditNote: (id: string) => void;
};

export function QueueList({ books, onEdit, onDelete, onStatusChange, onEditNote }: QueueListProps) {
  const queuedBooks = Object.values(books).filter((b) => b.status === "want_to_read");

  if (queuedBooks.length === 0) {
    return <p>No books in your queue</p>;
  }

  return (
    <div>
      {queuedBooks.map((book) => (
        <div key={book.id}>
          <BookCard
            book={book}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
          <button type="button" onClick={() => onEditNote(book.id)}>
            Edit Note
          </button>
        </div>
      ))}
    </div>
  );
}
