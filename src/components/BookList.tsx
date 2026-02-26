import type { BookRecord, BookStatus } from "../schema";
import { BookCard } from "./BookCard";

type BookListProps = {
  books: Record<string, BookRecord>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: BookStatus) => void;
};

export function BookList({ books, onEdit, onDelete, onStatusChange }: BookListProps) {
  const bookList = Object.values(books);

  if (bookList.length === 0) {
    return <p>No books yet</p>;
  }

  return (
    <div>
      {bookList.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
